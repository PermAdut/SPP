import { IUser } from '../modules/users/user.intreface.js'

const testUsers: IUser[] = [
  {
    id: 1,
    name: 'John',
    surname: 'Doe',
    isAdmin: true,
    photo: ['extra.svg', 'logo.svg'],
    additionalData: 'Software Engineer',
  },
  {
    id: 2,
    name: 'Jane',
    surname: 'Smith',
    isAdmin: false,
    photo: ['spring-boot.svg'],
    additionalData: undefined,
  },
  {
    id: 3,
    name: 'Alice',
    surname: 'Johnson',
    isAdmin: false,
    photo: ['spring-cloud.svg', 'spring.svg'],
    additionalData: 'Data Scientist',
  },
  {
    id: 4,
    name: 'Bob',
    surname: 'Williams',
    isAdmin: true,
    photo: ['extra.svg'],
    additionalData: 'Product Manager',
  },
  {
    id: 5,
    name: 'Emma',
    surname: 'Davis',
    isAdmin: false,
    photo: ['logo.svg', 'spring.svg'],
    additionalData: undefined,
  },
]

class UserDatabase {
  private users: IUser[] = [...testUsers]
  getAll() {
    return this.users
  }

  changeAdminStatus(id: number, status: boolean):IUser[] {
    this.users = this.users.map((user) =>
      user.id === id ? { ...user, isAdmin: status } : user
    );

    return [...this.users];
  }

  filterByName(name: string): IUser[] {
    return this.users.filter((user) =>
      user.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  filterBySurName(surname: string): IUser[] {
    return this.users.filter((user) =>
      user.surname.toLowerCase().includes(surname.toLowerCase())
    );
  }

  uploadPhoto(id: number, photo: string): IUser[] {
    this.users = this.users.map((user) =>
      user.id === id ? { ...user, photo: [...user.photo, photo] } : user
    );
    return [...this.users];
  }

  changeAdditionalData(id: number, data: string): IUser[] {
    this.users = this.users.map((user) =>
      user.id === id ? { ...user, additionalData: data } : user
    );
    return [...this.users];
  }
}
const userDatabaseInstance = new UserDatabase()
export default userDatabaseInstance
