const secret = "ravn_nerdery"
const expiresIn = '1h'

type jwtData = {
  id: number
  role: 'user' | 'moderator'
  type: 'session' | 'password' | 'email' | 'verification',
  accountId?: number
}

type jwtPayload = {
  id: number
  role: 'user' | 'moderator'
  type: 'session' | 'password' | 'email' | 'verification'
  accountId?: number
  iat: number
  exp: number
}


export { secret, expiresIn, jwtData, jwtPayload }