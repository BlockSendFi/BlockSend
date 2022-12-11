import axios from 'axios'

const getTransferQuery = ({ accessToken, transferId }: { accessToken: string, transferId: string }) => axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/transfers/${transferId}`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
})

export default getTransferQuery
