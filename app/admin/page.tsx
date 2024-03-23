import AuthButton from '@/components/AuthButton'
import DeployButton from '@/components/DeployButton'
import AdminCalendar from '@/components/admin/Calender'
import { createClient } from '@/utils/supabase/server'

export default function Index() {
  const canInitSupabaseClient = () => {
    // This function is just for the interactive tutorial.
    // Feel free to remove it once you have Supabase connected.
    try {
      createClient()
      return true
    } catch (e) {
      return false
    }
  }

  const isSupabaseConnected = canInitSupabaseClient()

  return (
    <div className='flex-1 w-full flex flex-col gap-20 items-center'>
      <nav className='w-full flex justify-center border-b border-b-foreground/10 h-16'>
        <div className='w-full max-w-4xl flex justify-between items-center p-3 text-sm'>
          <DeployButton />
          {isSupabaseConnected && <AuthButton loginUrl='/admin/login' />}
        </div>
      </nav>

      <div className='flex-1 flex flex-col justify-center items-center w-full gap-20 px-3'>
        <main className='flex-1 flex flex-col justify-center items-center w-full gap-6'>
          <h2 className='font-bold text-4xl mb-4'>管理者 カレンダーダッシュボード画面</h2>
          <AdminCalendar />
        </main>
      </div>

      <footer className='w-full border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs'>
        <p>
          Powered by{' '}
          <a
            href='https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs'
            target='_blank'
            className='font-bold hover:underline'
            rel='noreferrer'
          >
            Supabase
          </a>
        </p>
      </footer>
    </div>
  )
}
