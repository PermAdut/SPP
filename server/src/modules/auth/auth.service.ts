/* eslint-disable @typescript-eslint/no-explicit-any */
import jwtUtil from '../../utils/jwt.util'
import { AppError } from '../../middlewares/error.middleware'
import { HttpStatusCode } from '../../utils/statusCodes'
import { LoginRequestDto } from './dto/user.request.dto'
import { UserResponseDto } from './dto/user.response.dto'
import { IUser } from './auth.interface'
const users: IUser[] = [{ id: 0, username: 'admin', password: '1234' }]
async function loginUser(credentials: LoginRequestDto): Promise<UserResponseDto> {
  try {
    const findUser = users.find((el) => el.username === credentials.username)
    if (!findUser) {
      throw new AppError(HttpStatusCode.BAD_REQUEST, 'User not found')
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
