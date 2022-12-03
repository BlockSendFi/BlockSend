import axios from 'axios'
import ISignupInput from '../interfaces/signup-input.interface'

const signupMutation = (signupInput: ISignupInput) => axios.post('/signup', signupInput)

export default signupMutation
