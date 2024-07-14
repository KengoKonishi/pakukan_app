import SettingForm from '@/app/settings/password/components/settingForm'
import SideMenu from '@/components/admin/SideMenu'
import Title from '@/components/header/title'

export default function AdminSettingsPage() {
  return (
    <div className='flex w-full h-full'>
      <SideMenu />

      <div className='flex flex-col flex-1'>
        <div className='flex-1 bg-amber-50 w-full'>
          <Title title='管理者情報編集　パスワード変更' />
          <div className='pl-10 pt-7'>
            <SettingForm />
          </div>
        </div>
      </div>
    </div>
  )
}
