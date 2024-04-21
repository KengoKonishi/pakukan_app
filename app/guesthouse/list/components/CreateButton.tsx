import Link from 'next/link'
import React from 'react'

interface CreateButtonProps {
  label: string
}

const CreateButton: React.FC<CreateButtonProps> = ({ label }) => {
  return (
    <Link href='/guesthouse/create'>
      <div className='flex justify-center items-center px-4 py-2 bg-amber-500 text-white rounded-full font-bold w-40 text-lg focus:outline-none focus:ring-4'>
        {label}
      </div>
    </Link>
  )
}

export default CreateButton
