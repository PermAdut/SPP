import { gql } from 'apollo-server-express'

export const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    surname: String!
    isAdmin: Boolean!
    photo: [String!]!
    additionalData: String
  }

  type Task {
    id: ID!
    title: String!
    description: String!
    userId: ID
    isPublic: Boolean!
    completed: Boolean!
    createdAt: String!
    priority: TaskPriority!
    deadline: String
    category: String!
    tags: [String!]!
  }

  enum TaskPriority {
    low
    medium
    high
  }

  type AuthResponse {
    accessToken: String!
    refreshToken: String!
  }

  type RefreshTokenResponse {
    accessToken: String!
  }

  input LoginInput {
    username: String!
    password: String!
  }

  input CreateUserInput {
    name: String!
    surname: String!
    isAdmin: Boolean!
    photo: [String!]!
    additionalData: String
  }

  input UpdateUserInput {
    id: ID!
    name: String
    surname: String
    isAdmin: Boolean
    photo: [String!]
    additionalData: String
  }

  input CreateTaskInput {
    title: String!
    description: String!
    userId: ID
    isPublic: Boolean!
    completed: Boolean!
    priority: TaskPriority!
    deadline: String
    category: String!
    tags: [String!]!
  }

  input UpdateTaskInput {
    id: ID!
    title: String
    description: String
    userId: ID
    isPublic: Boolean
    completed: Boolean
    priority: TaskPriority
    deadline: String
    category: String
    tags: [String!]
  }

  input ChangeAdminStatusInput {
    id: ID!
    status: Boolean!
  }

  input UploadPhotoInput {
    id: ID!
    filename: String!
  }

  input ChangeAdditionalDataInput {
    id: ID!
    data: String!
  }

  input FilterByNameInput {
    name: String!
  }

  input FilterBySurnameInput {
    surname: String!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
    tasks: [Task!]!
    task(id: ID!): Task
    filterUsersByName(name: String!): [User!]!
    filterUsersBySurname(surname: String!): [User!]!
  }

  type Mutation {
    login(credentials: LoginInput!): AuthResponse!
    refreshToken(refreshToken: String!): RefreshTokenResponse!

    createUser(user: CreateUserInput!): [User!]!
    updateUser(user: UpdateUserInput!): [User!]!
    deleteUser(id: ID!): Boolean!
    changeAdminStatus(input: ChangeAdminStatusInput!): [User!]!
    uploadPhoto(input: UploadPhotoInput!): [User!]!
    changeAdditionalData(input: ChangeAdditionalDataInput!): [User!]!

    createTask(task: CreateTaskInput!): [Task!]!
    updateTask(task: UpdateTaskInput!): [Task!]!
    deleteTask(id: ID!): Boolean!
    toggleTaskComplete(id: ID!): [Task!]!
  }

  type Subscription {
    usersUpdated: [User!]!
    tasksUpdated: [Task!]!
  }
`

