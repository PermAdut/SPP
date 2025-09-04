import { Request, Response, NextFunction } from 'express'
import { UserResponseDto } from './dto/UserResponseDto'
import { AppError } from '../../middlewares/error.middleware'
import userDatabaseInstance from '../../utils/db'

const getAll = async (req: Request<object, UserResponseDto[], null>, res: Response, next: NextFunction) => {
  try {
    const users = userDatabaseInstance.getAll()
    res.status(200).json(users)
  } catch (error) {
    next(error)
  }
}

const uploadFile = async (
  req: Request<{ id: string }, UserResponseDto, null>,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) {
      throw new AppError(400, 'file not provided')
    }
    const body = userDatabaseInstance.uploadPhoto(Number(req.params.id), req.file.filename)
    res.status(201).json(body)
  } catch (error) {
    next(error)
  }
}

const changeAdm = async (
  req: Request<{ id: string }, UserResponseDto, { status: boolean }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const body = userDatabaseInstance.changeAdminStatus(Number(req.params.id), req.body.status)
    res.status(200).json(body)
  } catch (error) {
    next(error)
  }
}

const filterName = async (
  req: Request<object, UserResponseDto, { name: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const body = userDatabaseInstance.filterByName(req.body.name)
    res.status(200).json(body)
  } catch (error) {
    next(error)
  }
}

const filterSurname = async (
  req: Request<object, UserResponseDto, { surname: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const body = userDatabaseInstance.filterBySurName(req.body.surname)
    res.status(200).json(body)
  } catch (error) {
    next(error)
  }
}

const changeDesc = async (
  req: Request<{id: string}, UserResponseDto, { additionalData: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const body = userDatabaseInstance.changeAdditionalData(Number(req.params.id), req.body.additionalData)
    res.status(200).json(body)
  } catch (error) {
    next(error)
  }
}

export default {
  getAll,
  uploadFile,
  changeAdm,
  filterName,
  filterSurname,
  changeDesc,
}
