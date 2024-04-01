import AuthButton from '@/components/AuthButton'
import DeployButton from '@/components/DeployButton'
import SideMenu from '@/components/admin/SideMenu'
import { createClient } from '@/utils/supabase/server'

export default async function AdminSettingsPage() {
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

  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  //   const handleSubmit = async (e) => {
  //     e.preventDefault()
  //     // フォームの更新ロジックをここに追加
  //   }

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
          {/* <form onSubmit={handleSubmit}> */}
          <form>
            <div>
              <label htmlFor='name'>名前</label>
              <input
                type='text'
                id='name'
                value={user?.user_metadata.name}
                // onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor='email'>メールアドレス</label>
              <input
                type='email'
                id='email'
                value={user?.user_metadata.email}
                // onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor='password'>パスワード</label>
              <input
                type='password'
                id='password'
                placeholder='8文字以上の英字または数字のみ'
                // onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor='confirmPassword'>確認用パスワード</label>
              <input
                type='password'
                id='confirmPassword'
                placeholder='8文字以上の英字または数字のみ'
                // onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button type='submit'>更新する</button>
          </form>
        </div>
      </div>
    </div>
  )
}
