'use client'

import Link from 'next/link'
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
          <MenuItemCalender />
          <MenuItem link='/admin/cleaning_status_list/'>清掃状況管理</MenuItem>
          <MenuItem link='/admin/guesthouse_list/'>民泊施設情報</MenuItem>
          <MenuItem link='/admin/staff_list/'>清掃員情報</MenuItem>
          <MenuItem link='/admin/settings/'>管理者情報</MenuItem>
          <MenuItem link=''>ログアウト</MenuItem>
        </div>
      </div>
    </div>
  )
}

const MenuItemCalender = () => {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const handleMouseEnter = () => {
    setIsExpanded(true)
  }

  const handleMouseLeave = () => {
    setIsExpanded(false)
  }

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className='text-start bg-orange-200 text-gray-950 pl-4 my-2 py-2 hover:bg-orange-100 hover:text-gray-600'>
        <Link href='/admin' className=''>
          <div className='item-header' onClick={handleExpand}>
            {isExpanded ? '▼' : '▶️'} カレンダー
          </div>
        </Link>
      </div>
      {isExpanded && (
        <div className='text-sm ml-2'>
          <MenuItem link='admin/stay_schedule/create'>宿泊スケジュール作成</MenuItem>
          <MenuItem link='admin/staff_schedule/create'>清掃員スケジュール作成</MenuItem>
        </div>
      )}
    </div>
  )
}

export default SideMenu
