export interface IUser {
  id: string;
  name: string;
  surname: string;
  isAdmin: boolean;
  photo: string[];
  additionalData: string | undefined;
}
