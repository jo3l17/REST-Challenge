const secret = "ravn_nerdery"
const expiresIn = '1h'

type jwtData = {
  id: number
  role: string
}

type jwtPayload = {
  id: number
  role: string
  iat: number
  exp: number
}

export { secret, expiresIn, jwtData, jwtPayload }