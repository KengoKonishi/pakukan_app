import React from 'react'

interface SubmitButtonProps {
  label: string
  // onClick: () => void
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ label }) => {
  return (
    <button
      type='submit'
      className='px-4 py-2 bg-amber-500 text-white rounded-full font-bold w-40 text-lg focus:outline-none focus:ring-4'
    >
      {label}
    </button>
  )
}

export default SubmitButton
