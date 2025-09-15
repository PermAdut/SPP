import { NextFunction, Request, Response } from 'express'
import { AppError } from './error.middleware'
import jwtUtil from '../utils/jwt.util'
import { HttpStatusCode } from '../utils/statusCodes'

export interface JWTPayloadDto {
  userId: number
  username: string
}

export default async function authenticateJwt(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(HttpStatusCode.UNAUTHORIZED, 'Missing or invalid Authorization header')
    }
    const token = authHeader.replace('Bearer ', '')
    const payload = await jwtUtil.verifyAccessToken(token)

    req.body = { ...req.body, userId: payload.id, username: payload.username }
    next()
  } catch (err) {
    next(err)
  }
}