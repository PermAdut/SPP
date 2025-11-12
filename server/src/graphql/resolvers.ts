import { GraphQLContext } from './context'
import { AppError } from '../middlewares/error.middleware'
import userDatabaseInstance from '../utils/userDb'
import taskDatabaseInstance from '../utils/taskDb'
import authService from '../modules/auth/auth.service'
import { IUser } from '../modules/users/user.interface'
import { ITask } from '../modules/tasks/task.interface'
import { PubSub } from 'graphql-subscriptions'
import { validateGraphQLInput } from './utils/validation'
import {
  validateCreateUser,
  validateUpdateUser,
  validateChangeAdminStatus,
  validateUploadPhoto,
  validateChangeAdditionalData,
  validateFilterByName,
  validateFilterBySurname,
} from './validators/user.validator'
import {
  validateCreateTask,
  validateUpdateTask,
  validateDeleteTask,
  validateToggleTaskComplete,
} from './validators/task.validator'
import {
  validateLogin,
  validateRefreshToken,
} from './validators/auth.validator'

const pubsub = new PubSub()

const requireAuth = (context: GraphQLContext): void => {
  if (context.userId == null) {
    throw new AppError(401, 'Authentication required')
  }
}

export const resolvers = {
  Task: {
    id: (task: ITask) => String(task.id),
    userId: (task: ITask) => task.userId !== null ? String(task.userId) : null,
    createdAt: (task: ITask) => task.createdAt.toISOString(),
    deadline: (task: ITask) => task.deadline ? task.deadline.toISOString() : null,
  },

  User: {
    id: (user: IUser) => String(user.id),
  },

  Query: {
    users: (_: any, __: any, context: GraphQLContext): IUser[] => {
      requireAuth(context)
      return userDatabaseInstance.getAll()
    },

    user: (_: any, { id }: { id: string }, context: GraphQLContext): IUser | undefined => {
      requireAuth(context)
      return userDatabaseInstance.getById(parseInt(id))
    },

    tasks: (_: any, __: any, context: GraphQLContext): ITask[] => {
      requireAuth(context)
      return taskDatabaseInstance.getAll(context.userId)
    },

    task: (_: any, { id }: { id: string }, context: GraphQLContext): ITask => {
      requireAuth(context)
      return taskDatabaseInstance.getById(parseInt(id), context.userId)
    },

    filterUsersByName: async (_: any, { name }: { name: string }, context: GraphQLContext): Promise<IUser[]> => {
      requireAuth(context)
      await validateGraphQLInput(validateFilterByName, { name })
      return userDatabaseInstance.filterByName(name)
    },

    filterUsersBySurname: async (_: any, { surname }: { surname: string }, context: GraphQLContext): Promise<IUser[]> => {
      requireAuth(context)
      await validateGraphQLInput(validateFilterBySurname, { surname })
      return userDatabaseInstance.filterBySurName(surname)
    },
  },

  Mutation: {
    login: async (_: any, { credentials }: { credentials: { username: string; password: string } }) => {
      await validateGraphQLInput(validateLogin, credentials)
      const response = await authService.loginUser(credentials)
      return response
    },

    refreshToken: async (_: any, { refreshToken }: { refreshToken: string }) => {
      await validateGraphQLInput(validateRefreshToken, { refreshToken })
      const response = await authService.generateNewAccessToken(refreshToken)
      return response
    },

    createUser: async (_: any, { user }: { user: Omit<IUser, 'id'> }, context: GraphQLContext): Promise<IUser[]> => {
      requireAuth(context)
      await validateGraphQLInput(validateCreateUser, user)
      const users = userDatabaseInstance.addUser(user)
      pubsub.publish('USERS_UPDATED', { usersUpdated: users })
      return users
    },

    updateUser: async (_: any, { user }: { user: Partial<Omit<IUser, 'id'>> & { id: string } }, context: GraphQLContext): Promise<IUser[]> => {
      requireAuth(context)
      const userId = parseInt(user.id)
      const updateData = { ...user, id: userId }
      await validateGraphQLInput(validateUpdateUser, updateData)
      const users = userDatabaseInstance.updateUser(updateData)
      pubsub.publish('USERS_UPDATED', { usersUpdated: users })
      return users
    },

    deleteUser: (_: any, { id }: { id: string }, context: GraphQLContext): boolean => {
      requireAuth(context)
      userDatabaseInstance.deleteUser(parseInt(id))
      const users = userDatabaseInstance.getAll()
      pubsub.publish('USERS_UPDATED', { usersUpdated: users })
      return true
    },

    changeAdminStatus: async (_: any, { input }: { input: { id: string; status: boolean } }, context: GraphQLContext): Promise<IUser[]> => {
      requireAuth(context)
      const userId = parseInt(input.id)
      const validateData = { id: userId, status: input.status }
      await validateGraphQLInput(validateChangeAdminStatus, validateData)
      const users = userDatabaseInstance.changeAdminStatus(userId, input.status)
      pubsub.publish('USERS_UPDATED', { usersUpdated: users })
      return users
    },

    uploadPhoto: async (_: any, { input }: { input: { id: string; filename: string } }, context: GraphQLContext): Promise<IUser[]> => {
      requireAuth(context)
      const userId = parseInt(input.id)
      const validateData = { id: userId, filename: input.filename }
      await validateGraphQLInput(validateUploadPhoto, validateData)
      const users = userDatabaseInstance.uploadPhoto(userId, input.filename)
      pubsub.publish('USERS_UPDATED', { usersUpdated: users })
      return users
    },

    changeAdditionalData: async (_: any, { input }: { input: { id: string; data: string } }, context: GraphQLContext): Promise<IUser[]> => {
      requireAuth(context)
      const userId = parseInt(input.id)
      const validateData = { id: userId, data: input.data }
      await validateGraphQLInput(validateChangeAdditionalData, validateData)
      const users = userDatabaseInstance.changeAdditionalData(userId, input.data)
      pubsub.publish('USERS_UPDATED', { usersUpdated: users })
      return users
    },

    createTask: async (_: any, { task }: { task: Omit<ITask, 'id' | 'createdAt'> }, context: GraphQLContext): Promise<ITask[]> => {
      requireAuth(context)
      await validateGraphQLInput(validateCreateTask, task)

      const finalTaskData: Omit<ITask, 'id' | 'createdAt'> = {
        ...task,
        userId: task.isPublic ? null : (task.userId ? parseInt(String(task.userId)) : context.userId || null),
        deadline: task.deadline ? new Date(task.deadline) : null,
      }

      taskDatabaseInstance.create(finalTaskData)
      const userTasks = taskDatabaseInstance.getAll(context.userId)
      pubsub.publish('TASKS_UPDATED', { tasksUpdated: userTasks })
      return userTasks
    },

    updateTask: async (_: any, { task }: { task: Partial<Omit<ITask, 'id' | 'createdAt'>> & { id: string } }, context: GraphQLContext): Promise<ITask[]> => {
      requireAuth(context)

      const taskId = parseInt(task.id)
      const oldTask = taskDatabaseInstance.getAll().find((t) => t.id === taskId)
      if (!oldTask) {
        throw new AppError(404, 'Task not found')
      }

      if (task.isPublic === false && oldTask.isPublic === true) {
        if (!context.isAdmin) {
          throw new AppError(403, 'Только администратор может изменить публичную задачу на индивидуальную')
        }
      }

      const updateData: any = { ...task }
      delete updateData.id
      if (task.deadline !== undefined) {
        updateData.deadline = task.deadline ? new Date(task.deadline) : null
      }
      if (task.userId !== undefined) {
        updateData.userId = task.userId ? parseInt(String(task.userId)) : null
      }

      await validateGraphQLInput(validateUpdateTask, { ...updateData, id: taskId })

      const tasks = taskDatabaseInstance.update(taskId, updateData, context.userId)
      pubsub.publish('TASKS_UPDATED', { tasksUpdated: tasks })
      return tasks
    },

    deleteTask: async (_: any, { id }: { id: string }, context: GraphQLContext): Promise<boolean> => {
      requireAuth(context)

      if (context.userId == null) {
        throw new AppError(401, 'User ID is not set')
      }

      await validateGraphQLInput(validateDeleteTask, { id: parseInt(id) })

      const allTasks = taskDatabaseInstance.getAll()
      const task = allTasks.find((t) => t.id === parseInt(id))
      if (!task) {
        throw new AppError(404, 'Task not found')
      }

      if (task.isPublic && !context.isAdmin) {
        throw new AppError(403, 'Только администратор может удалять публичные задачи')
      }

      if (!task.isPublic) {
        if (task.userId == null || task.userId !== context.userId) {
          throw new AppError(403, 'Вы можете удалять только свои индивидуальные задачи')
        }
      }

      taskDatabaseInstance.delete(parseInt(id), context.userId)
      const userTasks = taskDatabaseInstance.getAll(context.userId)
      pubsub.publish('TASKS_UPDATED', { tasksUpdated: userTasks })
      return true
    },

    toggleTaskComplete: async (_: any, { id }: { id: string }, context: GraphQLContext): Promise<ITask[]> => {
      requireAuth(context)
      await validateGraphQLInput(validateToggleTaskComplete, { id: parseInt(id) })
      const tasks = taskDatabaseInstance.toggleComplete(parseInt(id), context.userId)
      pubsub.publish('TASKS_UPDATED', { tasksUpdated: tasks })
      return tasks
    },
  },

  Subscription: {
    usersUpdated: {
      subscribe: () => {
        return pubsub.asyncIterator(['USERS_UPDATED'])
      },
    },
    tasksUpdated: {
      subscribe: () => {
        return pubsub.asyncIterator(['TASKS_UPDATED'])
      },
    },
  },
}

