import { Router } from 'express'
import controller from './controller'
import validateMiddleware from '../../middlewares/validate.middleware'
import { body, param } from 'express-validator'
import upload from '../../utils/multer'
import authenticateJwt from '../../middlewares/auth.middleware'

const router = Router()

router.route('/').get(authenticateJwt, controller.getAll)
router
  .route('/file/:id')
  .patch(
    [param('id').isInt({ min: 0 }).withMessage('Id must be positive').toInt()],
    validateMiddleware,
    upload.single('file'),
    authenticateJwt,
    controller.uploadFile,
  )
router
  .route('/desc/:id')
  .patch(
    [param('id').isInt({ min: 0 }).withMessage('Id must be positive').toInt()],
    validateMiddleware,
    authenticateJwt,
    controller.changeDesc,
  )
router
  .route('/adm/:id')
  .patch(
    [
      param('id').isInt({ min: 0 }).withMessage('Id must be positive').toInt(),
      body('status').isBoolean().withMessage('isAdmin must be boolean'),
    ],
    validateMiddleware,
    authenticateJwt,
    controller.changeAdm,
  )
router
  .route('/filterName')
  .post(
    [body('name').isString().withMessage('Filter name must be string')],
    validateMiddleware,
    authenticateJwt,
    controller.filterName,
  )
router
  .route('/filterSurname')
  .post(
    [body('surname').isString().withMessage('Filter surname must be string')],
    validateMiddleware,
    authenticateJwt,
    controller.filterSurname,
  )
router
  .route('/')
  .post(
    [
      body('name').isString().withMessage('Filter name must be string'),
      body('surname').isString().withMessage('Filter surname must be string'),
      body('isAdmin').isBoolean().withMessage('isAdmin must be boolean'),
    ],
    validateMiddleware,
    authenticateJwt,
    controller.addUser,
  )
router
  .route('/:id')
  .delete(
    [param('id').isInt({ min: 0 }).withMessage('Id must be positive').toInt()],
    validateMiddleware,
    authenticateJwt,
    controller.deleteUser,
  )
router
  .route('/:id')
  .put(
    [param('id').isInt({ min: 0 }).withMessage('Id must be positive').toInt()],
    validateMiddleware,
    authenticateJwt,
    controller.updateUser,
  )
export default router
