import axiosInstance from './axiosInstance'

class AuthApi {
  private url: string = '/auth'
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axiosInstance.post(`${this.url}/login`, credentials)
    return response.data
  }

  async refresh(): Promise<AuthResponse> {
    const response = await axiosInstance.post(`${this.url}/refresh`)
    return response.data
  }
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  username: string
  accessToken: string
}

const authApiInstance = new AuthApi()
export default authApiInstance