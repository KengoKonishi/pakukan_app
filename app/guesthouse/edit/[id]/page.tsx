import SideMenu from '@/components/admin/SideMenu'
import Title from '@/components/header/title'
import EditForm from './components/EditForm'

export default function EditPage() {
  return (
    <div className='flex w-full h-full'>
      <SideMenu />

      <div className='flex flex-col flex-1'>
        <div className='flex-1 bg-amber-50 w-full'>
          <Title title='民泊施設情報　編集' />
          <div className='pl-10 pt-7'></div>
          <EditForm />
        </div>
      </div>
    </div>
  )
}
