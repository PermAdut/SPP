import { IUser } from '../auth.interface'
export interface LoginRequestDto extends Pick<IUser, 'username'> {
  password: string
}
