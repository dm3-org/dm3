export interface EnsProfileDetails {
  email: string | null,
  github: string | null,
  twitter: string | null,
}

export interface Button {
  buttonText: string,
  actionMethod: Function;
}