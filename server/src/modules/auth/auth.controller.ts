import { NextFunction, Request, Response } from 'express'
import { LoginRequestDto } from './dto/user.request.dto'
import { UserResponseDto } from './dto/user.response.dto'
import authService from './auth.service'
import { HttpStatusCode } from '../../utils/statusCodes'

async function login(req: Request<object, UserResponseDto, LoginRequestDto, null>, res: Response, next: NextFunction) {
  try {
    const user = await authService.loginUser(req.body)
    res.cookie('refreshToken', user.refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    res.status(HttpStatusCode.OK).json({ accessToken: user.accessToken })
  } catch (err) {
    next(err)
  }
}

async function refresh(req: Request<object, null, null, null>, res: Response, next: NextFunction) {
  try {
    const refreshToken: string | undefined = req.cookies.refreshToken as string | undefined
    const user = await authService.generateNewAccessToken(refreshToken)
    res.status(HttpStatusCode.OK).json(user)
  } catch (err) {
    next(err)
  }
}

export default {
  login,
  refresh,
}
