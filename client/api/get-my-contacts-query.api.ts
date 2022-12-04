import axios from 'axios'

const getMyContactsQuery = (accessToken: string) => axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/contacts`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
})

export default getMyContactsQuery
