export interface IUser{
    id: number,
    name: string,
    surname: string
    isAdmin: boolean,
    photo: string[],
    additionalData: string | undefined
}