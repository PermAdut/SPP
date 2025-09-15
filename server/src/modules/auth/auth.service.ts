/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from 'bcrypt'
import jwtUtil from '../../utils/jwt.util'
import { AppError } from '../../middlewares/error.middleware'
import { HttpStatusCode } from '../../utils/statusCodes'
import { LoginRequestDto, RegisterRequestDto, UsernameRequestDto } from './dto/user.request.dto'
import { UsernameResponseDto, UserResponseDto } from './dto/user.response.dto'
import { IUser } from './types/user.intreface'

async function loginUser(credentials: LoginRequestDto): Promise<UserResponseDto> {
  try {
    const findUser: IUser = await authRepositoryInstance.findUserByUsername(credentials.username)
    if (!(await bcrypt.compare(credentials.password, findUser.passwordHash)))
      throw new AppError(HttpStatusCode.BAD_REQUEST, 'Invalid password')
    const accessToken = await jwtUtil.generateAccessToken(findUser.username, findUser.id)
    const refreshToken = await jwtUtil.generateRefreshToken(findUser.username, findUser.id)
    return {
      username: findUser.username,
      accessToken: accessToken,
      refreshToken: refreshToken,
    }
  } catch (err: any) {
    throw new AppError(
      err?.status || HttpStatusCode.INTERNAL_SERVER_ERROR,
      err?.message ||'Internal server error',
    )
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
    await authRepositoryInstance.findUserById(payload.id)
    const accessToken = await jwtUtil.generateAccessToken(payload.username, payload.id)
    return {
      accessToken: accessToken,
      username: payload.username,
    }
  } catch (err: any) {
    throw new AppError(
      err?.status || HttpStatusCode.INTERNAL_SERVER_ERROR,
      err?.message || 'Internal server error',
    )
  }
}


export default {
  loginUser,
  generateNewAccessToken,
}