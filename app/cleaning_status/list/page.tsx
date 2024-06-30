import CleaningStatusTable from '@/app/cleaning_status/list/components/CleaningStatusTable'
import SideMenu from '@/components/admin/SideMenu'
import Title from '@/components/header/title'

export default function AdminSettingsPage() {
  return (
    <div className='flex w-full h-full'>
      <SideMenu />

      <div className='flex flex-col flex-1'>
        <div className='flex-1 bg-amber-50 w-full'>
          <Title title='清掃状況管理' />
          <div className='pl-10 pt-7 mr-11'>
            <CleaningStatusTable></CleaningStatusTable>
          </div>
        </div>
      </div>
    </div>
  )
}
