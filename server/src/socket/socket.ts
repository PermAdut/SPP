import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'
import { authenticateSocket, setupTaskHandlers, setupAuthHandlers } from './socket.handlers'

interface AuthenticatedSocket extends Socket {
  userId?: number
  username?: string
  isAuthenticated?: boolean
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
    if (token) {
      try {
        await authenticateSocket(socket, token)
        socket.isAuthenticated = true
      } catch (error) {
        socket.isAuthenticated = false
      }
    } else {
      socket.isAuthenticated = false
    }
    next()
  })

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(
      `User connected: ${socket.isAuthenticated ? `${socket.username} (${socket.userId})` : 'Unauthenticated'}`,
    )

    setupAuthHandlers(io, socket)
    setupTaskHandlers(io, socket)

    socket.on('auth:reconnect', async (token: string) => {
      try {
        await authenticateSocket(socket, token)
        socket.isAuthenticated = true
        socket.emit('auth:reconnect:response', { success: true })
        console.log(`User authenticated: ${socket.username} (${socket.userId})`)
      } catch (error: any) {
        socket.emit('auth:reconnect:response', {
          success: false,
          error: error.message || 'Authentication failed',
        })
      }
    })

    socket.on('disconnect', () => {
      console.log(
        `User disconnected: ${socket.isAuthenticated ? `${socket.username} (${socket.userId})` : 'Unauthenticated'}`,
      )
    })
  })

  return io
}
