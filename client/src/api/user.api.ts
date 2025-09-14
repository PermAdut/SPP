import axios, { type AxiosInstance } from "axios";

export interface IUser {
  id: number;
  name: string;
  surname: string;
  isAdmin: boolean;
  photo: string[];
  additionalData: string | undefined;
}

class UserApi {
  private axiosInstance: AxiosInstance = axios.create({
    baseURL: "http://localhost:3000/api/v1.0/users",
  });
  constructor() {
    this.axiosInstance.interceptors.response.use(
      (res) => res,
      (err) => {
        console.error(err);
        throw err;
      }
    );
  }

  async getAll(): Promise<IUser[]> {
    const response = await this.axiosInstance.get("/all");
    return response.data;
  }

  async changeAdminStatus(id: number, status: boolean): Promise<IUser[]> {
    const response = await this.axiosInstance.patch(`/adm/${id}`, {
      status: status,
    });
    return response.data;
  }

  async filterByName(name: string): Promise<IUser[]> {
    const response = await this.axiosInstance.post(`/filterName`, {
      name: name,
    });
    return response.data;
  }

  async filterBySurName(surname: string): Promise<IUser[]> {
    const response = await this.axiosInstance.post(`/filterSurname`, {
      surname: surname,
    });
    return response.data;
  }

  async uploadPhoto(id: number, photo: FormData): Promise<IUser[]> {
    const response = await this.axiosInstance.patch(`/file/${id}`, photo, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }

  async changeAdditionalData(id: number, data: string): Promise<IUser[]> {
    const response = await this.axiosInstance.patch(`/desc/${id}`, {
      additionalData: data,
    });
    return response.data;
  }

  async addUser(body: Omit<IUser, "id">): Promise<IUser[]> {
    const response = await this.axiosInstance.post("/add", body);
    return response.data;
  }
}
const userApiInstance = new UserApi();
export default userApiInstance;
