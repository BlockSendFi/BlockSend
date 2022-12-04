import { ReactElement } from 'react'
import LoadingIcon from './icons/LoadingIcon'

const Loader = (): ReactElement => {
  return (
    <div className="flex items-center justify-center h-48">
      <LoadingIcon />
    </div>
  )
}

export default Loader
