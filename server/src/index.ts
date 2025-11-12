import express, { Application } from 'express'
import cors from 'cors'
import { createServer } from 'http'
import cookieParser from 'cookie-parser'
import errorHandler from './middlewares/error.middleware'
import path from 'path'
import { useServer } from 'graphql-ws/lib/use/ws'
import { WebSocketServer } from 'ws'
import { createApolloServer, schema } from './graphql/apolloServer'

const corsOptions = {
  origin: 'http://localhost:5173',
  methods: 'GET,POST',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true,
}

const app: Application = express()
const httpServer = createServer(app)
const imagePath = path.join(__dirname, '..', 'public', 'img')

app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())
app.use('/images', express.static(imagePath))

const apolloServer = createApolloServer()

async function startServer() {
  await apolloServer.start()
  apolloServer.applyMiddleware({ app, cors: false, path: '/graphql' })

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  })

  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx) => {
        const token = ctx.connectionParams?.authorization?.replace('Bearer ', '') || ctx.connectionParams?.token
        if (token) {
          try {
            const jwtUtil = (await import('./utils/jwt.util.js')).default
            const userDatabaseInstance = (await import('./utils/userDb.js')).default
            const payload = await jwtUtil.verifyAccessToken(token)
            const user = userDatabaseInstance.getById(payload.id)
            return {
              userId: payload.id,
              username: payload.username,
              isAdmin: user?.isAdmin || false,
            }
          } catch {
            return {}
          }
        }
        return {}
      },
    },
    wsServer
  )

  app.use(errorHandler)

  httpServer.listen(3000, () => {
    console.log('Server started on port 3000')
    console.log(`GraphQL endpoint: http://localhost:3000${apolloServer.graphqlPath}`)
    console.log(`GraphQL subscriptions: ws://localhost:3000${apolloServer.graphqlPath}`)
  })

  httpServer.on('close', async () => {
    await serverCleanup.dispose()
  })
}

startServer().catch((error) => {
  console.error('Failed to start server:', error)
})
