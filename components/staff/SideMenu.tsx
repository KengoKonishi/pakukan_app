'use client'

import React, { useState } from 'react'
import MenuItem from '@/components/sidemenu/MenuItem'

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
          <MenuItem link='/staff'>・カレンダー</MenuItem>
          <MenuItem link='/staff/settings'>・登録情報</MenuItem>
          <MenuItem link=''>・ログアウト</MenuItem>
        </div>
      </div>
    </div>
  )
}

export default SideMenu
