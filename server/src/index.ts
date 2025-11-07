import express, { Application } from 'express'
import cors from 'cors'
import { createServer } from 'http'
import errorHandler from './middlewares/error.middleware'
import path from 'path'
import authRouter from './modules/auth/auth.route'
import cookieParser from 'cookie-parser'
import { initializeSocket } from './socket/socket'

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

// Инициализация Socket.IO
initializeSocket(httpServer)

httpServer.listen(3000, () => {
  console.log('Server started on port 3000')
  console.log('Socket.IO server initialized')
})
