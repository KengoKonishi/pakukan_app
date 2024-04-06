import React from 'react'

interface Props {
  title: string
}

const Title: React.FC<Props> = ({ title }) => {
  return (
    <div className='animate-in flex-1 flex flex-col gap-20 opacity-0 max-w-4xl px-3'>
      <main className='flex-1 flex flex-col gap-6'>
        <h2 className='text-gray-700 font-bold text-2xl mb-4 pt-5 pl-5 pb-3 border-b-4 border-b-amber-500'>
          {title}
        </h2>
      </main>
    </div>
  )
}

export default Title
