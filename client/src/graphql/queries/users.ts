import { gql } from '@apollo/client';

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
`;

export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      surname
      isAdmin
      photo
      additionalData
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
      surname
      isAdmin
      photo
      additionalData
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

export const CHANGE_ADMIN_STATUS = gql`
  mutation ChangeAdminStatus($id: ID!, $status: Boolean!) {
    changeAdminStatus(id: $id, status: $status) {
      id
      name
      surname
      isAdmin
      photo
      additionalData
    }
  }
`;
