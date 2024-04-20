import GuesthouseTable from '@/app/admin/guesthouse/list/components/GuesthouseTable'
import AuthButton from '@/components/AuthButton'
import DeployButton from '@/components/DeployButton'
import SideMenu from '@/components/admin/SideMenu'
import Title from '@/components/header/title'
import { createClient } from '@/utils/supabase/server'
import CreateButton from '../list/components/CreateButton'

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

      {/* DeployButton と Main Content */}
      <div className='flex flex-col flex-1'>
        <nav className='w-full flex justify-center border-b border-b-foreground/10 h-16'>
          <div className='w-full max-w-4xl flex justify-between items-center p-3 text-sm'>
            <DeployButton />
            {isSupabaseConnected && <AuthButton loginUrl='/admin/login' />}
          </div>
        </nav>
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
