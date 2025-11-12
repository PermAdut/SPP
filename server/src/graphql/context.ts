import { Request, Response } from 'express'
import jwtUtil from '../utils/jwt.util'
import userDatabaseInstance from '../utils/userDb'

export interface GraphQLContext {
  userId?: number
  username?: string
  isAdmin?: boolean
  req: Request
  res: Response
}

export const createContext = async ({ req, res }: { req: Request; res: Response }): Promise<GraphQLContext> => {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.accessToken

  if (!token) {
    return { req, res }
  }

  try {
    const payload = await jwtUtil.verifyAccessToken(token)
    const user = userDatabaseInstance.getById(payload.id)

    return {
      userId: payload.id,
      username: payload.username,
      isAdmin: user?.isAdmin || false,
      req,
      res,
    }
  } catch {
    return { req, res }
  }
}

