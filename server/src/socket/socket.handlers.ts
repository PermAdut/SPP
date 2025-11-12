import { Server, Socket } from 'socket.io'
import taskDatabaseInstance from '../utils/taskDb'
import userDatabaseInstance from '../utils/userDb'
import jwtUtil from '../utils/jwt.util'
import { AppError } from '../middlewares/error.middleware'
import { IUser } from '../modules/users/user.interface'
import { ITask } from '../modules/tasks/task.interface'
import authService from '../modules/auth/auth.service'
import { LoginRequestDto } from '../modules/auth/dto/user.request.dto'
import upload from '../utils/multer'

interface AuthenticatedSocket extends Socket {
  userId?: number
  username?: string
  isAdmin?: boolean
  isAuthenticated?: boolean
}

export const authenticateSocket = async (socket: AuthenticatedSocket, token: string): Promise<void> => {
  try {
    const payload = await jwtUtil.verifyAccessToken(token)
    socket.userId = payload.id
    socket.username = payload.username
    const user = userDatabaseInstance.getById(payload.id)
    socket.isAdmin = user?.isAdmin || false
  } catch (err) {
    throw new AppError(401, 'Invalid token')
  }
}

export const setupAuthHandlers = (io: Server, socket: AuthenticatedSocket) => {
  socket.on('auth:login', async (credentials: LoginRequestDto) => {
    try {
      const response = await authService.loginUser(credentials)
      try {
        await authenticateSocket(socket, response.accessToken)
        socket.isAuthenticated = true
      } catch (authError) {}
      socket.emit('auth:login:response', {
        success: true,
        data: {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        },
      })
    } catch (error: any) {
      socket.emit('auth:login:response', {
        success: false,
        error: error.message || 'Login failed',
      })
    }
  })

  socket.on('auth:refresh', async (refreshToken: string) => {
    try {
      const response = await authService.generateNewAccessToken(refreshToken)
      socket.emit('auth:refresh:response', {
        success: true,
        data: {
          accessToken: response.accessToken,
        },
      })
    } catch (error: any) {
      socket.emit('auth:refresh:response', {
        success: false,
        error: error.message || 'Refresh failed',
      })
    }
  })
}

const checkAuth = (socket: AuthenticatedSocket): boolean => {
  if (!socket.isAuthenticated || socket.userId == null) {
    return false
  }
  return true
}

export const setupTaskHandlers = (io: Server, socket: AuthenticatedSocket) => {
  socket.on('tasks:getAll', () => {
    if (!checkAuth(socket)) {
      socket.emit('tasks:getAll:response', { success: false, error: 'Authentication required' })
      return
    }
    try {
      const tasks = taskDatabaseInstance.getAll(socket.userId)
      socket.emit('tasks:getAll:response', { success: true, data: tasks })
    } catch (error: any) {
      socket.emit('tasks:getAll:response', { success: false, error: error.message })
    }
  })

  socket.on('tasks:create', (taskData: Omit<ITask, 'id' | 'createdAt'>) => {
    if (!checkAuth(socket)) {
      socket.emit('tasks:create:response', { success: false, error: 'Authentication required' })
      return
    }
    try {
      if (!taskData.title || taskData.title.trim().length === 0) {
        throw new AppError(400, 'Название задачи обязательно')
      }
      if (taskData.title.length > 200) {
        throw new AppError(400, 'Название задачи не должно превышать 200 символов')
      }
      if (taskData.description && taskData.description.length > 1000) {
        throw new AppError(400, 'Описание не должно превышать 1000 символов')
      }
      if (!['low', 'medium', 'high'].includes(taskData.priority)) {
        throw new AppError(400, 'Неверный приоритет задачи')
      }
      if (taskData.category && taskData.category.length > 50) {
        throw new AppError(400, 'Категория не должна превышать 50 символов')
      }
      if (taskData.tags && taskData.tags.length > 10) {
        throw new AppError(400, 'Максимум 10 тегов')
      }
      if (taskData.files && taskData.files.length > 20) {
        throw new AppError(400, 'Максимум 20 файлов')
      }
      if (taskData.responsiblePhone && !/^\+375\d{9}$/.test(taskData.responsiblePhone)) {
        throw new AppError(400, 'Неверный формат телефона. Используйте формат +375xxxxxxxxx')
      }

      const finalTaskData = {
        ...taskData,
        userId: taskData.isPublic ? null : taskData.userId || socket.userId || null,
      }
      const newTask = taskDatabaseInstance.create(finalTaskData)

      if (finalTaskData.isPublic) {
        io.sockets.sockets.forEach((clientSocket: AuthenticatedSocket) => {
          const userTasks = taskDatabaseInstance.getAll(clientSocket.userId)
          clientSocket.emit('tasks:update', userTasks)
        })
      } else {
        const userTasks = taskDatabaseInstance.getAll(socket.userId)
        socket.emit('tasks:update', userTasks)
      }

      socket.emit('tasks:create:response', { success: true, data: taskDatabaseInstance.getAll(socket.userId) })
    } catch (error: any) {
      socket.emit('tasks:create:response', { success: false, error: error.message })
    }
  })

  socket.on('tasks:update', ({ id, updates }: { id: number; updates: Partial<Omit<ITask, 'id' | 'createdAt'>> }) => {
    if (!checkAuth(socket)) {
      socket.emit('tasks:update:response', { success: false, error: 'Authentication required' })
      return
    }
    try {
      const oldTask = taskDatabaseInstance.getById(id, socket.userId)

      if (updates.isPublic === false && oldTask.isPublic === true) {
        if (!socket.isAdmin) {
          throw new AppError(403, 'Только администратор может изменить публичную задачу на индивидуальную')
        }
      }

      if (updates.title !== undefined) {
        if (!updates.title || updates.title.trim().length === 0) {
          throw new AppError(400, 'Название задачи обязательно')
        }
        if (updates.title.length > 200) {
          throw new AppError(400, 'Название задачи не должно превышать 200 символов')
        }
      }
      if (updates.description !== undefined && updates.description.length > 1000) {
        throw new AppError(400, 'Описание не должно превышать 1000 символов')
      }
      if (updates.priority && !['low', 'medium', 'high'].includes(updates.priority)) {
        throw new AppError(400, 'Неверный приоритет задачи')
      }
      if (updates.category && updates.category.length > 50) {
        throw new AppError(400, 'Категория не должна превышать 50 символов')
      }
      if (updates.tags && updates.tags.length > 10) {
        throw new AppError(400, 'Максимум 10 тегов')
      }
      if (updates.files && updates.files.length > 20) {
        throw new AppError(400, 'Максимум 20 файлов')
      }
      if (updates.responsiblePhone && !/^\+375\d{9}$/.test(updates.responsiblePhone)) {
        throw new AppError(400, 'Неверный формат телефона. Используйте формат +375xxxxxxxxx')
      }

      const tasks = taskDatabaseInstance.update(id, updates, socket.userId)
      const updatedTask = taskDatabaseInstance.getById(id, socket.userId)
      if (updatedTask.isPublic) {
        io.sockets.sockets.forEach((clientSocket: AuthenticatedSocket) => {
          const userTasks = taskDatabaseInstance.getAll(clientSocket.userId)
          clientSocket.emit('tasks:update', userTasks)
        })
      } else {
        socket.emit('tasks:update', tasks)
      }
      socket.emit('tasks:update:response', { success: true, data: tasks })
    } catch (error: any) {
      socket.emit('tasks:update:response', { success: false, error: error.message })
    }
  })

  socket.on('tasks:delete', (id: number) => {
    if (!checkAuth(socket)) {
      socket.emit('tasks:delete:response', { success: false, error: 'Authentication required' })
      return
    }
    try {
      if (socket.userId == null) {
        throw new AppError(401, 'User ID is not set')
      }

      const allTasks = taskDatabaseInstance.getAll()
      const task = allTasks.find((t) => t.id === id)
      if (!task) {
        throw new AppError(404, 'Task not found')
      }

      if (!socket.isAdmin) {
        throw new AppError(403, 'Только администратор может удалять задачи')
      }

      taskDatabaseInstance.delete(id, socket.userId)

      if (task.isPublic) {
        io.sockets.sockets.forEach((clientSocket: AuthenticatedSocket) => {
          if (clientSocket.userId != null) {
            const userTasks = taskDatabaseInstance.getAll(clientSocket.userId)
            clientSocket.emit('tasks:update', userTasks)
          }
        })
        socket.emit('tasks:delete:response', { success: true })
      } else {
        if (socket.userId != null) {
          const userTasks = taskDatabaseInstance.getAll(socket.userId)
          socket.emit('tasks:update', userTasks)
          socket.emit('tasks:delete:response', { success: true })
        } else {
          socket.emit('tasks:delete:response', { success: false, error: 'User ID not set' })
        }
      }
    } catch (error: any) {
      socket.emit('tasks:delete:response', { success: false, error: error.message })
    }
  })

  socket.on('tasks:toggleComplete', (id: number) => {
    if (!checkAuth(socket)) {
      socket.emit('tasks:toggleComplete:response', { success: false, error: 'Authentication required' })
      return
    }
    try {
      const task = taskDatabaseInstance.getById(id, socket.userId)
      const tasks = taskDatabaseInstance.toggleComplete(id, socket.userId)
      if (task.isPublic) {
        io.sockets.sockets.forEach((clientSocket: AuthenticatedSocket) => {
          const userTasks = taskDatabaseInstance.getAll(clientSocket.userId)
          clientSocket.emit('tasks:update', userTasks)
        })
      } else {
        socket.emit('tasks:update', tasks)
      }
      socket.emit('tasks:toggleComplete:response', { success: true, data: tasks })
    } catch (error: any) {
      socket.emit('tasks:toggleComplete:response', { success: false, error: error.message })
    }
  })

  socket.on('tasks:updateFiles', ({ taskId, files }: { taskId: number; files: string[] }) => {
    if (!checkAuth(socket)) {
      socket.emit('tasks:updateFiles:response', { success: false, error: 'Authentication required' })
      return
    }

    try {
      const task = taskDatabaseInstance.getById(taskId, socket.userId)
      if (!task) {
        throw new AppError(404, 'Task not found')
      }

      if (!task.isPublic && task.userId !== socket.userId) {
        throw new AppError(403, 'Access denied')
      }

      const tasks = taskDatabaseInstance.update(taskId, { files }, socket.userId)
      const updatedTask = taskDatabaseInstance.getById(taskId, socket.userId)

      if (updatedTask.isPublic) {
        io.sockets.sockets.forEach((clientSocket: AuthenticatedSocket) => {
          const userTasks = taskDatabaseInstance.getAll(clientSocket.userId)
          clientSocket.emit('tasks:update', userTasks)
        })
      } else {
        socket.emit('tasks:update', tasks)
      }

      socket.emit('tasks:updateFiles:response', { success: true, data: tasks })
    } catch (error: any) {
      socket.emit('tasks:updateFiles:response', { success: false, error: error.message })
    }
  })
}
