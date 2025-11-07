export interface JWTPayload {
  id: number
  username: string
  iat?: number
  exp?: number
}

export const decodeJWT = (token: string): JWTPayload | null => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Failed to decode JWT:', error)
    return null
  }
}

export const getUserIdFromToken = (): number | null => {
  const token = localStorage.getItem('accessToken')
  if (!token) return null
  const payload = decodeJWT(token)
  return payload?.id || null
}

