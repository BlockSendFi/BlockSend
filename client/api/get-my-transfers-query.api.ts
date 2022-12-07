import axios from 'axios'

const getMyTransfersQuery = (accessToken: string) => axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/transfers`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
})

export default getMyTransfersQuery
