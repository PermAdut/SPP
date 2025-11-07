import { AppError } from '../middlewares/error.middleware'
import { ITask } from '../modules/tasks/task.interface'

const testTasks: ITask[] = [
  {
    id: 1,
    title: 'Публичная задача 1',
    description: 'Это пример публичной задачи, видимой всем пользователям',
    userId: null,
    isPublic: true,
    completed: false,
    createdAt: new Date(),
    priority: 'medium',
    deadline: null,
    category: 'Общее',
    tags: [],
    files: [],
    responsiblePhone: null,
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
  {
    id: 3,
    title: 'Завершить проект до конца месяца',
    description: 'Необходимо завершить разработку нового функционала и провести тестирование',
    userId: null,
    isPublic: true,
    completed: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    priority: 'high',
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    category: 'Работа',
    tags: ['срочно', 'проект', 'разработка'],
    files: ['1757929240249-images.jfif'],
    responsiblePhone: '+375291234567',
  },
  {
    id: 4,
    title: 'Подготовить презентацию',
    description: 'Создать презентацию для клиента с результатами работы за квартал',
    userId: 2,
    isPublic: false,
    completed: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    priority: 'medium',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    category: 'Работа',
    tags: ['презентация', 'клиент'],
    files: [],
    responsiblePhone: '+375292345678',
  },
  {
    id: 5,
    title: 'Изучить новый фреймворк',
    description: 'Изучить основы React и создать небольшой проект для практики',
    userId: null,
    isPublic: true,
    completed: true,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    priority: 'low',
    deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    category: 'Учеба',
    tags: ['обучение', 'react', 'разработка'],
    files: ['1757938763087-images.jfif', '1757938765070-images.jfif'],
    responsiblePhone: null,
  },
  {
    id: 6,
    title: 'Купить продукты',
    description: 'Молоко, хлеб, яйца, овощи и фрукты',
    userId: 3,
    isPublic: false,
    completed: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    priority: 'medium',
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    category: 'Личное',
    tags: ['покупки', 'дом'],
    files: [],
    responsiblePhone: '+375293456789',
  },
  {
    id: 7,
    title: 'Оптимизировать базу данных',
    description: 'Провести анализ производительности и оптимизировать медленные запросы',
    userId: null,
    isPublic: true,
    completed: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    priority: 'high',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    category: 'Работа',
    tags: ['база данных', 'оптимизация', 'производительность'],
    files: ['1757938766762-images.jfif'],
    responsiblePhone: '+375294567890',
  },
  {
    id: 8,
    title: 'Записаться на стоматолога',
    description: 'Плановый осмотр и чистка зубов',
    userId: 4,
    isPublic: false,
    completed: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    priority: 'low',
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    category: 'Здоровье',
    tags: ['здоровье', 'врач'],
    files: [],
    responsiblePhone: null,
  },
  {
    id: 9,
    title: 'Провести код-ревью',
    description: 'Проверить код коллег и оставить комментарии',
    userId: null,
    isPublic: true,
    completed: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    priority: 'medium',
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    category: 'Работа',
    tags: ['код-ревью', 'команда'],
    files: ['1757938767915-images.jfif', '1757938769389-images.jfif'],
    responsiblePhone: '+375295678901',
  },
  {
    id: 10,
    title: 'Подготовить отчет за месяц',
    description: 'Собрать статистику и подготовить ежемесячный отчет для руководства',
    userId: 5,
    isPublic: false,
    completed: true,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    priority: 'high',
    deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    category: 'Работа',
    tags: ['отчет', 'статистика'],
    files: [],
    responsiblePhone: null,
  },
  {
    id: 11,
    title: 'Обновить документацию',
    description: 'Обновить API документацию и добавить примеры использования',
    userId: null,
    isPublic: true,
    completed: false,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    priority: 'medium',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    category: 'Работа',
    tags: ['документация', 'api'],
    files: [],
    responsiblePhone: '+375296789012',
  },
  {
    id: 12,
    title: 'Планирование отпуска',
    description: 'Выбрать даты и забронировать билеты и отель',
    userId: 6,
    isPublic: false,
    completed: false,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    priority: 'low',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    category: 'Личное',
    tags: ['отпуск', 'путешествие'],
    files: [],
    responsiblePhone: null,
  },
  {
    id: 13,
    title: 'Настроить CI/CD',
    description: 'Настроить автоматическую сборку и деплой приложения',
    userId: null,
    isPublic: true,
    completed: false,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    priority: 'high',
    deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    category: 'Работа',
    tags: ['ci/cd', 'devops', 'автоматизация'],
    files: [],
    responsiblePhone: '+375297890123',
  },
  {
    id: 14,
    title: 'Встреча с командой',
    description: 'Еженедельная встреча для обсуждения прогресса и планов',
    userId: 7,
    isPublic: false,
    completed: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    priority: 'medium',
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    category: 'Работа',
    tags: ['встреча', 'команда'],
    files: [],
    responsiblePhone: '+375298901234',
  },
  {
    id: 15,
    title: 'Рефакторинг старого кода',
    description: 'Улучшить структуру и читаемость кода в модуле авторизации',
    userId: null,
    isPublic: true,
    completed: false,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    priority: 'low',
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    category: 'Работа',
    tags: ['рефакторинг', 'код'],
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
