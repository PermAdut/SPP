import { IUser } from '../user.interface'
export interface LoginRequestDto extends Pick<IUser, 'username'> {
  password: string
}
