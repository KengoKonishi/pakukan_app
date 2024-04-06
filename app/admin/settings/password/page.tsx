import SettingForm from '@/app/admin/settings/password/components/settingForm'
import AuthButton from '@/components/AuthButton'
import DeployButton from '@/components/DeployButton'
import SideMenu from '@/components/admin/SideMenu'
import Title from '@/components/header/title'
import { createClient } from '@/utils/supabase/server'

export default function AdminSettingsPage() {
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
    <div className='flex w-full'>
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
        {/* TODO:bg-amber-50の背景色がh-fullになるように修正必要  */}
        <div className='flex-1 bg-amber-50 w-full'>
          <Title title='管理者情報編集' />
          <div className='pl-10 pt-7'>
            <SettingForm />
          </div>
        </div>
      </div>
    </div>
  )
}
