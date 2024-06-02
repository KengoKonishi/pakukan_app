import CleaningStatusTable from '@/app/cleaning_status/list/components/CleaningStatusTable'
import SideMenu from '@/components/admin/SideMenu'
import Title from '@/components/header/title'
import { createClient } from '@/utils/supabase/server'

export default function AdminSettingsPage() {
  const canInitSupabaseClient = () => {
    try {
      createClient()
      return true
    } catch (e) {
      return false
    }
  }
  const isSupabaseConnected = canInitSupabaseClient()

  return (
    <div className='flex w-full h-full'>
      <div className='flex-shrink-0 w-80'>
        <SideMenu />
      </div>

      <div className='flex flex-col flex-1'>
        <div className='flex-1 bg-amber-50 w-full'>
          <Title title='清掃管理報告' />
          <div className='pl-10 pt-7 mr-11'>
            <CleaningStatusTable></CleaningStatusTable>
          </div>
        </div>
      </div>
    </div>
  )
}
