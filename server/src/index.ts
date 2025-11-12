import express, { Application } from 'express'
import cors from 'cors'
import { createServer } from 'http'
import errorHandler from './middlewares/error.middleware'
import path from 'path'
import { ApolloServer } from 'apollo-server-express'
import { readFileSync } from 'fs'
import { join } from 'path'
import jwtUtil from './utils/jwt.util'
import userDatabaseInstance from './utils/userDb'
import taskRouter from './modules/tasks/task.route'
import { resolvers } from './graphql/resolvers'

const corsOptions = {
  origin: `http://localhost:5173`,
  methods: 'GET,POST,PUT,DELETE,PATCH',
  allowedHeaders: 'Content-Type,Authorization,Bearer',
  credentials: true,
}

const app: Application = express()
const httpServer = createServer(app)
const imagePath = path.join(__dirname, '..', 'public', 'img')

async function startServer() {
  const typeDefs = readFileSync(join(__dirname, 'graphql', 'schema.graphql'), 'utf8')

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }: any) => {
      const token = req.headers.authorization?.replace('Bearer ', '')
      let user = null

      if (token) {
        try {
          const payload = await jwtUtil.verifyAccessToken(token)
          const userData = userDatabaseInstance.getById(payload.id as number)
          user = {
            id: payload.id,
            username: payload.username,
            isAdmin: userData?.isAdmin || false,
          }
        } catch (error) {
          // Token invalid, user remains null
        }
      }

      return { user }
    },
  })

  await server.start()

  app.use(cors(corsOptions))
  app.use(express.json())
  app.use(errorHandler)
  app.use('/images', express.static(imagePath))
  app.use('/api/tasks', taskRouter)

  // Специальный endpoint для проверки токена без GraphQL
  app.get('/api/auth/verify', async (req, res) => {
    try {
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ valid: false })
      }
      const token = authHeader.replace('Bearer ', '')
      const payload = await jwtUtil.verifyAccessToken(token)
      res.json({ valid: true, user: { id: payload.id, username: payload.username } })
    } catch (error) {
      res.status(401).json({ valid: false })
    }
  })

  server.applyMiddleware({ app, path: '/graphql' })

  httpServer.listen(3000, () => {
    console.log('Server started on port 3000')
    console.log(`GraphQL server ready at http://localhost:3000${server.graphqlPath}`)
  })
}

startServer().catch(console.error)
