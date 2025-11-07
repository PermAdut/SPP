import { gql } from 'apollo-server-express'

export const typeDefs = gql`
  enum TaskPriority {
    low
    medium
    high
  }

  type Task {
    id: ID!
    title: String!
    description: String
    userId: ID
    isPublic: Boolean!
    completed: Boolean!
    createdAt: String!
    priority: TaskPriority!
    deadline: String
    category: String!
    tags: [String!]!
  }

  input CreateTaskInput {
    title: String!
    description: String
    isPublic: Boolean!
    priority: TaskPriority!
    deadline: String
    category: String
    tags: [String!]
  }

  input UpdateTaskInput {
    title: String
    description: String
    isPublic: Boolean
    priority: TaskPriority
    deadline: String
    category: String
    tags: [String!]
  }

  type Query {
    tasks: [Task!]!
    task(id: ID!): Task
  }

  type Mutation {
    createTask(input: CreateTaskInput!): Task!
    updateTask(id: ID!, input: UpdateTaskInput!): Task!
    deleteTask(id: ID!): Boolean!
    toggleTaskComplete(id: ID!): Task!
  }

  type Subscription {
    taskUpdated: Task!
    taskDeleted: ID!
  }
`

