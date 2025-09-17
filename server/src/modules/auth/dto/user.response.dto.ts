import { IUser } from '../auth.interface'
export interface UserResponseDto {
  accessToken: string
  refreshToken: string
}
