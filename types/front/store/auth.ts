export interface SignInUser {
  username: string
  password: string
}

export interface State {
  data: {
    fetched: boolean
    user?: User
  }
}

export interface User {
  username: string
  name: string
  email: string
  thumbnail: string
}

export interface AuthToken {
  token: string
  user_email: string
  user_nicename: string
  user_display_name: string
  user_thumbnail: string
}

export function parseUser(data?: AuthToken): User | undefined {
  if (!data) return undefined
  return {
    username: data.user_nicename,
    name: data.user_display_name,
    email: data.user_email,
    thumbnail: data.user_thumbnail,
  }
}

export interface AuthTokenValidate {
  code: string
}

export interface Cookie {
  token: string
  user: User
}
