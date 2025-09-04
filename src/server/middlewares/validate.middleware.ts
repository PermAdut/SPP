import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'

export default function (req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({
        error: errors
          .array()
          .map((el) => el.msg)
          .join('; '),
      })
    }
    next()
  } catch (err) {
    next(err)
  }
}
