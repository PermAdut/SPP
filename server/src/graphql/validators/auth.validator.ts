import { body, ValidationChain } from 'express-validator'

export const validateLogin: ValidationChain[] = [
  body('username').notEmpty().withMessage('Логин обязателен').trim().isLength({ min: 1, max: 50 }).withMessage('Логин должен быть от 1 до 50 символов'),
  body('password').notEmpty().withMessage('Пароль обязателен').isLength({ min: 1, max: 100 }).withMessage('Пароль должен быть от 1 до 100 символов'),
]

export const validateRefreshToken: ValidationChain[] = [
  body('refreshToken').notEmpty().withMessage('Refresh token обязателен').isString(),
]

