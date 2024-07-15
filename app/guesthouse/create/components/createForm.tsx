'use client'
import React, { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import BackButton from '../../components/BackButton'
import SubmitButton from '../../components/SubmitButton'

const maxGuestNameLength = 40

export default function SettingForm() {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [validationError, setValidationError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    // メッセージをリセットする
    setValidationError('')
    setSuccessMessage('')

    // 文字数のチェック
    if (name.length > maxGuestNameLength) {
      setValidationError(`宿泊名は${maxGuestNameLength}文字以内で入力してください。`)
      return
    }

    // 宿泊施設名の正規表現
    const prohibitedNamePattern = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/

    // 宿泊施設名のバリデーション
    if (prohibitedNamePattern.test(name)) {
      setValidationError('宿泊施設名に禁止文字が使用されています。')
      return
    }

    try {
      const { data: sameNameData } = await supabase
        .from('guest_houses')
        .select()
        .eq('name', name)
        .eq('is_deleted', 0)

      if (sameNameData && sameNameData.length !== 0) {
        setValidationError('すでに登録されている宿泊施設名です。')
        return
      }

      // 更新するデータを準備
      const guesthouseData = {
        name: name,
      }

      const createGuesthouse = await supabase.from('guest_houses').insert(guesthouseData)

      if (createGuesthouse.error) {
        throw createGuesthouse.error
      }

      // すべての更新処理が成功した場合の処理
      console.debug('フォームの更新処理が成功しました')
      setTimeout(() => {
        setSuccessMessage('作成が成功しました')
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
            宿泊施設名
          </label>
          <input
            type='text'
            id='name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className='px-3 py-3 border rounded-md ring-2 ring-amber-500 ring-offset-0 focus:ring-4 focus:outline-none'
            maxLength={maxGuestNameLength}
          />
        </div>
        <div className='flex justify-center'>
          <div className='flex justify-center mr-10'>
            <BackButton label=' > 戻る' />
          </div>
          <div className='flex justify-center'>
            <SubmitButton label='作成する' />
          </div>
        </div>
        {error && <div className='text-red-500'>{error}</div>}
      </form>
    </div>
  )
}
