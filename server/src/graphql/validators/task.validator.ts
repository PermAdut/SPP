import { body, ValidationChain } from 'express-validator'

export const validateCreateTask: ValidationChain[] = [
  body('title').notEmpty().withMessage('Название задачи обязательно').trim().isLength({ min: 1, max: 200 }).withMessage('Название задачи должно быть от 1 до 200 символов'),
  body('description').optional().isString().isLength({ max: 1000 }).withMessage('Описание не должно превышать 1000 символов'),
  body('userId').optional().isInt({ min: 0 }).withMessage('userId должен быть положительным числом или null'),
  body('isPublic').isBoolean().withMessage('isPublic должен быть булевым значением'),
  body('completed').isBoolean().withMessage('completed должен быть булевым значением'),
  body('priority').isIn(['low', 'medium', 'high']).withMessage('Приоритет должен быть low, medium или high'),
  body('deadline').optional().isISO8601().withMessage('deadline должен быть валидной датой ISO8601'),
  body('category').optional().isString().isLength({ max: 50 }).withMessage('Категория не должна превышать 50 символов'),
  body('tags').optional().isArray().withMessage('tags должен быть массивом'),
  body('tags.*').optional().isString().withMessage('Все элементы tags должны быть строками'),
  body('tags').custom((tags) => {
    if (tags && tags.length > 10) {
      throw new Error('Максимум 10 тегов')
    }
    return true
  }),
]

export const validateUpdateTask: ValidationChain[] = [
  body('id').custom((value) => {
    if (typeof value === 'string') {
      const num = parseInt(value)
      if (isNaN(num) || num < 0) throw new Error('ID должен быть положительным числом')
    } else if (typeof value === 'number') {
      if (value < 0) throw new Error('ID должен быть положительным числом')
    }
    return true
  }),
  body('title').optional().notEmpty().trim().isLength({ min: 1, max: 200 }).withMessage('Название задачи должно быть от 1 до 200 символов'),
  body('description').optional().isString().isLength({ max: 1000 }).withMessage('Описание не должно превышать 1000 символов'),
  body('userId').optional().custom((value) => {
    if (value === null || value === undefined) return true
    if (typeof value === 'string') {
      const num = parseInt(value)
      if (isNaN(num) || num < 0) throw new Error('userId должен быть положительным числом или null')
    }
    return true
  }),
  body('isPublic').optional().isBoolean().withMessage('isPublic должен быть булевым значением'),
  body('completed').optional().isBoolean().withMessage('completed должен быть булевым значением'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Приоритет должен быть low, medium или high'),
  body('deadline').optional().custom((value) => {
    if (value === null || value === undefined) return true
    if (typeof value === 'string') {
      const date = new Date(value)
      if (isNaN(date.getTime())) throw new Error('deadline должен быть валидной датой ISO8601')
    }
    return true
  }),
  body('category').optional().isString().isLength({ max: 50 }).withMessage('Категория не должна превышать 50 символов'),
  body('tags').optional().isArray().withMessage('tags должен быть массивом'),
  body('tags.*').optional().isString().withMessage('Все элементы tags должны быть строками'),
  body('tags').custom((tags) => {
    if (tags && tags.length > 10) {
      throw new Error('Максимум 10 тегов')
    }
    return true
  }),
]

export const validateDeleteTask: ValidationChain[] = [
  body('id').custom((value) => {
    if (typeof value === 'string') {
      const num = parseInt(value)
      if (isNaN(num) || num < 0) throw new Error('ID должен быть положительным числом')
    } else if (typeof value === 'number') {
      if (value < 0) throw new Error('ID должен быть положительным числом')
    }
    return true
  }),
]

export const validateToggleTaskComplete: ValidationChain[] = [
  body('id').custom((value) => {
    if (typeof value === 'string') {
      const num = parseInt(value)
      if (isNaN(num) || num < 0) throw new Error('ID должен быть положительным числом')
    } else if (typeof value === 'number') {
      if (value < 0) throw new Error('ID должен быть положительным числом')
    }
    return true
  }),
]

