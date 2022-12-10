import axios from 'axios'
import IRecipient from '../interfaces/recipient.interface'

const initTransferMutation = ({ initTransferInput, accessToken }: {
  initTransferInput: {
    amount: number,
    walletAddress: string,
    recipient: IRecipient
  },
  accessToken: string
}) => {
  return axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/transfers`, initTransferInput, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })
}

export default initTransferMutation
