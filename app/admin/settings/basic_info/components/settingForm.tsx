'use client'
import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import SubmitButton from '../../components/SubmitButton'
// import Validation from './Validation'

export default function SettingForm() {
  const [name, setName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string>('')
  const supabase = createClient()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        console.log(user)

        setName(user?.user_metadata.name || '')
        setEmail(user?.email || '')
        setLoading(false)
      } catch (error) {
        setError(error.message)
        setLoading(false)
      }
    }

    fetchUserData().catch((error) => {
      setError(error.message)
      setLoading(false)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    // メッセージをリセットする
    setValidationError(null)
    setSuccessMessage('')

    // 氏名の正規表現
    const namePattern = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/

    // 氏名のバリデーション
    if (!namePattern.test(name)) {
      setValidationError('氏名に禁止文字が使用されています。')
      return
    }

    // メールアドレスの正規表現
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    // メールアドレスのバリデーション
    if (!emailPattern.test(email)) {
      setValidationError('メールアドレスの形式が間違っています。')
      return
    }

    try {
      // 更新するデータを準備
      const authUserData = {
        data: { name: name },
        email: email,
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
    } catch (error) {
      // 更新処理が失敗した場合の処理
      console.error('フォームの更新処理が失敗しました:', error)
      setError(error.message)
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
      <form onSubmit={handleSubmit} className='flex flex-col gap-4 max-w-md'>
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
          <label htmlFor='name' className='mb-4 pl-4 text-gray-700'>
            名前
          </label>
          <input
            type='text'
            id='name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className='px-3 py-3 border rounded-md ring-2 ring-amber-500 ring-offset-0 focus:ring-4 focus:outline-none'
          />
        </div>
        <div className='flex flex-col mb-6 max-w-md'>
          <label htmlFor='email' className='mb-4 pl-4 text-gray-700'>
            メールアドレス
          </label>
          <input
            type='email'
            id='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
