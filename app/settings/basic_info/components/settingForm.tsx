'use client'
import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import SubmitButton from '../../components/SubmitButton'

export default function SettingForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
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

        setName((user?.user_metadata.name as string) || '')
        setEmail(user?.email || '')
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

    // 氏名の正規表現
    const prohibitedNamePattern = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/
    const maxNameLength = 25

    // 氏名のバリデーション
    if (prohibitedNamePattern.test(name)) {
      setValidationError('名前に禁止文字が使用されています。')
      return
    }

    // 氏名の文字数制限バリデーション
    if (name.length > maxNameLength) {
      setValidationError(`名前は${maxNameLength}文字以内で入力してください。`)
      return
    }

    // メールアドレスの正規表現
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const maxEmailLength = 40

    // メールアドレスのバリデーション
    if (!emailPattern.test(email)) {
      setValidationError('メールアドレスの形式が間違っています。')
      return
    }

    // メールアドレスの文字数制限バリデーション
    if (email.length > maxNameLength) {
      setValidationError(`メールアドレスは${maxEmailLength}文字以内で入力してください。`)
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
        if (authUpdate.error.status == 429) {
          setValidationError(
            '更新できるのは1分間に一度までです　1分後再度更新してください',
          )
          return
        }
        throw authUpdate.error
      }

      // すべての更新処理が成功した場合の処理
      console.debug('フォームの更新処理が成功しました')
      setTimeout(() => {
        setSuccessMessage('更新が成功しました')
      }, 1000)
    } catch (e: unknown) {
      // 更新処理が失敗した場合の処理
      console.error('フォームの更新処理が失敗しました:', error)
      if (e instanceof Error) {
        setError(e.message)
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
        className='flex flex-col gap-4 max-w-md'
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
