import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { SubmitButton } from '../../login/submit-button'

export default function ResetPassword({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  const resetPassword = async (formData: FormData) => {
    'use server'

    const email = formData.get('email') as string
    const supabase = createClient()

    // メールアドレスの正規表現
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    // メールアドレスのバリデーション
    if (!emailPattern.test(email)) {
      const patternMessage = encodeURIComponent('メールアドレスの形式が間違っています')
      return redirect('/reset_password/send_mail?message=' + patternMessage)
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email)

    if (error) {
      const failSendMailMessage = encodeURIComponent('メールの送信に失敗しました')
      return redirect('/reset_password/send_mail?message=' + failSendMailMessage)
    }

    const succcessMessage = encodeURIComponent(
      'リセット用メールが送信されました　（※届かない場合は未登録のメールアドレスの可能性があります）',
    )
    return redirect('/login?message=' + succcessMessage)
  }

  return (
    <div className='min-h-screen flex flex-col items-center justify-center w-1/2'>
      <h2 className='text-gray-700 font-bold text-2xl mb-8 pt--5 pl-5 pb-3 border-b-4 border-b-amber-500'>
        {/* eslint-disable-next-line no-irregular-whitespace */}
        パスワードリセット　
      </h2>
      {searchParams?.message && (
        <p className='text-red-500 mt--4 p-4 mb-4 text-center bg-yellow-200 rounded-md font-bold'>
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
          <div className='flex justify-center mt-8'>
            <SubmitButton
              // NOTE: Server Actions
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              formAction={resetPassword}
              className='px-4 py-2 bg-amber-500 text-white rounded-full font-bold text-lg focus:outline-none focus:ring-4 w-3/4'
              pendingText='送信中...'
            >
              メールを送信する
            </SubmitButton>
          </div>
          <div className='flex justify-center'>
            <Link href='/login' className='mt-2 text-amber-500 underline'>
              ログイン画面へ戻る
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
