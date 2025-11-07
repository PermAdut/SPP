import express, { Application } from 'express'
import cors from 'cors'
import { createServer } from 'http'
import errorHandler from './middlewares/error.middleware'
import path from 'path'
import authRouter from './modules/auth/auth.route'
import cookieParser from 'cookie-parser'
import { createApolloServer } from './graphql/apolloServer'

const corsOptions = {
  origin: `http://localhost:5173`,
  methods: 'GET,POST,PUT,DELETE,PATCH',
  allowedHeaders: 'Content-Type,Authorization,Bearer',
  credentials: true,
}

const app: Application = express()
const httpServer = createServer(app)
const imagePath = path.join(__dirname, '..', 'public', 'img')

app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())
app.use('/api/v1.0/auth', authRouter) // Оставляем REST API только для аутентификации
app.use(errorHandler)
app.use('/images', express.static(imagePath))

// Инициализация Apollo Server
const apolloServer = createApolloServer()

const startServer = async () => {
  await apolloServer.start()
  apolloServer.applyMiddleware({ app, path: '/graphql', cors: corsOptions })
  
  // Устанавливаем обработчик для WebSocket subscriptions
  ;(apolloServer as any).installSubscriptionHandlers(httpServer)

  httpServer.listen(3000, () => {
    console.log('Server started on port 3000')
    console.log(`GraphQL endpoint: http://localhost:3000${apolloServer.graphqlPath}`)
    console.log(`GraphQL subscriptions: ws://localhost:3000${apolloServer.graphqlPath}`)
  })
}

startServer().catch((error) => {
  console.error('Error starting server:', error)
})
