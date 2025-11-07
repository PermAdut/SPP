import socketService from '../services/socket.service'

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken?: string
}

interface SocketAuthResponse {
  success: boolean
  data?: AuthResponse
  error?: string
}

class AuthApi {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return new Promise((resolve, reject) => {
      const socket = socketService.connect()
      
      socket.emit('auth:login', credentials)
      
      socket.once('auth:login:response', (response: SocketAuthResponse) => {
        if (response.success && response.data) {
          socketService.reconnect(response.data.accessToken).then(() => {
            resolve(response.data!)
          }).catch(reject)
        } else {
          reject(new Error(response.error || 'Login failed'))
        }
      })
    })
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    return new Promise((resolve, reject) => {
      const socket = socketService.getSocket()
      if (!socket) {
        reject(new Error('Socket not connected'))
        return
      }

      socket.emit('auth:refresh', refreshToken)
      
      socket.once('auth:refresh:response', (response: SocketAuthResponse) => {
        if (response.success && response.data) {
          socketService.reconnect(response.data.accessToken).then(() => {
            resolve(response.data!)
          }).catch(reject)
        } else {
          reject(new Error(response.error || 'Refresh failed'))
        }
      })
    })
  }
}

const authApiInstance = new AuthApi()
export default authApiInstance