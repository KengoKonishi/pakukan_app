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

    // 清掃員テーブルへの検索
    const { data } = await supabase.from('cleaners').select().eq('email', email)
    if (!data || data.length === 0) {
      return redirect('/staff/login?message=Could not authenticate user')
    }

    // ログイン処理
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.log(error)
      return redirect('/staff/login?message=Could not authenticate user')
    }

    return redirect('/staff')
  }

  // TODO: テストユーザー作成用に残してあるが後で消す
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
          role: 'staff',
          name: email + 'さん',
          tel: '09012345678',
          line_access_token: 'xxxxx',
        },
        emailRedirectTo: `${origin}/auth/callback`,
      },
    })

    if (error) {
      console.log(error)
      return redirect('/staff/login?message=Could not authenticate user')
    }

    return redirect('/staff/login?message=Check email to continue sign in process')
  }

  return (
    <div className='flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2'>
      <form className='animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground'>
        清掃員ログイン
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
