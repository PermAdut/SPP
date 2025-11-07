import { io, Socket } from 'socket.io-client'

class SocketService {
  private socket: Socket | null = null

  connect(token?: string): Socket {
    if (this.socket?.connected) {
      if (token && this.socket.auth?.token !== token) {
        this.disconnect()
      } else {
        return this.socket
      }
    }

    const authConfig = token ? { token } : {}
    
    this.socket = io('http://localhost:3000', {
      auth: authConfig,
      transports: ['websocket', 'polling'],
    })

    this.socket.on('connect', () => {
      console.log('Socket connected', token ? 'with auth' : 'without auth')
    })

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected')
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })

    return this.socket
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  reconnect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        this.connect(token)
        resolve()
        return
      }

      this.socket.auth = { token }
      
      this.socket.emit('auth:reconnect', token)
      
      this.socket.once('auth:reconnect:response', (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve()
        } else {
          reject(new Error(response.error || 'Reconnection failed'))
        }
      })
    })
  }

  getSocket(): Socket | null {
    return this.socket
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }
}

const socketService = new SocketService()
export default socketService

