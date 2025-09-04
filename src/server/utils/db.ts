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
  private users: IUser[] = []

  constructor() {
    this.users = testUsers
  }

  getAll() {
    return this.users
  }

  changeAdminStatus(id: number, status: boolean) {
    this.users[id].isAdmin = status
  }

  filterByName(name: string): IUser[] {
    return this.users.filter((el) => {
      if (el.name.includes(name)) return el
    })
  }

  filterBySurName(surName: string): IUser[] {
    return this.users.filter((el) => {
      if (el.surname.includes(surName)) return el
    })
  }

  uploadPhoto(id: number, photo: string): IUser {
    this.users[id].photo.push(photo)
    return this.users[id]
  }

  changeAdditionalData(id: number, data: string): IUser {
    this.users[id].additionalData = data
    return this.users[id]
  }
}
const userDatabaseInstance = new UserDatabase()
export default userDatabaseInstance
