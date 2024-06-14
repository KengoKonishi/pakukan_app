import Link from 'next/link'
import React from 'react'

interface Props {
  label: string
  link: string
}

const MainButton: React.FC<Props> = ({ label, link }) => {
  return (
    <Link href={link}>
      <div className='px-4 py-2 bg-amber-500 text-white rounded-full font-bold w-40 text-lg focus:outline-none focus:ring-4'>
        {label}
      </div>
    </Link>
  )
}

export default MainButton
