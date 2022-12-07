import axios from 'axios'
import IContact from '../interfaces/contact.interface'

const addContactMutation = ({ addContactInput, accessToken }: {
  addContactInput: Partial<IContact>,
  accessToken: string
}) => {
  return axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/contacts`, addContactInput, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })
}

export default addContactMutation
