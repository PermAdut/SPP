import { validationResult, ValidationChain } from 'express-validator'
import { AppError } from '../../middlewares/error.middleware'

export const validateGraphQLInput = async (validations: ValidationChain[], input: any): Promise<void> => {
  const req: any = { body: input }
  await Promise.all(validations.map((validation) => validation.run(req)))

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err: any) => err.msg).join(', ')
    throw new AppError(400, errorMessages)
  }
}

