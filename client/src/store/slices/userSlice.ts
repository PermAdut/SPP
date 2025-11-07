/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { IUser } from '../../api/user.api'
import socketService from '../../services/socket.service'

interface SocketResponse<T> {
  success: boolean
  data?: T
  error?: string
}

interface UserState {
  isLoading: boolean
  error: string | null
  users: IUser[]
}

const initialState: UserState = {
  isLoading: false,
  error: null,
  users: [],
}

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<IUser[]>) => {
      state.users = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    removeUser: (state, action: PayloadAction<number>) => {
      state.users = state.users.filter((user) => user.id !== action.payload)
    },
  },
})

export const { setUsers, setLoading, setError, removeUser } = userSlice.actions

// Thunk для получения всех пользователей
export const getAllUsers = () => (dispatch: any) => {
  const socket = socketService.getSocket()
  if (!socket) {
    dispatch(setError('Socket not connected'))
    return
  }

  dispatch(setLoading(true))
  socket.emit('users:getAll')

  socket.once('users:getAll:response', (response: SocketResponse<IUser[]>) => {
    dispatch(setLoading(false))
    if (response.success && response.data) {
      dispatch(setUsers(response.data))
    } else {
      dispatch(setError(response.error || 'Failed to fetch users'))
    }
  })
}

// Thunk для создания пользователя
export const createUser = (userData: Omit<IUser, 'id'>) => (dispatch: any) => {
  const socket = socketService.getSocket()
  if (!socket) {
    dispatch(setError('Socket not connected'))
    return Promise.reject('Socket not connected')
  }

  dispatch(setLoading(true))
  socket.emit('users:create', userData)

  return new Promise<void>((resolve, reject) => {
    socket.once('users:create:response', (response: SocketResponse<IUser[]>) => {
      dispatch(setLoading(false))
      if (response.success && response.data) {
        dispatch(setUsers(response.data))
        resolve()
      } else {
        dispatch(setError(response.error || 'Failed to create user'))
        reject(response.error)
      }
    })

    socket.once('users:update', (users: IUser[]) => {
      dispatch(setUsers(users))
    })
  })
}

// Thunk для обновления пользователя
export const updateUser = (userData: Partial<Omit<IUser, 'id'>> & { id: number }) => (dispatch: any) => {
  const socket = socketService.getSocket()
  if (!socket) {
    dispatch(setError('Socket not connected'))
    return Promise.reject('Socket not connected')
  }

  dispatch(setLoading(true))
  socket.emit('users:update', userData)

  return new Promise<void>((resolve, reject) => {
    socket.once('users:update:response', (response: SocketResponse<IUser[]>) => {
      dispatch(setLoading(false))
      if (response.success && response.data) {
        dispatch(setUsers(response.data))
        resolve()
      } else {
        dispatch(setError(response.error || 'Failed to update user'))
        reject(response.error)
      }
    })

    socket.once('users:update', (users: IUser[]) => {
      dispatch(setUsers(users))
    })
  })
}

// Thunk для удаления пользователя
export const deleteUser = (id: number) => (dispatch: any) => {
  const socket = socketService.getSocket()
  if (!socket) {
    dispatch(setError('Socket not connected'))
    return Promise.reject('Socket not connected')
  }

  dispatch(setLoading(true))
  socket.emit('users:delete', id)

  return new Promise<void>((resolve, reject) => {
    socket.once('users:delete:response', (response: SocketResponse<void>) => {
      dispatch(setLoading(false))
      if (response.success) {
        dispatch(removeUser(id))
        resolve()
      } else {
        dispatch(setError(response.error || 'Failed to delete user'))
        reject(response.error)
      }
    })

    socket.once('users:update', (users: IUser[]) => {
      dispatch(setUsers(users))
    })
  })
}

// Thunk для изменения статуса администратора
export const changeAdm = (id: number, status: boolean) => (dispatch: any) => {
  const socket = socketService.getSocket()
  if (!socket) {
    dispatch(setError('Socket not connected'))
    return Promise.reject('Socket not connected')
  }

  socket.emit('users:changeAdmin', { id, status })

  socket.once('users:changeAdmin:response', (response: SocketResponse<IUser[]>) => {
    if (response.success && response.data) {
      dispatch(setUsers(response.data))
    } else {
      dispatch(setError(response.error || 'Failed to change admin status'))
    }
  })

  socket.once('users:update', (users: IUser[]) => {
    dispatch(setUsers(users))
  })
}

// Thunk для фильтрации по имени
export const filterName = (name: string) => (dispatch: any) => {
  const socket = socketService.getSocket()
  if (!socket) {
    dispatch(setError('Socket not connected'))
    return
  }

  dispatch(setLoading(true))
  socket.emit('users:filterName', name)

  socket.once('users:filterName:response', (response: SocketResponse<IUser[]>) => {
    dispatch(setLoading(false))
    if (response.success && response.data) {
      dispatch(setUsers(response.data))
    } else {
      dispatch(setError(response.error || 'Failed to filter users'))
    }
  })
}

// Thunk для фильтрации по фамилии
export const filterSurname = (surname: string) => (dispatch: any) => {
  const socket = socketService.getSocket()
  if (!socket) {
    dispatch(setError('Socket not connected'))
    return
  }

  dispatch(setLoading(true))
  socket.emit('users:filterSurname', surname)

  socket.once('users:filterSurname:response', (response: SocketResponse<IUser[]>) => {
    dispatch(setLoading(false))
    if (response.success && response.data) {
      dispatch(setUsers(response.data))
    } else {
      dispatch(setError(response.error || 'Failed to filter users'))
    }
  })
}

// Thunk для загрузки фото
export const upload = (id: number, filename: string) => (dispatch: any) => {
  const socket = socketService.getSocket()
  if (!socket) {
    dispatch(setError('Socket not connected'))
    return Promise.reject('Socket not connected')
  }

  dispatch(setLoading(true))
  socket.emit('users:uploadPhoto', { id, filename })

  return new Promise<void>((resolve, reject) => {
    socket.once('users:uploadPhoto:response', (response: SocketResponse<IUser[]>) => {
      dispatch(setLoading(false))
      if (response.success && response.data) {
        dispatch(setUsers(response.data))
        resolve()
      } else {
        dispatch(setError(response.error || 'Failed to upload photo'))
        reject(response.error)
      }
    })

    socket.once('users:update', (users: IUser[]) => {
      dispatch(setUsers(users))
    })
  })
}

// Thunk для изменения дополнительной информации
export const changeAddData = (id: number, data: string) => (dispatch: any) => {
  const socket = socketService.getSocket()
  if (!socket) {
    dispatch(setError('Socket not connected'))
    return Promise.reject('Socket not connected')
  }

  dispatch(setLoading(true))
  socket.emit('users:changeAdditionalData', { id, data })

  return new Promise<void>((resolve, reject) => {
    socket.once('users:changeAdditionalData:response', (response: SocketResponse<IUser[]>) => {
      dispatch(setLoading(false))
      if (response.success && response.data) {
        dispatch(setUsers(response.data))
        resolve()
      } else {
        dispatch(setError(response.error || 'Failed to update additional data'))
        reject(response.error)
      }
    })

    socket.once('users:update', (users: IUser[]) => {
      dispatch(setUsers(users))
    })
  })
}

export default userSlice.reducer
