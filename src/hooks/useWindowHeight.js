import { useState, useEffect } from 'react'

const useWindowHeight = () => {
  const [width, setWidth] = useState(window.innerHeight)

  useEffect(() => {
    const handleResize = () => setWidth(window.innerHeight)
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  })

  return width
}

export default useWindowHeight
