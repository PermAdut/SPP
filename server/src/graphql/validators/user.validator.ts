import { body, ValidationChain } from 'express-validator'

export const validateCreateUser: ValidationChain[] = [
  body('name').notEmpty().withMessage('Имя обязательно').trim().isLength({ min: 1, max: 100 }).withMessage('Имя должно быть от 1 до 100 символов'),
  body('surname').notEmpty().withMessage('Фамилия обязательна').trim().isLength({ min: 1, max: 100 }).withMessage('Фамилия должна быть от 1 до 100 символов'),
  body('isAdmin').isBoolean().withMessage('isAdmin должен быть булевым значением'),
  body('photo').isArray().withMessage('photo должен быть массивом'),
  body('photo.*').isString().withMessage('Все элементы photo должны быть строками'),
  body('additionalData').optional().isString().isLength({ max: 500 }).withMessage('Дополнительная информация не должна превышать 500 символов'),
]

export const validateUpdateUser: ValidationChain[] = [
  body('id').custom((value) => {
    if (typeof value === 'string') {
      const num = parseInt(value)
      if (isNaN(num) || num < 0) throw new Error('ID должен быть положительным числом')
    } else if (typeof value === 'number') {
      if (value < 0) throw new Error('ID должен быть положительным числом')
    }
    return true
  }),
  body('name').optional().notEmpty().trim().isLength({ min: 1, max: 100 }).withMessage('Имя должно быть от 1 до 100 символов'),
  body('surname').optional().notEmpty().trim().isLength({ min: 1, max: 100 }).withMessage('Фамилия должна быть от 1 до 100 символов'),
  body('isAdmin').optional().isBoolean().withMessage('isAdmin должен быть булевым значением'),
  body('photo').optional().isArray().withMessage('photo должен быть массивом'),
  body('photo.*').optional().isString().withMessage('Все элементы photo должны быть строками'),
  body('additionalData').optional().isString().isLength({ max: 500 }).withMessage('Дополнительная информация не должна превышать 500 символов'),
]

export const validateChangeAdminStatus: ValidationChain[] = [
  body('id').custom((value) => {
    if (typeof value === 'string') {
      const num = parseInt(value)
      if (isNaN(num) || num < 0) throw new Error('ID должен быть положительным числом')
    } else if (typeof value === 'number') {
      if (value < 0) throw new Error('ID должен быть положительным числом')
    }
    return true
  }),
  body('status').isBoolean().withMessage('status должен быть булевым значением'),
]

export const validateUploadPhoto: ValidationChain[] = [
  body('id').custom((value) => {
    if (typeof value === 'string') {
      const num = parseInt(value)
      if (isNaN(num) || num < 0) throw new Error('ID должен быть положительным числом')
    } else if (typeof value === 'number') {
      if (value < 0) throw new Error('ID должен быть положительным числом')
    }
    return true
  }),
  body('filename').notEmpty().withMessage('Имя файла обязательно').isString().isLength({ max: 255 }).withMessage('Имя файла не должно превышать 255 символов'),
]

export const validateChangeAdditionalData: ValidationChain[] = [
  body('id').custom((value) => {
    if (typeof value === 'string') {
      const num = parseInt(value)
      if (isNaN(num) || num < 0) throw new Error('ID должен быть положительным числом')
    } else if (typeof value === 'number') {
      if (value < 0) throw new Error('ID должен быть положительным числом')
    }
    return true
  }),
  body('data').isString().isLength({ max: 500 }).withMessage('Данные не должны превышать 500 символов'),
]

export const validateFilterByName: ValidationChain[] = [
  body('name').notEmpty().withMessage('Имя для фильтрации обязательно').trim(),
]

export const validateFilterBySurname: ValidationChain[] = [
  body('surname').notEmpty().withMessage('Фамилия для фильтрации обязательна').trim(),
]

