import { AppError } from '../middlewares/error.middleware'
import { ITask } from '../modules/tasks/task.interface'

const testTasks: ITask[] = [
  {
    id: 1,
    title: 'Публичная задача 1',
    description: 'Это пример публичной задачи, видимой всем пользователям',
    userId: 2,
    isPublic: true,
    completed: false,
    createdAt: new Date(),
    priority: 'medium',
    deadline: null,
    category: 'Общее',
    tags: [],
    files: [],
    responsiblePhone: '+375291234567',
  },
  {
    id: 2,
    title: 'Индивидуальная задача',
    description: 'Эта задача видна только пользователю с id=1',
    userId: 1,
    isPublic: false,
    completed: false,
    createdAt: new Date(),
    priority: 'high',
    deadline: null,
    category: 'Личное',
    tags: [],
    files: [],
    responsiblePhone: null,
  },
]

class TaskDatabase {
  private tasks: ITask[] = [...testTasks]

  getAll(userId?: number): ITask[] {
    if (userId !== undefined && userId !== null) {
      return this.tasks.filter((task) => task.isPublic || task.userId === userId)
    }
    return this.tasks
  }

  getById(id: number, userId?: number): ITask {
    const task = this.tasks.find((t) => t.id === id)
    if (!task) throw new AppError(404, 'Task not found')
    if (!task.isPublic && task.userId !== userId) {
      throw new AppError(403, 'Access denied')
    }
    return task
  }

  create(task: Omit<ITask, 'id' | 'createdAt'>): ITask {
    const lastId = this.tasks.length > 0 ? Math.max(...this.tasks.map((t) => t.id)) : 0
    const newTask: ITask = {
      id: lastId + 1,
      ...task,
      createdAt: new Date(),
    }
    this.tasks.push(newTask)
    return newTask
  }

  update(id: number, updates: Partial<Omit<ITask, 'id' | 'createdAt'>>, userId?: number): ITask[] {
    const task = this.tasks.find((t) => t.id === id)
    if (!task) throw new AppError(404, 'Task not found')
    if (!task.isPublic && task.userId !== userId) {
      throw new AppError(403, 'Access denied')
    }
    this.tasks = this.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t))
    return this.getAll(userId)
  }

  delete(id: number, userId?: number): void {
    const index = this.tasks.findIndex((t) => t.id === id)
    if (index === -1) throw new AppError(404, 'Task not found')
    this.tasks.splice(index, 1)
  }

  toggleComplete(id: number, userId?: number): ITask[] {
    const task = this.tasks.find((t) => t.id === id)
    if (!task) throw new AppError(404, 'Task not found')
    if (!task.isPublic && task.userId !== userId) {
      throw new AppError(403, 'Access denied')
    }
    this.tasks = this.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    return this.getAll(userId)
  }
}

const taskDatabaseInstance = new TaskDatabase()
export default taskDatabaseInstance
