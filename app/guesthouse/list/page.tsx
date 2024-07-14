import GuesthouseTable from '@/app/guesthouse/list/components/GuesthouseTable'
import SideMenu from '@/components/admin/SideMenu'
import Title from '@/components/header/title'
import CreateButton from './components/CreateButton'

export default function AdminSettingsPage() {
  return (
    <div className='flex w-full h-full'>
      <SideMenu />

      <div className='flex flex-col flex-1'>
        <div className='flex-1 bg-amber-50 w-full'>
          <Title title='民泊施設情報' />
          <div className='flex justify-end mr-12'>
            <div>
              <CreateButton label='新規作成'></CreateButton>
            </div>
          </div>
          <div className='pl-10 pt-7 mr-11'>
            <GuesthouseTable></GuesthouseTable>
          </div>
        </div>
      </div>
    </div>
  )
}
