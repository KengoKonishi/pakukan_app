'use client'

import Link from 'next/link'
import React, { useState } from 'react'

const SideMenu = () => {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className='side-menu bg-gray-200 h-screen w-72 fixed left-0 top-0 px-4 text-sm'>
      <div className='bg-orange-500 title px-4 py-4 my-4 text-xl'>パクカンシステム</div>
      <div className='h-screen bg-yellow-800 px-4 py-4'>
        <div
          className='menu-toggle border-b-4 border-b-orange-500'
          onClick={handleToggle}
        >
          <p className='px-4 pb-2 text-white text-xl'>MENU</p>
        </div>
        <div className={`menu-items py-2 ${isOpen ? 'open' : ''}`}>
          <MenuItem link='/admin/cleaning_status_list/'>・カレンダー</MenuItem>
          <MenuItem link='/admin/guesthouse_list/'>・登録情報</MenuItem>
          <MenuItem link=''>・ログアウト</MenuItem>
        </div>
      </div>
    </div>
  )
}

const MenuItem = ({ children, link }: { children: React.ReactNode; link: string }) => {
  return (
    <Link href={link} className='menu-item'>
      <div className='bg-orange-200 pl-4 my-2 py-2 hover:bg-orange-100 hover:text-gray-600'>
        {children}
      </div>
    </Link>
  )
}

export default SideMenu
