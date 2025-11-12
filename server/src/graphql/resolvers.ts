import taskDatabaseInstance from '../utils/taskDb'
import userDatabaseInstance from '../utils/userDb'
import authService from '../modules/auth/auth.service'
import { AppError } from '../middlewares/error.middleware'

interface Context {
  user?: {
    id: number
    username: string
    isAdmin: boolean
  }
}

export const resolvers = {
  Query: {
    __typename: () => 'Query', // Для проверки подключения без аутентификации

    tasks: (_: any, __: any, context: Context) => {
      if (!context.user) {
        throw new AppError(401, 'Authentication required')
      }
      return taskDatabaseInstance.getAll(context.user.id)
    },

    task: (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user) {
        throw new AppError(401, 'Authentication required')
      }
      return taskDatabaseInstance.getById(parseInt(id), context.user.id)
    },

    users: (_: any, __: any, context: Context) => {
      if (!context.user) {
        throw new AppError(401, 'Authentication required')
      }
      return userDatabaseInstance.getAll()
    },

    user: (_: any, { id }: { id: number }, context: Context) => {
      if (!context.user) {
        throw new AppError(401, 'Authentication required')
      }
      return userDatabaseInstance.getById(id)
    },

    filterUsersByName: (_: any, { name }: { name: string }, context: Context) => {
      if (!context.user) {
        throw new AppError(401, 'Authentication required')
      }
      return userDatabaseInstance.filterByName(name)
    },

    filterUsersBySurname: (_: any, { surname }: { surname: string }, context: Context) => {
      if (!context.user) {
        throw new AppError(401, 'Authentication required')
      }
      return userDatabaseInstance.filterBySurName(surname)
    },
  },

  Mutation: {
    login: async (_: any, { input }: { input: { username: string; password: string } }) => {
      return await authService.loginUser(input)
    },

    refreshToken: async (_: any, { refreshToken }: { refreshToken: string }) => {
      return await authService.generateNewAccessToken(refreshToken)
    },

    createTask: (_: any, { input }: { input: any }, context: Context) => {
      if (!context.user) {
        throw new AppError(401, 'Authentication required')
      }

      // Валидация
      if (!input.title || input.title.trim().length === 0) {
        throw new AppError(400, 'Название задачи обязательно')
      }
      if (input.title.length > 200) {
        throw new AppError(400, 'Название задачи не должно превышать 200 символов')
      }
      if (input.description && input.description.length > 1000) {
        throw new AppError(400, 'Описание не должно превышать 1000 символов')
      }
      if (!['low', 'medium', 'high'].includes(input.priority)) {
        throw new AppError(400, 'Неверный приоритет задачи')
      }
      if (input.category && input.category.length > 50) {
        throw new AppError(400, 'Категория не должна превышать 50 символов')
      }
      if (input.tags && input.tags.length > 10) {
        throw new AppError(400, 'Максимум 10 тегов')
      }
      if (input.files && input.files.length > 20) {
        throw new AppError(400, 'Максимум 20 файлов')
      }
      if (input.responsiblePhone && !/^\+375\d{9}$/.test(input.responsiblePhone)) {
        throw new AppError(400, 'Неверный формат телефона. Используйте формат +375xxxxxxxxx')
      }

      const finalTaskData = {
        ...input,
        userId: input.isPublic ? null : input.userId || context.user.id || null,
        completed: false,
        createdAt: new Date(),
      }

      const newTask = taskDatabaseInstance.create(finalTaskData)
      return taskDatabaseInstance.getAll(context.user.id)
    },

    updateTask: (_: any, { id, input }: { id: string; input: any }, context: Context) => {
      if (!context.user) {
        throw new AppError(401, 'Authentication required')
      }

      const oldTask = taskDatabaseInstance.getById(parseInt(id), context.user.id)

      if (input.isPublic === false && oldTask.isPublic === true) {
        if (!context.user.isAdmin) {
          throw new AppError(403, 'Только администратор может изменить публичную задачу на индивидуальную')
        }
      }

      // Валидация
      if (input.title !== undefined) {
        if (!input.title || input.title.trim().length === 0) {
          throw new AppError(400, 'Название задачи обязательно')
        }
        if (input.title.length > 200) {
          throw new AppError(400, 'Название задачи не должно превышать 200 символов')
        }
      }
      if (input.description !== undefined && input.description.length > 1000) {
        throw new AppError(400, 'Описание не должно превышать 1000 символов')
      }
      if (input.priority && !['low', 'medium', 'high'].includes(input.priority)) {
        throw new AppError(400, 'Неверный приоритет задачи')
      }
      if (input.category && input.category.length > 50) {
        throw new AppError(400, 'Категория не должна превышать 50 символов')
      }
      if (input.tags && input.tags.length > 10) {
        throw new AppError(400, 'Максимум 10 тегов')
      }
      if (input.files && input.files.length > 20) {
        throw new AppError(400, 'Максимум 20 файлов')
      }
      if (input.responsiblePhone && !/^\+375\d{9}$/.test(input.responsiblePhone)) {
        throw new AppError(400, 'Неверный формат телефона. Используйте формат +375xxxxxxxxx')
      }

      const tasks = taskDatabaseInstance.update(parseInt(id), input, context.user.id)
      return tasks
    },

    deleteTask: (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user) {
        throw new AppError(401, 'Authentication required')
      }

      const allTasks = taskDatabaseInstance.getAll()
      const task = allTasks.find((t) => t.id === parseInt(id))
      if (!task) {
        throw new AppError(404, 'Task not found')
      }

      if (task.isPublic && !context.user.isAdmin) {
        throw new AppError(403, 'Только администратор может удалять публичные задачи')
      }

      if (!task.isPublic) {
        if (task.userId == null || task.userId !== context.user.id) {
          throw new AppError(403, 'Вы можете удалять только свои индивидуальные задачи')
        }
      }

      taskDatabaseInstance.delete(parseInt(id), context.user.id)
      return true
    },

    toggleTaskComplete: (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user) {
        throw new AppError(401, 'Authentication required')
      }

      const task = taskDatabaseInstance.getById(parseInt(id), context.user.id)
      const tasks = taskDatabaseInstance.toggleComplete(parseInt(id), context.user.id)
      return tasks
    },

    createUser: (_: any, { input }: { input: any }, context: Context) => {
      if (!context.user?.isAdmin) {
        throw new Error('Только администратор может создавать пользователей')
      }
      const userData = {
        ...input,
        id: 0, // ID будет сгенерирован в базе
      }
      return userDatabaseInstance.addUser(userData)
    },

    updateUser: (_: any, { id, input }: { id: number; input: any }, context: Context) => {
      if (!context.user?.isAdmin) {
        throw new Error('Только администратор может обновлять пользователей')
      }
      return userDatabaseInstance.updateUser({ id, ...input })
    },

    deleteUser: (_: any, { id }: { id: number }, context: Context) => {
      if (!context.user?.isAdmin) {
        throw new Error('Только администратор может удалять пользователей')
      }
      userDatabaseInstance.deleteUser(id)
      return true
    },

    changeAdminStatus: (_: any, { id, status }: { id: number; status: boolean }, context: Context) => {
      if (!context.user?.isAdmin) {
        throw new Error('Только администратор может менять статус администратора')
      }
      return userDatabaseInstance.changeAdminStatus(id, status)
    },
  },
}
