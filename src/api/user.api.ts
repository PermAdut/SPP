export interface IUser {
  id: number;
  name: string;
  surname: string;
  isAdmin: boolean;
  photo: string[];
  additionalData: string | undefined;
}

class UserApi {
  private users: IUser[] = [];

  constructor() {
    this.users = [
      {
        id: 0,
        name: "John",
        surname: "Doe",
        isAdmin: true,
        photo: ["extra.svg", "logo.svg"],
        additionalData: "Software Engineer",
      },
      {
        id: 1,
        name: "Jane",
        surname: "Smith",
        isAdmin: false,
        photo: ["spring-boot.svg"],
        additionalData: undefined,
      },
      {
        id: 2,
        name: "Alice",
        surname: "Johnson",
        isAdmin: false,
        photo: ["spring-cloud.svg", "spring.svg"],
        additionalData: "Data Scientist",
      },
      {
        id: 3,
        name: "Bob",
        surname: "Williams",
        isAdmin: true,
        photo: ["extra.svg"],
        additionalData: "Product Manager",
      },
      {
        id: 4,
        name: "Emma",
        surname: "Davis",
        isAdmin: false,
        photo: ["logo.svg", "spring.svg"],
        additionalData: undefined,
      },
    ];
  }

  async getAll(): Promise<IUser[]> {
    return [...this.users];
  }

  async changeAdminStatus(id: number, status: boolean): Promise<IUser[]> {
    this.users = this.users.map((user) =>
      user.id === id ? { ...user, isAdmin: status } : user
    );
    return [...this.users];
  }

  async filterByName(name: string): Promise<IUser[]> {
    return this.users.filter((user) =>
      user.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  async filterBySurName(surname: string): Promise<IUser[]> {
    return this.users.filter((user) =>
      user.surname.toLowerCase().includes(surname.toLowerCase())
    );
  }

  async uploadPhoto(id: number, photo: string): Promise<IUser[]> {
    this.users = this.users.map((user) =>
      user.id === id ? { ...user, photo: [...user.photo, photo] } : user
    );
    return [...this.users];
  }

  async changeAdditionalData(id: number, data: string): Promise<IUser[]> {
    this.users = this.users.map((user) =>
      user.id === id ? { ...user, additionalData: data } : user
    );
    return [...this.users];
  }
}
const userApiInstance = new UserApi();
export default userApiInstance;
