export interface ITask {
  id: number
  title: string
  description: string
  userId: number | null // null для публичных задач, число для индивидуальных
  isPublic: boolean
  completed: boolean
  createdAt: Date
  priority: 'low' | 'medium' | 'high' // Приоритет задачи
  deadline: Date | null // Дедлайн задачи
  category: string // Категория задачи
  tags: string[] // Теги задачи
  files: string[] // Файлы задачи
  responsiblePhone: string | null // Телефон ответственного
}

