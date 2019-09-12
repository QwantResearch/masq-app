import { useEffect, useState } from 'react'

function useOutsideClick (ref) {
  const [isOutside, setIsOutside] = useState(false)

  useEffect(() => {
    function handleClickOutside (event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOutside(true)
      } else {
        setIsOutside(false)
      }
    }
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside)
    }
  })
  return isOutside
}

export default useOutsideClick
