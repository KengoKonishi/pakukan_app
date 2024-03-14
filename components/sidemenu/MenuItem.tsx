import Link from 'next/link'

const MenuItem = ({ children, link }: { children: React.ReactNode; link: string }) => {
  return (
    <Link href={link} className='menu-item'>
      <div className='bg-orange-200 pl-4 my-2 py-2 hover:bg-orange-100 hover:text-gray-600'>
        {children}
      </div>
    </Link>
  )
}

export default MenuItem
