import { AppError } from '../middlewares/error.middleware'
import { IUser } from '../modules/users/user.intreface'

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

  changeAdminStatus(id: number, status: boolean): IUser[] {
    this.users = this.users.map((user) => (user.id === id ? { ...user, isAdmin: status } : user))

    return [...this.users]
  }

  filterByName(name: string): IUser[] {
    return this.users.filter((user) => user.name.toLowerCase().includes(name.toLowerCase()))
  }

  filterBySurName(surname: string): IUser[] {
    return this.users.filter((user) => user.surname.toLowerCase().includes(surname.toLowerCase()))
  }

  uploadPhoto(id: number, photo: string): IUser[] {
    this.users = this.users.map((user) => (user.id === id ? { ...user, photo: [...user.photo, photo] } : user))
    return [...this.users]
  }

  changeAdditionalData(id: number, data: string): IUser[] {
    this.users = this.users.map((user) => (user.id === id ? { ...user, additionalData: data } : user))
    return [...this.users]
  }

  addUser(user: Omit<IUser, 'id'>): IUser[] {
    const lastId = this.users.sort((a, b) => a.id - b.id)[this.users.length - 1].id
    this.users.push({ id: lastId + 1, ...user })
    return this.users
  }

  deleteUser(id: number): void {
    const index = this.users.findIndex((el) => el.id == id)
    if (index === -1) throw new AppError(404, 'User not found')
    this.users.splice(index, 1)
  }

  updateUser(user: Partial<Omit<IUser, 'id'>> & { id: number }): IUser[] {
    const findUser = this.users.find((el) => el.id == user.id)
    if (!findUser) throw new AppError(404, 'User not found')
    this.users = this.users.map((el) => (el.id === user.id ? { ...el, ...user } : el))
    return this.users
  }
}
const userDatabaseInstance = new UserDatabase()
export default userDatabaseInstance
