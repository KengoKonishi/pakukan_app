'use client'
import { useParams } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import BackButton from './BackButton'
import SubmitButton from './SubmitButton'

const maxCleanerNameLength = 20
const maxMailLength = 40

export default function SettingForm() {
  const [error, setError] = useState('')
  const [validationError, setValidationError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const supabase = createClient()
  const { id } = useParams<{ id: string }>() // 文字列型で取得する
  const cleanerId = parseInt(id)
  const [cleaner, setCleaner] = useState<{
    id: number
    name: string
    email: string
    tel: string | null
  }>({
    id: 0,
    name: '',
    email: '',
    tel: null, // 初期値として null を設定
  })

  useEffect(() => {
    const fetchGuestHouses = async () => {
      try {
        const { data, error } = await supabase
          .from('cleaners')
          .select(`id, name, email, tel`)
          .eq('id', cleanerId)
        if (error) {
          throw error
        }
        setCleaner(data?.[0] || null)
      } catch (error) {
        console.error('Error fetching cleaners:', error)
      }
    }

    void fetchGuestHouses()
  }, [cleanerId, supabase])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    // メッセージをリセットする
    setValidationError('')
    setSuccessMessage('')

    const cleanerName = cleaner?.name

    // 名前のバリデーション
    // 文字数のチェック
    if (cleanerName.length > maxCleanerNameLength) {
      setValidationError(`名前は${maxCleanerNameLength}文字以内で入力してください。`)
      return
    }
    // 禁止文字チェック
    const prohibitedNamePattern = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/
    if (prohibitedNamePattern.test(cleanerName)) {
      setValidationError('名前に禁止文字が使用されています。')
      return
    }

    // メールアドレスのバリデーション
    const cleanerMail = cleaner?.email
    // 文字数のチェック
    if (cleanerMail.length > maxMailLength) {
      setValidationError(`名前は${maxMailLength}文字以内で入力してください。`)
      return
    }
    // 禁止文字チェック
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(cleanerMail || '')) {
      setValidationError('メールアドレスの形式が間違っています。')
      return
    }

    // 電話番号のバリデーション
    const telRegex = /^\d{10,11}$/
    if (!telRegex.test(cleaner?.tel || '')) {
      setValidationError('電話番号は数字10桁または11桁で入力してください。')
      return
    }

    try {
      const updateData = {
        id: cleanerId,
        name: cleaner.name,
        email: cleaner.email,
        tel: cleaner.tel,
      }

      const { error } = await supabase
        .from('cleaners')
        .update(updateData)
        .eq('id', cleanerId)

      if (error) {
        throw error
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
          <label htmlFor='name' className='mb-4 pl-4 text-gray-700'>
            名前
          </label>
          <input
            type='text'
            id='name'
            value={cleaner?.name}
            onChange={(e) =>
              setCleaner({
                ...cleaner,
                name: e.target.value,
              })
            }
            required
            className='px-3 py-3 border rounded-md ring-2 ring-amber-500 ring-offset-0 focus:ring-4 focus:outline-none'
            maxLength={maxCleanerNameLength}
          />
        </div>
        <div className='flex flex-col mb-6 max-w-md'>
          <label htmlFor='name' className='mb-4 pl-4 text-gray-700'>
            メールアドレス
          </label>
          <input
            type='email'
            id='email'
            value={cleaner?.email}
            onChange={(e) =>
              setCleaner({
                ...cleaner,
                email: e.target.value,
              })
            }
            required
            className='px-3 py-3 border rounded-md ring-2 ring-amber-500 ring-offset-0 focus:ring-4 focus:outline-none'
            maxLength={maxMailLength}
          />
        </div>
        <div className='flex flex-col mb-6 max-w-md'>
          <label htmlFor='name' className='mb-4 pl-4 text-gray-700'>
            電話番号（※ハイフンはなし）
          </label>
          <input
            type='tel'
            id='tel'
            value={cleaner?.tel ?? ''}
            onChange={(e) =>
              setCleaner({
                ...cleaner,
                tel: e.target.value || '',
              })
            }
            required
            className='px-3 py-3 border rounded-md ring-2 ring-amber-500 ring-offset-0 focus:ring-4 focus:outline-none'
          />
        </div>
        <div className='flex justify-center'>
          <div className='flex justify-center mr-10'>
            <BackButton label=' > 戻る' />
          </div>
          <div className='flex justify-center'>
            <SubmitButton label='更新する' />
          </div>
        </div>
        {error && <div className='text-red-500'>{error}</div>}
      </form>
    </div>
  )
}
