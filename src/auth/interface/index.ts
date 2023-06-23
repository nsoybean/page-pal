export interface IUserDetails {
  email?: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  accessToken?: string;
}

export interface IGoogleLogin {
  email: string;
  access_token: string;
}
