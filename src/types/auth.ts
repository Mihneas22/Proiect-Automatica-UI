export interface LoginUserDTO {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterUserDTO{
    username: string,
    password: string,
    email: string,
    confirmPassword: string,
}

export interface GetUserDTO{
    Username: string,
    Email: string,
}
