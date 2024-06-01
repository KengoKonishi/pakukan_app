import SettingForm from '@/app/settings/basic_info/components/settingForm'
import SideMenu from '@/components/admin/SideMenu'
import Title from '@/components/header/title'

export default function AdminSettingsPage() {
  return (
    <div className='flex w-full h-full'>
      <div className='flex-shrink-0 w-80'>
        <SideMenu />
      </div>

      <div className='flex flex-col flex-1'>
        <div className='flex-1 bg-amber-50 w-full'>
          <Title title='管理者情報編集　基本情報変更' />
          <div className='pl-10 pt-7'>
            <SettingForm />
          </div>
        </div>
      </div>
    </div>
  )
}
