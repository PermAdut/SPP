import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ITask, SocketResponse } from '../../api/task.api'
import socketService from '../../services/socket.service'

interface TaskState {
  isLoading: boolean
  error: string | null
  tasks: ITask[]
}

const initialState: TaskState = {
  isLoading: false,
  error: null,
  tasks: [],
}

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<ITask[]>) => {
      state.tasks = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    addTask: (state, action: PayloadAction<ITask>) => {
      state.tasks.push(action.payload)
    },
    updateTask: (state, action: PayloadAction<ITask>) => {
      const index = state.tasks.findIndex((t) => t.id === action.payload.id)
      if (index !== -1) {
        state.tasks[index] = action.payload
      }
    },
    removeTask: (state, action: PayloadAction<number>) => {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload)
    },
  },
})

export const {
  setTasks,
  setLoading,
  setError,
  addTask,
  updateTask,
  removeTask,
} = taskSlice.actions

export const getAllTasks = () => (dispatch: any) => {
  const socket = socketService.getSocket()
  if (!socket) {
    dispatch(setError('Socket not connected'))
    return
  }

  dispatch(setLoading(true))
  socket.emit('tasks:getAll')

  socket.once('tasks:getAll:response', (response: SocketResponse<ITask[]>) => {
    dispatch(setLoading(false))
    if (response.success && response.data) {
      dispatch(setTasks(response.data))
    } else {
      dispatch(setError(response.error || 'Failed to fetch tasks'))
    }
  })
}

export const createTask = (taskData: Omit<ITask, 'id' | 'createdAt'>) => (dispatch: any) => {
  const socket = socketService.getSocket()
  if (!socket) {
    const error = 'Socket not connected'
    dispatch(setError(error))
    return Promise.reject(new Error(error))
  }

  dispatch(setLoading(true))
  socket.emit('tasks:create', taskData)

  return new Promise<void>((resolve, reject) => {
    socket.once('tasks:create:response', (response: SocketResponse<ITask[]>) => {
      dispatch(setLoading(false))
      if (response.success && response.data) {
        dispatch(setTasks(response.data))
        resolve()
      } else {
        const error = response.error || 'Failed to create task'
        dispatch(setError(error))
        reject(new Error(error))
      }
    })

    socket.once('tasks:update', (tasks: ITask[]) => {
      dispatch(setTasks(tasks))
    })
  })
}

export const updateTaskAction = (id: number, updates: Partial<Omit<ITask, 'id' | 'createdAt'>>) => (dispatch: any) => {
  const socket = socketService.getSocket()
  if (!socket) {
    const error = 'Socket not connected'
    dispatch(setError(error))
    return Promise.reject(new Error(error))
  }

  dispatch(setLoading(true))
  socket.emit('tasks:update', { id, updates })

  return new Promise<void>((resolve, reject) => {
    socket.once('tasks:update:response', (response: SocketResponse<ITask[]>) => {
      dispatch(setLoading(false))
      if (response.success && response.data) {
        dispatch(setTasks(response.data))
        resolve()
      } else {
        const error = response.error || 'Failed to update task'
        dispatch(setError(error))
        reject(new Error(error))
      }
    })

    socket.once('tasks:update', (tasks: ITask[]) => {
      dispatch(setTasks(tasks))
    })
  })
}

export const deleteTask = (id: number) => (dispatch: any) => {
  const socket = socketService.getSocket()
  if (!socket) {
    const error = 'Socket not connected'
    dispatch(setError(error))
    return Promise.reject(new Error(error))
  }

  dispatch(setLoading(true))
  socket.emit('tasks:delete', id)

  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      dispatch(setLoading(false))
      dispatch(getAllTasks())
      socket.off('tasks:delete:response', responseHandler)
      resolve()
    }, 1500)

    const responseHandler = (response: SocketResponse<void>) => {
      clearTimeout(timeout)
      socket.off('tasks:delete:response', responseHandler)
      
      if (response.success) {
        setTimeout(() => {
          dispatch(getAllTasks())
          dispatch(setLoading(false))
        }, 100)
        resolve()
      } else {
        dispatch(setLoading(false))
        const error = response.error || 'Failed to delete task'
        dispatch(setError(error))
        reject(new Error(error))
      }
    }

    socket.once('tasks:delete:response', responseHandler)
  })
}

export const toggleTaskComplete = (id: number) => (dispatch: any) => {
  const socket = socketService.getSocket()
  if (!socket) {
    dispatch(setError('Socket not connected'))
    return Promise.reject('Socket not connected')
  }

  socket.emit('tasks:toggleComplete', id)

  socket.once('tasks:toggleComplete:response', (response: SocketResponse<ITask[]>) => {
    if (response.success && response.data) {
      dispatch(setTasks(response.data))
    } else {
      dispatch(setError(response.error || 'Failed to toggle task'))
    }
  })

  socket.once('tasks:update', (tasks: ITask[]) => {
    dispatch(setTasks(tasks))
  })
}

export default taskSlice.reducer

