import { ValidationChain, validationResult } from 'express-validator'
import { AppError } from '../../middlewares/error.middleware'

export const validate = (validations: ValidationChain[]) => {
  return async (req: any, res: any, next: any) => {
    await Promise.all(validations.map((validation) => validation.run(req)))

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => err.msg).join(', ')
      throw new AppError(400, errorMessages)
    }

    next()
  }
}

