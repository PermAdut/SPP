import { Server, Socket } from 'socket.io'
import userDatabaseInstance from '../utils/db'
import taskDatabaseInstance from '../utils/taskDb'
import jwtUtil from '../utils/jwt.util'
import { AppError } from '../middlewares/error.middleware'
import { IUser } from '../modules/users/user.intreface'
import { ITask } from '../modules/tasks/task.interface'

interface AuthenticatedSocket extends Socket {
  userId?: number
  username?: string
  isAdmin?: boolean
}

// Аутентификация через токен
export const authenticateSocket = async (socket: AuthenticatedSocket, token: string): Promise<void> => {
  try {
    const payload = await jwtUtil.verifyAccessToken(token)
    socket.userId = payload.id
    socket.username = payload.username
    // Получаем информацию о пользователе из базы данных для проверки прав администратора
    const user = userDatabaseInstance.getById(payload.id)
    socket.isAdmin = user?.isAdmin || false
  } catch (err) {
    throw new AppError(401, 'Invalid token')
  }
}

// Обработчики для пользователей
export const setupUserHandlers = (io: Server, socket: AuthenticatedSocket) => {
  // Получить всех пользователей
  socket.on('users:getAll', () => {
    try {
      const users = userDatabaseInstance.getAll()
      socket.emit('users:getAll:response', { success: true, data: users })
    } catch (error: any) {
      socket.emit('users:getAll:response', { success: false, error: error.message })
    }
  })

  // Добавить пользователя
  socket.on('users:create', (userData: Omit<IUser, 'id'>) => {
    try {
      const users = userDatabaseInstance.addUser(userData)
      io.emit('users:update', users) // Отправляем всем обновленный список
      socket.emit('users:create:response', { success: true, data: users })
    } catch (error: any) {
      socket.emit('users:create:response', { success: false, error: error.message })
    }
  })

  // Обновить пользователя
  socket.on('users:update', (userData: Partial<Omit<IUser, 'id'>> & { id: number }) => {
    try {
      const users = userDatabaseInstance.updateUser(userData)
      io.emit('users:update', users)
      socket.emit('users:update:response', { success: true, data: users })
    } catch (error: any) {
      socket.emit('users:update:response', { success: false, error: error.message })
    }
  })

  // Удалить пользователя
  socket.on('users:delete', (id: number) => {
    try {
      userDatabaseInstance.deleteUser(id)
      const users = userDatabaseInstance.getAll()
      io.emit('users:update', users)
      socket.emit('users:delete:response', { success: true })
    } catch (error: any) {
      socket.emit('users:delete:response', { success: false, error: error.message })
    }
  })

  // Изменить статус администратора
  socket.on('users:changeAdmin', ({ id, status }: { id: number; status: boolean }) => {
    try {
      const users = userDatabaseInstance.changeAdminStatus(id, status)
      io.emit('users:update', users)
      socket.emit('users:changeAdmin:response', { success: true, data: users })
    } catch (error: any) {
      socket.emit('users:changeAdmin:response', { success: false, error: error.message })
    }
  })

  // Фильтр по имени
  socket.on('users:filterName', (name: string) => {
    try {
      const users = userDatabaseInstance.filterByName(name)
      socket.emit('users:filterName:response', { success: true, data: users })
    } catch (error: any) {
      socket.emit('users:filterName:response', { success: false, error: error.message })
    }
  })

  // Фильтр по фамилии
  socket.on('users:filterSurname', (surname: string) => {
    try {
      const users = userDatabaseInstance.filterBySurName(surname)
      socket.emit('users:filterSurname:response', { success: true, data: users })
    } catch (error: any) {
      socket.emit('users:filterSurname:response', { success: false, error: error.message })
    }
  })

  // Загрузить фото
  socket.on('users:uploadPhoto', ({ id, filename }: { id: number; filename: string }) => {
    try {
      const users = userDatabaseInstance.uploadPhoto(id, filename)
      io.emit('users:update', users)
      socket.emit('users:uploadPhoto:response', { success: true, data: users })
    } catch (error: any) {
      socket.emit('users:uploadPhoto:response', { success: false, error: error.message })
    }
  })

  // Изменить дополнительную информацию
  socket.on('users:changeAdditionalData', ({ id, data }: { id: number; data: string }) => {
    try {
      const users = userDatabaseInstance.changeAdditionalData(id, data)
      io.emit('users:update', users)
      socket.emit('users:changeAdditionalData:response', { success: true, data: users })
    } catch (error: any) {
      socket.emit('users:changeAdditionalData:response', { success: false, error: error.message })
    }
  })
}

// Обработчики для задач
export const setupTaskHandlers = (io: Server, socket: AuthenticatedSocket) => {
  // Получить все задачи (публичные + индивидуальные пользователя)
  socket.on('tasks:getAll', () => {
    try {
      const tasks = taskDatabaseInstance.getAll(socket.userId)
      socket.emit('tasks:getAll:response', { success: true, data: tasks })
    } catch (error: any) {
      socket.emit('tasks:getAll:response', { success: false, error: error.message })
    }
  })

  // Создать задачу
  socket.on('tasks:create', (taskData: Omit<ITask, 'id' | 'createdAt'>) => {
    try {
      // Валидация
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

      // Устанавливаем userId из сокета, если задача не публичная
      const finalTaskData = {
        ...taskData,
        userId: taskData.isPublic ? null : taskData.userId || socket.userId || null,
      }
      const newTask = taskDatabaseInstance.create(finalTaskData)

      // Получаем отфильтрованные задачи для каждого пользователя
      // Если задача публичная, отправляем всем обновленный список
      if (finalTaskData.isPublic) {
        // Отправляем всем пользователям их отфильтрованные задачи
        io.sockets.sockets.forEach((clientSocket: AuthenticatedSocket) => {
          const userTasks = taskDatabaseInstance.getAll(clientSocket.userId)
          clientSocket.emit('tasks:update', userTasks)
        })
      } else {
        // Отправляем только создателю его задачи
        const userTasks = taskDatabaseInstance.getAll(socket.userId)
        socket.emit('tasks:update', userTasks)
      }

      socket.emit('tasks:create:response', { success: true, data: taskDatabaseInstance.getAll(socket.userId) })
    } catch (error: any) {
      socket.emit('tasks:create:response', { success: false, error: error.message })
    }
  })

  // Обновить задачу
  socket.on('tasks:update', ({ id, updates }: { id: number; updates: Partial<Omit<ITask, 'id' | 'createdAt'>> }) => {
    try {
      // Получаем задачу до обновления для проверки прав
      const oldTask = taskDatabaseInstance.getById(id, socket.userId)

      // Проверка прав: если пытаемся изменить публичную задачу на индивидуальную, нужны права администратора
      if (updates.isPublic === false && oldTask.isPublic === true) {
        if (!socket.isAdmin) {
          throw new AppError(403, 'Только администратор может изменить публичную задачу на индивидуальную')
        }
      }

      // Валидация
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

      const tasks = taskDatabaseInstance.update(id, updates, socket.userId)
      const updatedTask = taskDatabaseInstance.getById(id, socket.userId)
      // Если задача публичная, отправляем всем, иначе только владельцу
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

  // Удалить задачу
  socket.on('tasks:delete', (id: number) => {
    try {
      const task = taskDatabaseInstance.getById(id, socket.userId)

      // Проверка прав: если задача публичная, удалять может только администратор
      if (task.isPublic && !socket.isAdmin) {
        throw new AppError(403, 'Только администратор может удалять публичные задачи')
      }

      // Проверка прав: если задача индивидуальная, удалять может только владелец
      if (!task.isPublic && task.userId !== socket.userId) {
        throw new AppError(403, 'Вы можете удалять только свои индивидуальные задачи')
      }

      taskDatabaseInstance.delete(id, socket.userId)

      // Отправляем обновленные списки задач
      if (task.isPublic) {
        // Публичная задача - отправляем всем обновленные списки
        io.sockets.sockets.forEach((clientSocket: AuthenticatedSocket) => {
          const userTasks = taskDatabaseInstance.getAll(clientSocket.userId)
          clientSocket.emit('tasks:update', userTasks)
        })
      } else {
        // Индивидуальная задача - отправляем только владельцу
        const userTasks = taskDatabaseInstance.getAll(socket.userId)
        socket.emit('tasks:update', userTasks)
      }

      socket.emit('tasks:delete:response', { success: true })
    } catch (error: any) {
      socket.emit('tasks:delete:response', { success: false, error: error.message })
    }
  })

  // Переключить статус выполнения
  socket.on('tasks:toggleComplete', (id: number) => {
    try {
      const task = taskDatabaseInstance.getById(id, socket.userId)
      const tasks = taskDatabaseInstance.toggleComplete(id, socket.userId)
      // Если задача публичная, отправляем всем, иначе только владельцу
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
}
