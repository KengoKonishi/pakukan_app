import { headers } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { SubmitButton } from './submit-button'

export default function Login({ searchParams }: { searchParams: { message: string } }) {
  const signIn = async (formData: FormData) => {
    'use server'

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return redirect('/login?message=Could not authenticate user')
    }

    return redirect('/')
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
          role: 'admin',
          name: email + 'さん',
        },
        emailRedirectTo: `${origin}/auth/callback`,
      },
    })

    if (error) {
      console.log(error)
      const failLoginMessage = encodeURIComponent('ログインに失敗しました')
      return redirect('/login?message=' + failLoginMessage)
    }

    return redirect('/login?message=Check email to continue sign in process')
  }

  return (
    <div className='min-h-screen flex flex-col items-center justify-center w-1/2'>
      <div className='bg-orange-500 px-4 py-4 text-xl text-center w-1/2 mx-auto font-bold mb-8 border-2 border-black'>
        パクカンシステム
      </div>
      {searchParams?.message &&
        searchParams?.message !== '新しいパスワードが登録されました' &&
        searchParams?.message !==
          'リセット用メールが送信されました　（※届かない場合は未登録のメールアドレスの可能性があります）' && (
          <p className='text-red-500 mt--4 p-4 mb-4 text-center bg-yellow-200 rounded-md font-bold'>
            {searchParams.message}
          </p>
        )}
      {searchParams?.message &&
        (searchParams?.message === '新しいパスワードが登録されました' ||
          searchParams?.message ===
            'リセット用メールが送信されました　（※届かない場合は未登録のメールアドレスの可能性があります）') && (
          <p className='text-blue-500 mt--4 p-4 mb-4 text-center bg-yellow-200 rounded-md font-bold'>
            {searchParams.message}
          </p>
        )}
      <div className='bg-gray-200 p-8 rounded-md shadow-lg w-full'>
        <form className='flex flex-col w-full gap-4'>
          <div className='flex flex-col gap-2'>
            <label className='text-md' htmlFor='email'>
              メールアドレス
            </label>
            <input
              className='rounded-md px-4 py-2 bg-white border'
              name='email'
              placeholder='you@example.com'
              required
            />
          </div>
          <div className='flex flex-col gap-2'>
            <label className='text-md' htmlFor='password'>
              パスワード
            </label>
            <input
              className='rounded-md px-4 py-2 bg-white border'
              type='password'
              name='password'
              placeholder='••••••••'
              required
            />
          </div>
          <div className='flex justify-center mt-8'>
            <SubmitButton
              // NOTE: Server Actions
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              formAction={signIn}
              className='px-4 py-2 bg-amber-500 text-white rounded-full font-bold text-lg focus:outline-none focus:ring-4 w-3/4'
              pendingText='Signing In...'
            >
              ログイン
            </SubmitButton>
          </div>
          {/* テストユーザー作成用に表示 */}
          {/* <div className='flex justify-center'>
            <SubmitButton
              // NOTE: Server Actions
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              formAction={signUp}
              className='px-4 py-2 text-amber-500 rounded-full text-lg focus:outline-none focus:ring-4 w-3/4'
              pendingText='Signing In...'
            >
              新規登録（テストユーザー作成用に表示）
            </SubmitButton>
          </div> */}
          <div className='flex justify-center'>
            <Link
              href='/reset_password/send_mail/'
              className='mt-2 text-amber-500 underline'
            >
              パスワードがわからない場合はこちら
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
