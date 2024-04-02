import SettingForm from '@/app/admin/settings/components/settingForm'
import AuthButton from '@/components/AuthButton'
import DeployButton from '@/components/DeployButton'
import SideMenu from '@/components/admin/SideMenu'
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
    <div className='flex'>
      <div className='flex-1 w-full flex flex-col gap-20 items-center'>
        <nav className='w-full flex justify-center border-b border-b-foreground/10 h-16'>
          <div className='w-full max-w-4xl flex justify-between items-center p-3 text-sm'>
            <DeployButton />
            {isSupabaseConnected && <AuthButton loginUrl='/admin/login' />}
          </div>
        </nav>
        <div>
          <SideMenu></SideMenu>
        </div>
        <div className='flex-1 bg-amber-50 w-full'>
          <div className='animate-in flex-1 flex flex-col gap-20 opacity-0 max-w-4xl px-3'>
            <main className='flex-1 flex flex-col gap-6'>
              <h2 className='font-bold text-4xl mb-4'>管理者情報編集</h2>
            </main>
          </div>
          <SettingForm></SettingForm>
        </div>
      </div>
    </div>
  )
}
