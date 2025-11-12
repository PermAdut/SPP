import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { ITask } from '../../api/task.api'
import { apolloClient } from '../../apollo/client'
import {
  GET_TASKS,
  CREATE_TASK,
  UPDATE_TASK,
  DELETE_TASK,
  TOGGLE_TASK_COMPLETE,
  TASKS_UPDATED_SUBSCRIPTION,
} from '../../graphql/queries'

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
    removeTask: (state, action: PayloadAction<string>) => {
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

export const getAllTasks = createAsyncThunk('tasks/getAll', async (_, { dispatch }) => {
  try {
    dispatch(setLoading(true))
    const { data } = await apolloClient.query({
      query: GET_TASKS,
      fetchPolicy: 'network-only',
    })

    if (data?.tasks) {
      dispatch(setTasks(data.tasks))
      dispatch(setLoading(false))
      return data.tasks
    }

    throw new Error('Failed to fetch tasks')
  } catch (error: any) {
    dispatch(setLoading(false))
    const errorMessage = error.message || 'Failed to fetch tasks'
    dispatch(setError(errorMessage))
    throw error
  }
})

export const createTask = createAsyncThunk(
  'tasks/create',
  async (taskData: Omit<ITask, 'id' | 'createdAt'>, { dispatch }) => {
    try {
      dispatch(setLoading(true))
      const { data } = await apolloClient.mutate({
        mutation: CREATE_TASK,
        variables: {
          task: {
            ...taskData,
            userId: taskData.userId || null,
            deadline: taskData.deadline || null,
          },
        },
      })

      if (data?.createTask) {
        dispatch(setTasks(data.createTask))
        dispatch(setLoading(false))
        return data.createTask
      }

      throw new Error('Failed to create task')
    } catch (error: any) {
      dispatch(setLoading(false))
      const errorMessage = error.message || 'Failed to create task'
      dispatch(setError(errorMessage))
      throw error
    }
  }
)

export const updateTaskAction = createAsyncThunk(
  'tasks/update',
  async ({ id, updates }: { id: string; updates: Partial<Omit<ITask, 'id' | 'createdAt'>> }, { dispatch }) => {
    try {
      dispatch(setLoading(true))
      const { data } = await apolloClient.mutate({
        mutation: UPDATE_TASK,
        variables: {
          task: {
            id,
            ...updates,
            userId: updates.userId !== undefined ? updates.userId : null,
            deadline: updates.deadline !== undefined ? updates.deadline : null,
          },
        },
      })

      if (data?.updateTask) {
        dispatch(setTasks(data.updateTask))
        dispatch(setLoading(false))
        return data.updateTask
      }

      throw new Error('Failed to update task')
    } catch (error: any) {
      dispatch(setLoading(false))
      const errorMessage = error.message || 'Failed to update task'
      dispatch(setError(errorMessage))
      throw error
    }
  }
)

export const deleteTask = createAsyncThunk('tasks/delete', async (id: string, { dispatch }) => {
  try {
    dispatch(setLoading(true))
    const { data } = await apolloClient.mutate({
      mutation: DELETE_TASK,
      variables: { id },
    })

    if (data?.deleteTask) {
      await dispatch(getAllTasks())
      dispatch(setLoading(false))
      return id
    }

    throw new Error('Failed to delete task')
  } catch (error: any) {
    dispatch(setLoading(false))
    const errorMessage = error.message || 'Failed to delete task'
    dispatch(setError(errorMessage))
    throw error
  }
})

export const toggleTaskComplete = createAsyncThunk('tasks/toggleComplete', async (id: string, { dispatch }) => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: TOGGLE_TASK_COMPLETE,
      variables: { id },
    })

    if (data?.toggleTaskComplete) {
      dispatch(setTasks(data.toggleTaskComplete))
      return data.toggleTaskComplete
    }

    throw new Error('Failed to toggle task')
  } catch (error: any) {
    const errorMessage = error.message || 'Failed to toggle task'
    dispatch(setError(errorMessage))
    throw error
  }
})

export const subscribeToTasks = (dispatch: any) => {
  const subscription = apolloClient.subscribe({
    query: TASKS_UPDATED_SUBSCRIPTION,
  })

  subscription.subscribe({
    next: ({ data }) => {
      if (data?.tasksUpdated) {
        dispatch(setTasks(data.tasksUpdated))
      }
    },
    error: (error) => {
      console.error('Subscription error:', error)
    },
  })

  return subscription
}

export default taskSlice.reducer
