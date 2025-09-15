import { type AxiosInstance } from "axios";
import axiosInstance from "./axiosInstance";

export interface IUser {
  id: number;
  name: string;
  surname: string;
  isAdmin: boolean;
  photo: string[];
  additionalData: string | undefined;
}

class UserApi {
  private axiosInstance: AxiosInstance = axiosInstance;

  async getAll(): Promise<IUser[]> {
    const response = await this.axiosInstance.get("/users/");
    return response.data;
  }

  async changeAdminStatus(id: number, status: boolean): Promise<IUser[]> {
    const response = await this.axiosInstance.patch(`/users/adm/${id}`, {
      status: status,
    });
    return response.data;
  }

  async filterByName(name: string): Promise<IUser[]> {
    const response = await this.axiosInstance.post(`/users/filterName`, {
      name: name,
    });
    return response.data;
  }

  async filterBySurName(surname: string): Promise<IUser[]> {
    const response = await this.axiosInstance.post(`/users/filterSurname`, {
      surname: surname,
    });
    return response.data;
  }

  async uploadPhoto(id: number, photo: FormData): Promise<IUser[]> {
    const response = await this.axiosInstance.patch(`/users/file/${id}`, photo, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }

  async changeAdditionalData(id: number, data: string): Promise<IUser[]> {
    const response = await this.axiosInstance.patch(`/users/desc/${id}`, {
      additionalData: data,
    });
    return response.data;
  }

  async addUser(body: Omit<IUser, "id">): Promise<IUser[]> {
    const response = await this.axiosInstance.post("/users/", body);
    return response.data;
  }

  async deleteUser(id: number): Promise<void> {
    await this.axiosInstance.delete(`/${id}`);
  }

  async updateUser(user: Partial<IUser> & {id: number}): Promise<IUser[]> {
    const response = await this.axiosInstance.put(`/users/${user.id}`, user);
    return response.data;
  }
}
const userApiInstance = new UserApi();
export default userApiInstance;
