import axios from 'axios'

const initTransferMutation = ({ initTransferInput, accessToken }: {
  initTransferInput: {
    amount: number,
    walletAddress: string,
    contact: string
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
