import { gql } from '@apollo/client'

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

export const CREATE_TASK = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
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
  mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
    updateTask(id: $id, input: $input) {
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

export const TASK_UPDATED_SUBSCRIPTION = gql`
  subscription TaskUpdated {
    taskUpdated {
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

export const TASK_DELETED_SUBSCRIPTION = gql`
  subscription TaskDeleted {
    taskDeleted
  }
`

