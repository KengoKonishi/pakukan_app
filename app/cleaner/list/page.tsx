import SideMenu from '@/components/admin/SideMenu'
import Title from '@/components/header/title'
import CleanerTable from './components/CleanerTable'

export default function AdminSettingsPage() {
  return (
    <div className='flex w-full h-full'>
      <div className='flex-shrink-0 w-80'>
        <SideMenu />
      </div>

      <div className='flex flex-col flex-1'>
        <div className='flex-1 bg-amber-50 w-full'>
          <Title title='清掃員情報' />
          <div className='pl-10 pt-7 mr-11'>
            <CleanerTable></CleanerTable>
          </div>
        </div>
      </div>
    </div>
  )
}
