import jwtUtil from '../../utils/jwt.util'
import { AppError } from '../../middlewares/error.middleware'
import { HttpStatusCode } from '../../utils/statusCodes'
import { LoginRequestDto } from './dto/user.request.dto'
import { UserResponseDto } from './dto/user.response.dto'
import { IAuthUser } from './auth.interface'

export const authUsers: IAuthUser[] = [
  { id: 0, username: 'admin', password: '1234' },
  { id: 1, username: 'user', password: '1234' },
  { id: 2, username: 'user2', password: '1234' },
  { id: 3, username: 'user3', password: '1234' },
  { id: 4, username: 'user4', password: '1234' },
  { id: 5, username: 'user5', password: '1234' },
  { id: 6, username: 'user6', password: '1234' },
  { id: 7, username: 'user7', password: '1234' },
  { id: 8, username: 'user8', password: '1234' },
  { id: 9, username: 'user9', password: '1234' },
  { id: 10, username: 'user10', password: '1234' },
]
async function loginUser(credentials: LoginRequestDto): Promise<UserResponseDto> {
  try {
    const findUser = authUsers.find((el) => el.username === credentials.username)
    if (!findUser) {
      throw new AppError(HttpStatusCode.BAD_REQUEST, 'User not found')
    }
    if (findUser.password !== credentials.password) {
      throw new AppError(HttpStatusCode.BAD_REQUEST, 'Invalid password')
    }
    const accessToken = await jwtUtil.generateAccessToken(findUser.username, findUser.id)
    const refreshToken = await jwtUtil.generateRefreshToken(findUser.username, findUser.id)
    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    }
  } catch (err: any) {
    throw new AppError(err?.status || HttpStatusCode.INTERNAL_SERVER_ERROR, err?.message || 'Internal server error')
  }
}

async function generateNewAccessToken(
  refreshToken: string | undefined,
): Promise<Omit<UserResponseDto, 'refreshToken'>> {
  try {
    if (!refreshToken) {
      throw new AppError(HttpStatusCode.UNAUTHORIZED, 'Refresh token not provided')
    }
    const payload = await jwtUtil.verifyRefreshToken(refreshToken)
    const accessToken = await jwtUtil.generateAccessToken(payload.username, payload.id)
    return {
      accessToken: accessToken,
    }
  } catch (err: any) {
    throw new AppError(err?.status || HttpStatusCode.INTERNAL_SERVER_ERROR, err?.message || 'Internal server error')
  }
}

export default {
  loginUser,
  generateNewAccessToken,
}
