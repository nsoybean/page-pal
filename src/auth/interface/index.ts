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
  access_token: string;
}

export interface IJwtPayload {
  sub: string;
  email: string;
}
