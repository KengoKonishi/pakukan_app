import AdminCalendar from '@/app/calendar'
import SideMenu from '@/components/admin/SideMenu'
import Title from '@/components/header/title'

export default function Index() {
  return (
    <div className='flex flex-row w-full h-full'>
      <div className='flex-shrink-0 w-80'>
        <SideMenu />
      </div>

      <div className='flex flex-col flex-1'>
        <div className='flex-1 bg-amber-50 w-full h-full'>
          <Title title='カレンダーダッシュボード画面' />
          <div className='pt-7'>
            <AdminCalendar />
          </div>
        </div>
      </div>
    </div>
  )
}
