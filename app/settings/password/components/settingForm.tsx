'use client'
import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import SubmitButton from '../../components/SubmitButton'

export default function SettingForm() {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [validationError, setValidationError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        console.log(user)
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message)
        }
      } finally {
        setLoading(false)
      }
    }

    void fetchUserData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    // メッセージをリセットする
    setValidationError('')
    setSuccessMessage('')

    // 新しいパスワードが古いパスワードと同じでないことを確認する
    if (newPassword === oldPassword) {
      setValidationError('新しいパスワードは古いパスワードと異なる必要があります。')
      return
    }

    // パスワードパターンの正規表現
    const passwordPattern = /^[a-zA-Z0-9]{8,}$/

    // 新しいパスワードのバリデーション
    if (!passwordPattern.test(newPassword)) {
      setValidationError('新しいパスワードは8文字以上の英字または数字のみです。')
      return
    }

    // 確認用パスワードとの一致確認
    if (newPassword !== confirmPassword) {
      setValidationError('確認用パスワードが一致しません。')
      return
    }

    try {
      // 更新するデータを準備
      const authUserData = {
        password: newPassword,
      }

      // auth.users テーブルの更新
      const authUpdate = await supabase.auth.updateUser(authUserData)
      if (authUpdate.error) {
        throw authUpdate.error
      }

      // すべての更新処理が成功した場合の処理
      console.log('フォームの更新処理が成功しました')

      setTimeout(() => {
        setSuccessMessage('更新が成功しました')
      }, 1000)
    } catch (e: unknown) {
      if (e instanceof Error) {
        if (e.message === 'New password should be different from the old password.') {
          // カスタムのエラーメッセージを表示
          setValidationError(
            '古いパスワードが現在設定されているパスワードと一致しません。',
          )
        } else {
          // 更新処理が失敗した場合の処理
          console.log('フォームの更新処理が失敗しました:')
          setError(e.message)
        }
      }
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className='w-5/6 mx-auto'>
      <form
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => void handleSubmit(e)}
        className='flex flex-col gap-4 w-full'
      >
        {successMessage && (
          <div className='text-blue-500 px-4 py-2 bg-yellow-200 rounded-md font-bold'>
            {successMessage}
          </div>
        )}
        {validationError && (
          <div className='text-red-500 px-4 py-2 bg-yellow-200 rounded-md font-bold'>
            {validationError}
          </div>
        )}
        <div className='flex flex-col mb-6 max-w-md'>
          <label htmlFor='oldPassword' className='mb-4 pl-4 text-gray-700'>
            古いパスワード
          </label>
          <input
            type='password'
            id='oldPassword'
            value={oldPassword}
            placeholder='8文字以上の英字または数字のみ'
            onChange={(e) => setOldPassword(e.target.value)}
            required
            className='px-3 py-3 border rounded-md ring-2 ring-amber-500 ring-offset-0 focus:ring-4 focus:outline-none'
          />
        </div>
        <div className='flex flex-col mb-6 max-w-md'>
          <label htmlFor='newPassword' className='mb-4 pl-4 text-gray-700'>
            新しいパスワード
          </label>
          <input
            type='password'
            id='newPassword'
            value={newPassword}
            placeholder='8文字以上の英字または数字のみ'
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className='px-3 py-3 border rounded-md ring-2 ring-amber-500 ring-offset-0 focus:ring-4 focus:outline-none'
          />
        </div>
        <div className='flex flex-col mb-6 max-w-md'>
          <label htmlFor='confirmPassword' className='mb-4 pl-4 text-gray-700'>
            確認用パスワード
          </label>
          <input
            type='password'
            id='confirmPassword'
            value={confirmPassword}
            placeholder='8文字以上の英字または数字のみ'
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className='px-3 py-3 border rounded-md ring-2 ring-amber-500 ring-offset-0 focus:ring-4 focus:outline-none'
          />
        </div>
        <div className='flex justify-center'>
          <SubmitButton label='更新する' />
        </div>
        {error && <div className='text-red-500'>{error}</div>}
      </form>
    </div>
  )
}
