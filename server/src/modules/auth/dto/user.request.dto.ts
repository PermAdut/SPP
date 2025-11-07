import { IAuthUser } from '../auth.interface'
export interface LoginRequestDto extends Pick<IAuthUser, 'username'> {
  password: string
}
