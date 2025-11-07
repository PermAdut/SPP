import { ExpressContext } from 'apollo-server-express/dist/ApolloServer'
import jwtUtil from '../utils/jwt.util.js'
import userDatabaseInstance from '../utils/db.js'

export interface GraphQLContext {
  userId?: number
  username?: string
  isAdmin?: boolean
}

export const createContext = async ({ req }: ExpressContext): Promise<GraphQLContext> => {
  const context: GraphQLContext = {}

  try {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')
      const payload = await jwtUtil.verifyAccessToken(token)
      
      context.userId = payload.id
      context.username = payload.username
      
      // Получаем информацию о пользователе из базы данных для проверки прав администратора
      const user = userDatabaseInstance.getById(payload.id)
      context.isAdmin = user?.isAdmin || false
    }
  } catch (error) {
    // Если токен невалиден, просто не устанавливаем userId
    // Это позволит неавторизованным пользователям делать некоторые запросы
  }

  return context
}

