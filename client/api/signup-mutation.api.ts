import axios from 'axios'
import ISignupInput from '../interfaces/signup-input.interface'

const signupMutation = (signupInput: ISignupInput) => axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/signup`, signupInput)

export default signupMutation
