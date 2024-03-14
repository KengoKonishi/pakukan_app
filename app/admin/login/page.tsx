import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { SubmitButton } from './submit-button'

export default function Login({ searchParams }: { searchParams: { message: string } }) {
  const signIn = async (formData: FormData) => {
    'use server'

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = createClient()

    // 管理者テーブルへの検索
    const { data } = await supabase.from('admins').select().eq('email', email)
    if (!data || data.length === 0) {
      return redirect('/admin/login?message=Could not authenticate user')
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return redirect('/admin/login?message=Could not authenticate user')
    }

    return redirect('/admin')
  }

  // TODO: 清掃員作成機能の実装時に参考にする
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const signUp = async (formData: FormData) => {
    'use server'

    const origin = headers().get('origin')
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          owner_group_id: 1,
          role: 'admin',
          name: email + 'さん',
        },
        emailRedirectTo: `${origin}/auth/callback`,
      },
    })

    if (error) {
      console.log(error)
      return redirect('/admin/login?message=Could not authenticate user')
    }

    return redirect('/admin/login?message=Check email to continue sign in process')
  }

  return (
    <div className='flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2'>
      <form className='animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground'>
        管理者ログイン
        <label className='text-md' htmlFor='email'>
          メールアドレス
        </label>
        <input
          className='rounded-md px-4 py-2 bg-inherit border mb-6'
          name='email'
          placeholder='you@example.com'
          required
        />
        <label className='text-md' htmlFor='password'>
          パスワード
        </label>
        <input
          className='rounded-md px-4 py-2 bg-inherit border mb-6'
          type='password'
          name='password'
          placeholder='••••••••'
          required
        />
        <SubmitButton
          // NOTE: Server Actions
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          formAction={signIn}
          className='bg-green-700 rounded-md px-4 py-2 text-foreground mb-2'
          pendingText='Signing In...'
        >
          ログイン
        </SubmitButton>
        {/* テストユーザー作成用に表示 */}
        <SubmitButton
          // NOTE: Server Actions
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          formAction={signUp}
          className='bg-green-700 rounded-md px-4 py-2 text-foreground mb-2'
          pendingText='Signing In...'
        >
          登録
        </SubmitButton>
        {searchParams?.message && (
          <p className='mt-4 p-4 bg-foreground/10 text-foreground text-center'>
            {searchParams.message}
          </p>
        )}
      </form>
    </div>
  )
}
