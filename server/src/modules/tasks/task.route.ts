import { Router } from 'express'
import upload from '../../utils/multer'
import authMiddleware from '../../middlewares/auth.middleware'

const taskRouter = Router()

taskRouter.route('/upload-files').post(authMiddleware, upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded' })
    }

    const filenames = (req.files as Express.Multer.File[]).map(file => file.filename)
    res.json({ success: true, data: filenames })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default taskRouter
