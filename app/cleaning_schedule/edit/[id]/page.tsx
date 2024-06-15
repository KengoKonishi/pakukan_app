import SideMenu from '@/components/admin/SideMenu'
import Title from '@/components/header/title'
import EditForm from './components/EditForm'

export default function AdminSettingsPage() {
  return (
    <div className='flex w-full h-full'>
      <SideMenu />

      <div className='flex flex-col flex-1'>
        <div className='flex-1 bg-amber-50 w-full'>
          <Title title='清掃員スケジュール編集' />
          <div className='pl-10 pt-7'>
            <EditForm></EditForm>
          </div>
        </div>
      </div>
    </div>
  )
}
