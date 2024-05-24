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

    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string
    const supabase = createClient()

    // パスワードパターンの正規表現
    const passwordPattern = /^[a-zA-Z0-9]{8,}$/

    // 新しいパスワードのバリデーション
    if (!passwordPattern.test(newPassword)) {
      const patternMessage =
        encodeURIComponent('パスワードを正しい条件で入力してください')
      return redirect('/reset_password/confirm?message=' + patternMessage)
    }

    if (newPassword !== confirmPassword) {
      const notMatchMessage = encodeURIComponent('入力パスワードが一致しません')
      return redirect('/reset_password/confirm?message=' + notMatchMessage)
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      const failResetMessage = encodeURIComponent(
        'パスワードリセットが失敗しました　（すでに設定されている可能性があります）',
      )
      return redirect('/reset_password/confirm?message=' + failResetMessage)
    }

    const succcessMessage = encodeURIComponent('新しいパスワードが登録されました')
    return redirect('/login?message=' + succcessMessage)
  }

  return (
    <div className='min-h-screen flex flex-col items-center justify-center w-1/2'>
      <h2 className='text-gray-700 font-bold text-2xl mb-8 pt--5 pl-5 pb-3 border-b-4 border-b-amber-500'>
        {/* eslint-disable-next-line no-irregular-whitespace */}
        パスワード再設定　
      </h2>
      {searchParams?.message &&
        searchParams?.message !== '新しいパスワードが登録されました' && (
          <p className='text-red-500 mt--4 p-4 mb-4 text-center bg-yellow-200 rounded-md font-bold'>
            {searchParams.message}
          </p>
        )}
      {searchParams?.message &&
        searchParams?.message === '新しいパスワードが登録されました' && (
          <p className='text-blue-500 mt--4 p-4 mb-4 text-center bg-yellow-200 rounded-md font-bold'>
            {searchParams.message}
          </p>
        )}
      <div className='bg-gray-200 p-8 rounded-md shadow-lg w-full'>
        <form className='flex flex-col w-full gap-4'>
          <div className='flex flex-col gap-2'>
            <label className='text-md' htmlFor='newPassword'>
              新しいパスワード
            </label>
            <input
              className='rounded-md px-4 py-2 bg-white border'
              type='password'
              name='newPassword'
              placeholder='8文字以上の英字または数字のみ'
              required
            />
          </div>
          <div className='flex flex-col gap-2'>
            <label className='text-md' htmlFor='confirmPassword'>
              新しいパスワードの確認
            </label>
            <input
              className='rounded-md px-4 py-2 bg-white border'
              type='password'
              name='confirmPassword'
              placeholder='8文字以上の英字または数字のみ'
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
              パスワードをリセットする
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
