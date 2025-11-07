import express, { Application } from 'express'
import cors from 'cors'
import { createServer } from 'http'
import errorHandler from './middlewares/error.middleware'
import path from 'path'
import { initializeSocket } from './socket/socket'
import upload from './utils/multer'

const corsOptions = {
  origin: `http://localhost:5173`,
  methods: 'GET,POST,PUT,DELETE,PATCH',
  allowedHeaders: 'Content-Type,Authorization,Bearer',
  credentials: true,
}

const app: Application = express()
const httpServer = createServer(app)
const imagePath = path.join(__dirname, '..', 'public', 'img')

app.use(cors(corsOptions))
app.use(express.json())
app.use(errorHandler)
app.use('/images', express.static(imagePath))

app.post('/api/tasks/upload-files', upload.array('files', 20), (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ success: false, error: 'No files uploaded' })
    }

    const fileNames = (req.files as Express.Multer.File[]).map((file) => file.filename)
    res.json({ success: true, data: fileNames })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ success: false, error: 'Upload failed' })
  }
})

initializeSocket(httpServer)

httpServer.listen(3000, () => {
  console.log('Server started on port 3000')
  console.log('Socket.IO server initialized')
})
