import { gql } from '@apollo/client'

export const LOGIN = gql`
  mutation Login($credentials: LoginInput!) {
    login(credentials: $credentials) {
      accessToken
      refreshToken
    }
  }
`

export const REFRESH_TOKEN = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      accessToken
    }
  }
`

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      surname
      isAdmin
      photo
      additionalData
    }
  }
`

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      surname
      isAdmin
      photo
      additionalData
    }
  }
`

export const GET_TASKS = gql`
  query GetTasks {
    tasks {
      id
      title
      description
      userId
      isPublic
      completed
      createdAt
      priority
      deadline
      category
      tags
    }
  }
`

export const GET_TASK = gql`
  query GetTask($id: ID!) {
    task(id: $id) {
      id
      title
      description
      userId
      isPublic
      completed
      createdAt
      priority
      deadline
      category
      tags
    }
  }
`

export const CREATE_USER = gql`
  mutation CreateUser($user: CreateUserInput!) {
    createUser(user: $user) {
      id
      name
      surname
      isAdmin
      photo
      additionalData
    }
  }
`

export const UPDATE_USER = gql`
  mutation UpdateUser($user: UpdateUserInput!) {
    updateUser(user: $user) {
      id
      name
      surname
      isAdmin
      photo
      additionalData
    }
  }
`

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`

export const CHANGE_ADMIN_STATUS = gql`
  mutation ChangeAdminStatus($input: ChangeAdminStatusInput!) {
    changeAdminStatus(input: $input) {
      id
      name
      surname
      isAdmin
      photo
      additionalData
    }
  }
`

export const UPLOAD_PHOTO = gql`
  mutation UploadPhoto($input: UploadPhotoInput!) {
    uploadPhoto(input: $input) {
      id
      name
      surname
      isAdmin
      photo
      additionalData
    }
  }
`

export const CHANGE_ADDITIONAL_DATA = gql`
  mutation ChangeAdditionalData($input: ChangeAdditionalDataInput!) {
    changeAdditionalData(input: $input) {
      id
      name
      surname
      isAdmin
      photo
      additionalData
    }
  }
`

export const FILTER_USERS_BY_NAME = gql`
  query FilterUsersByName($name: String!) {
    filterUsersByName(name: $name) {
      id
      name
      surname
      isAdmin
      photo
      additionalData
    }
  }
`

export const FILTER_USERS_BY_SURNAME = gql`
  query FilterUsersBySurname($surname: String!) {
    filterUsersBySurname(surname: $surname) {
      id
      name
      surname
      isAdmin
      photo
      additionalData
    }
  }
`

export const CREATE_TASK = gql`
  mutation CreateTask($task: CreateTaskInput!) {
    createTask(task: $task) {
      id
      title
      description
      userId
      isPublic
      completed
      createdAt
      priority
      deadline
      category
      tags
    }
  }
`

export const UPDATE_TASK = gql`
  mutation UpdateTask($task: UpdateTaskInput!) {
    updateTask(task: $task) {
      id
      title
      description
      userId
      isPublic
      completed
      createdAt
      priority
      deadline
      category
      tags
    }
  }
`

export const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`

export const TOGGLE_TASK_COMPLETE = gql`
  mutation ToggleTaskComplete($id: ID!) {
    toggleTaskComplete(id: $id) {
      id
      title
      description
      userId
      isPublic
      completed
      createdAt
      priority
      deadline
      category
      tags
    }
  }
`

export const TASKS_UPDATED_SUBSCRIPTION = gql`
  subscription TasksUpdated {
    tasksUpdated {
      id
      title
      description
      userId
      isPublic
      completed
      createdAt
      priority
      deadline
      category
      tags
    }
  }
`

export const USERS_UPDATED_SUBSCRIPTION = gql`
  subscription UsersUpdated {
    usersUpdated {
      id
      name
      surname
      isAdmin
      photo
      additionalData
    }
  }
`

