import { PubSub } from 'graphql-subscriptions'
import taskDatabaseInstance from '../utils/taskDb.js'
import { AppError } from '../middlewares/error.middleware.js'
import { ITask } from '../modules/tasks/task.interface.js'

const pubsub = new PubSub()

interface Context {
  userId?: number
  isAdmin?: boolean
}

export const resolvers = {
  Query: {
    tasks: (_: any, __: any, context: Context) => {
      return taskDatabaseInstance.getAll(context.userId)
    },
    task: (_: any, { id }: { id: string }, context: Context) => {
      return taskDatabaseInstance.getById(Number(id), context.userId)
    },
  },

  Mutation: {
    createTask: (_: any, { input }: { input: any }, context: Context) => {
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

      const taskData: Omit<ITask, 'id' | 'createdAt'> = {
        title: input.title.trim(),
        description: input.description?.trim() || '',
        isPublic: input.isPublic,
        userId: input.isPublic ? null : (context.userId || null),
        completed: false,
        priority: input.priority,
        deadline: input.deadline ? new Date(input.deadline) : null,
        category: input.category?.trim() || 'Общее',
        tags: input.tags || [],
      }

      const newTask = taskDatabaseInstance.create(taskData)
      
      // Публикуем событие для подписчиков
      pubsub.publish('TASK_CREATED', { taskUpdated: newTask })
      pubsub.publish('TASK_UPDATED', { taskUpdated: newTask })
      
      return newTask
    },

    updateTask: (_: any, { id, input }: { id: string; input: any }, context: Context) => {
      const taskId = Number(id)
      const oldTask = taskDatabaseInstance.getById(taskId, context.userId)

      // Проверка прав: если пытаемся изменить публичную задачу на индивидуальную, нужны права администратора
      if (input.isPublic === false && oldTask.isPublic === true) {
        if (!context.isAdmin) {
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

      const updates: Partial<Omit<ITask, 'id' | 'createdAt'>> = {}
      if (input.title !== undefined) updates.title = input.title.trim()
      if (input.description !== undefined) updates.description = input.description.trim()
      if (input.isPublic !== undefined) updates.isPublic = input.isPublic
      if (input.priority !== undefined) updates.priority = input.priority
      if (input.deadline !== undefined) updates.deadline = input.deadline ? new Date(input.deadline) : null
      if (input.category !== undefined) updates.category = input.category.trim()
      if (input.tags !== undefined) updates.tags = input.tags

      taskDatabaseInstance.update(taskId, updates, context.userId)
      const updatedTask = taskDatabaseInstance.getById(taskId, context.userId)

      // Публикуем событие для подписчиков
      pubsub.publish('TASK_UPDATED', { taskUpdated: updatedTask })

      return updatedTask
    },

    deleteTask: (_: any, { id }: { id: string }, context: Context) => {
      const taskId = Number(id)
      const task = taskDatabaseInstance.getById(taskId, context.userId)

      // Проверка прав: если задача публичная, удалять может только администратор
      if (task.isPublic && !context.isAdmin) {
        throw new AppError(403, 'Только администратор может удалять публичные задачи')
      }

      // Проверка прав: если задача индивидуальная, удалять может только владелец
      if (!task.isPublic && task.userId !== context.userId) {
        throw new AppError(403, 'Вы можете удалять только свои индивидуальные задачи')
      }

      taskDatabaseInstance.delete(taskId, context.userId)

      // Публикуем событие для подписчиков
      pubsub.publish('TASK_DELETED', { taskDeleted: taskId })

      return true
    },

    toggleTaskComplete: (_: any, { id }: { id: string }, context: Context) => {
      const taskId = Number(id)
      taskDatabaseInstance.toggleComplete(taskId, context.userId)
      const updatedTask = taskDatabaseInstance.getById(taskId, context.userId)

      // Публикуем событие для подписчиков
      pubsub.publish('TASK_UPDATED', { taskUpdated: updatedTask })

      return updatedTask
    },
  },

  Subscription: {
    taskUpdated: {
      subscribe: () => (pubsub as any).asyncIterator(['TASK_CREATED', 'TASK_UPDATED']),
    },
    taskDeleted: {
      subscribe: () => (pubsub as any).asyncIterator(['TASK_DELETED']),
    },
  },

  Task: {
    id: (task: ITask) => task.id.toString(),
    userId: (task: ITask) => task.userId?.toString() || null,
    createdAt: (task: ITask) => task.createdAt.toISOString(),
    deadline: (task: ITask) => task.deadline?.toISOString() || null,
  },
}

