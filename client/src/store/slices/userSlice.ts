import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { IUser } from '../../api/user.api'
import { apolloClient } from '../../apollo/client'
import {
  GET_USERS,
  CREATE_USER,
  UPDATE_USER,
  DELETE_USER,
  CHANGE_ADMIN_STATUS,
  UPLOAD_PHOTO,
  CHANGE_ADDITIONAL_DATA,
  FILTER_USERS_BY_NAME,
  FILTER_USERS_BY_SURNAME,
  USERS_UPDATED_SUBSCRIPTION,
} from '../../graphql/queries'

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
    removeUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter((user) => user.id !== action.payload)
    },
  },
})

export const { setUsers, setLoading, setError, removeUser } = userSlice.actions

export const getAllUsers = createAsyncThunk('users/getAll', async (_, { dispatch }) => {
  try {
    dispatch(setLoading(true))
    const { data } = await apolloClient.query({
      query: GET_USERS,
      fetchPolicy: 'network-only',
    })

    if (data?.users) {
      dispatch(setUsers(data.users))
      dispatch(setLoading(false))
      return data.users
    }

    throw new Error('Failed to fetch users')
  } catch (error: any) {
    dispatch(setLoading(false))
    const errorMessage = error.message || 'Failed to fetch users'
    dispatch(setError(errorMessage))
    throw error
  }
})

export const createUser = createAsyncThunk('users/create', async (userData: Omit<IUser, 'id'>, { dispatch }) => {
  try {
    dispatch(setLoading(true))
    const { data } = await apolloClient.mutate({
      mutation: CREATE_USER,
      variables: { user: userData },
    })

    if (data?.createUser) {
      dispatch(setUsers(data.createUser))
      dispatch(setLoading(false))
      return data.createUser
    }

    throw new Error('Failed to create user')
  } catch (error: any) {
    dispatch(setLoading(false))
    const errorMessage = error.message || 'Failed to create user'
    dispatch(setError(errorMessage))
    throw error
  }
})

export const updateUser = createAsyncThunk(
  'users/update',
  async (userData: Partial<Omit<IUser, 'id'>> & { id: string }, { dispatch }) => {
    try {
      dispatch(setLoading(true))
      const { data } = await apolloClient.mutate({
        mutation: UPDATE_USER,
        variables: { user: userData },
      })

      if (data?.updateUser) {
        dispatch(setUsers(data.updateUser))
        dispatch(setLoading(false))
        return data.updateUser
      }

      throw new Error('Failed to update user')
    } catch (error: any) {
      dispatch(setLoading(false))
      const errorMessage = error.message || 'Failed to update user'
      dispatch(setError(errorMessage))
      throw error
    }
  }
)

export const deleteUser = createAsyncThunk('users/delete', async (id: string, { dispatch }) => {
  try {
    dispatch(setLoading(true))
    const { data } = await apolloClient.mutate({
      mutation: DELETE_USER,
      variables: { id },
    })

    if (data?.deleteUser) {
      await dispatch(getAllUsers())
      dispatch(setLoading(false))
      return id
    }

    throw new Error('Failed to delete user')
  } catch (error: any) {
    dispatch(setLoading(false))
    const errorMessage = error.message || 'Failed to delete user'
    dispatch(setError(errorMessage))
    throw error
  }
})

export const changeAdm = createAsyncThunk(
  'users/changeAdmin',
  async ({ id, status }: { id: string; status: boolean }, { dispatch }) => {
    try {
      const { data } = await apolloClient.mutate({
        mutation: CHANGE_ADMIN_STATUS,
        variables: { input: { id, status } },
      })

      if (data?.changeAdminStatus) {
        dispatch(setUsers(data.changeAdminStatus))
        return data.changeAdminStatus
      }

      throw new Error('Failed to change admin status')
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to change admin status'
      dispatch(setError(errorMessage))
      throw error
    }
  }
)

export const filterName = createAsyncThunk('users/filterName', async (name: string, { dispatch }) => {
  try {
    dispatch(setLoading(true))
    const { data } = await apolloClient.query({
      query: FILTER_USERS_BY_NAME,
      variables: { name },
      fetchPolicy: 'network-only',
    })

    if (data?.filterUsersByName) {
      dispatch(setUsers(data.filterUsersByName))
      dispatch(setLoading(false))
      return data.filterUsersByName
    }

    throw new Error('Failed to filter users')
  } catch (error: any) {
    dispatch(setLoading(false))
    const errorMessage = error.message || 'Failed to filter users'
    dispatch(setError(errorMessage))
    throw error
  }
})

export const filterSurname = createAsyncThunk('users/filterSurname', async (surname: string, { dispatch }) => {
  try {
    dispatch(setLoading(true))
    const { data } = await apolloClient.query({
      query: FILTER_USERS_BY_SURNAME,
      variables: { surname },
      fetchPolicy: 'network-only',
    })

    if (data?.filterUsersBySurname) {
      dispatch(setUsers(data.filterUsersBySurname))
      dispatch(setLoading(false))
      return data.filterUsersBySurname
    }

    throw new Error('Failed to filter users')
  } catch (error: any) {
    dispatch(setLoading(false))
    const errorMessage = error.message || 'Failed to filter users'
    dispatch(setError(errorMessage))
    throw error
  }
})

export const upload = createAsyncThunk(
  'users/uploadPhoto',
  async ({ id, filename }: { id: string; filename: string }, { dispatch }) => {
    try {
      dispatch(setLoading(true))
      const { data } = await apolloClient.mutate({
        mutation: UPLOAD_PHOTO,
        variables: { input: { id, filename } },
      })

      if (data?.uploadPhoto) {
        dispatch(setUsers(data.uploadPhoto))
        dispatch(setLoading(false))
        return data.uploadPhoto
      }

      throw new Error('Failed to upload photo')
    } catch (error: any) {
      dispatch(setLoading(false))
      const errorMessage = error.message || 'Failed to upload photo'
      dispatch(setError(errorMessage))
      throw error
    }
  }
)

export const changeAddData = createAsyncThunk(
  'users/changeAdditionalData',
  async ({ id, data: addData }: { id: string; data: string }, { dispatch }) => {
    try {
      dispatch(setLoading(true))
      const { data } = await apolloClient.mutate({
        mutation: CHANGE_ADDITIONAL_DATA,
        variables: { input: { id, data: addData } },
      })

      if (data?.changeAdditionalData) {
        dispatch(setUsers(data.changeAdditionalData))
        dispatch(setLoading(false))
        return data.changeAdditionalData
      }

      throw new Error('Failed to update additional data')
    } catch (error: any) {
      dispatch(setLoading(false))
      const errorMessage = error.message || 'Failed to update additional data'
      dispatch(setError(errorMessage))
      throw error
    }
  }
)

export const subscribeToUsers = (dispatch: any) => {
  const subscription = apolloClient.subscribe({
    query: USERS_UPDATED_SUBSCRIPTION,
  })

  subscription.subscribe({
    next: ({ data }) => {
      if (data?.usersUpdated) {
        dispatch(setUsers(data.usersUpdated))
      }
    },
    error: (error) => {
      console.error('Subscription error:', error)
    },
  })

  return subscription
}

export default userSlice.reducer
