export interface IUserDetails {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  accessToken?: string;
}

export interface IGoogleLogin {
  email: string;
  firstName: string;
  lastName: string;
  access_token: string;
  picture?: string;
}

export interface IJwtPayload {
  sub: string;
  email: string;
}
