import { ApolloServer } from 'apollo-server-express'
import { typeDefs } from './schema.js'
import { resolvers } from './resolvers.js'
import { createContext } from './context.js'
import jwtUtil from '../utils/jwt.util.js'
import userDatabaseInstance from '../utils/db.js'

export const createApolloServer = () => {
  return new ApolloServer({
    typeDefs,
    resolvers,
    context: createContext,
    subscriptions: {
      path: '/graphql',
      onConnect: async (connectionParams: any) => {
        // Обработка подключения для subscriptions
        const token = connectionParams?.authorization?.replace('Bearer ', '') || connectionParams?.token
        if (token) {
          try {
            const payload = await jwtUtil.verifyAccessToken(token)
            const user = userDatabaseInstance.getById(payload.id)
            return {
              userId: payload.id,
              username: payload.username,
              isAdmin: user?.isAdmin || false,
            }
          } catch (error) {
            return {}
          }
        }
        return {}
      },
    } as any,
    formatError: (error) => {
      // Обрабатываем AppError из наших резолверов
      const statusCode = (error.extensions?.exception as any)?.statusCode
      if (statusCode) {
        return {
          message: error.message,
          extensions: {
            code: statusCode,
          },
        }
      }
      return error
    },
  } as any)
}
