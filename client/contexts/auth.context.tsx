import { useRouter } from 'next/router'
import { createContext, useState, ReactElement, useEffect, Dispatch, SetStateAction } from 'react'

interface IProps {
  children: React.ReactNode
}

interface IContextProps {
  logout: () => void
  login: (userData: { accessToken: string }) => void
  // setAccessToken: Dispatch<SetStateAction<string | null>>
  accessToken: string | null
  user: string | null
}

const defaultValue = {
  accessToken: null,
  user: null,
  logout: () => null,
  login: () => null
}

export const AuthContext = createContext<IContextProps>(defaultValue)

const AuthContextProvider = ({ children }: IProps): ReactElement => {
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  useEffect(() => {
    const userSaved = localStorage.getItem('user')

    try {
      if (userSaved) {
        const parsedUser = JSON.parse(userSaved)
        setUser(parsedUser.user)
        setAccessToken(parsedUser.accessToken)
      }
    } catch (error) {
      console.error('Error while loading user')
    }
  }, [])

  const saveAccessToken = (_accessToken: string) => {
    setAccessToken(_accessToken)
    localStorage.setItem('user', JSON.stringify({ user, accessToken: _accessToken }))
  }

  const providerValue = {
    accessToken,
    logout: () => {
      setAccessToken(null)
      setUser(null)
      router.push('/')
    },
    login: (userData: { accessToken: string }) => {
      saveAccessToken(userData.accessToken)
      router.push('/app')
      // setTimeout(() => {
      // }, 800)
    },
    user
  }

  return (
    <AuthContext.Provider value={providerValue}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContextProvider
