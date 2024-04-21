import AuthButton from '@/components/AuthButton'
import DeployButton from '@/components/DeployButton'
import SideMenu from '@/components/admin/SideMenu'
import Title from '@/components/header/title'
import { createClient } from '@/utils/supabase/server'
import EditForm from './components/EditForm'

export default function EditPage() {
  function canInitSupabaseClient() {
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
            {isSupabaseConnected && <AuthButton loginUrl='/login' />}
          </div>
        </nav>
        <div className='flex-1 bg-amber-50 w-full'>
          <Title title='清掃員情報　編集' />
          <div className='pl-10 pt-7'></div>
          <EditForm />
        </div>
      </div>
    </div>
  )
}
