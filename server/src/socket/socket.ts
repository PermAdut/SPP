import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'
import { authenticateSocket, setupUserHandlers, setupTaskHandlers } from './socket.handlers'

interface AuthenticatedSocket extends Socket {
  userId?: number
  username?: string
}

export const initializeSocket = (httpServer: HttpServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  })

  io.use(async (socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return next(new Error('Authentication error'))
    }
    try {
      await authenticateSocket(socket, token)
      next()
    } catch (error) {
      next(new Error('Authentication error'))
    }
  })

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.username} (${socket.userId})`)

    // Настройка обработчиков
    setupUserHandlers(io, socket)
    setupTaskHandlers(io, socket)

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.username} (${socket.userId})`)
    })
  })

  return io
}
