import { apolloClient } from '../apollo/client'
import { LOGIN, REFRESH_TOKEN } from '../graphql/queries'

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken?: string
}

class AuthApi {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: LOGIN,
        variables: { credentials },
      })

      if (data?.login) {
        localStorage.setItem('accessToken', data.login.accessToken)
        if (data.login.refreshToken) {
          localStorage.setItem('refreshToken', data.login.refreshToken)
        }
        return data.login
      }

      throw new Error('Login failed')
    } catch (error: any) {
      throw new Error(error.message || 'Login failed')
    }
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: REFRESH_TOKEN,
        variables: { refreshToken },
      })

      if (data?.refreshToken?.accessToken) {
        localStorage.setItem('accessToken', data.refreshToken.accessToken)
        return {
          accessToken: data.refreshToken.accessToken,
          refreshToken,
        }
      }

      throw new Error('Refresh failed')
    } catch (error: any) {
      throw new Error(error.message || 'Refresh failed')
    }
  }
}

const authApiInstance = new AuthApi()
export default authApiInstance