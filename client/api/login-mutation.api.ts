import axios from 'axios'
import ILoginInput from '../interfaces/login-input.interface'

const loginMutation = (loginInput: ILoginInput) => axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/login`, loginInput)

export default loginMutation
