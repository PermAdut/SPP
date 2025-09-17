import { Router } from 'express'
import authController from './auth.controller'

const authRouter = Router()

authRouter.route('/login').post(authController.login)
authRouter.route('/refresh').post(authController.refresh)
export default authRouter
