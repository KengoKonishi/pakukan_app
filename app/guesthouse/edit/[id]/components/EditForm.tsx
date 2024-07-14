'use client'
import { useParams } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import BackButton from '../../../components/BackButton'
import SubmitButton from '../../../components/SubmitButton'

const maxGuestNameLength = 40

export default function SettingForm() {
  const [error, setError] = useState('')
  const [validationError, setValidationError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const supabase = createClient()
  const { id } = useParams<{ id: string }>() // 文字列型で取得する
  const guesthouseId = parseInt(id)
  const [guesthouse, setGuestHouse] = useState<{ id: number; name: string }>({
    id: 0,
    name: '',
  })

  useEffect(() => {
    const fetchGuestHouses = async () => {
      try {
        const { data, error } = await supabase
          .from('guest_houses')
          .select(`id, name`)
          .eq('id', guesthouseId)
        if (error) {
          throw error
        }
        setGuestHouse(data?.[0] || null)
      } catch (error) {
        console.error('Error fetching guest houses:', error)
      }
    }

    void fetchGuestHouses()
  }, [guesthouseId, supabase])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    // メッセージをリセットする
    setValidationError('')
    setSuccessMessage('')

    // 文字数のチェック
    const guesthouseName = guesthouse?.name || ''
    if (guesthouseName.length > maxGuestNameLength) {
      setValidationError(`宿泊名は${maxGuestNameLength}文字以内で入力してください。`)
      return
    }

    // 宿泊施設名の正規表現
    const prohibitedNamePattern = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/

    // 宿泊施設名のバリデーション
    if (prohibitedNamePattern.test(guesthouse?.name || '')) {
      setValidationError('宿泊施設名に禁止文字が使用されています。')
      return
    }

    try {
      const { error } = await supabase
        .from('guest_houses')
        .update({ name: guesthouse?.name || '' })
        .eq('id', guesthouseId)

      if (error) {
        throw error
      }

      // すべての更新処理が成功した場合の処理
      console.log('フォームの更新処理が成功しました')

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
            宿泊施設名
          </label>
          <input
            type='text'
            id='name'
            value={guesthouse?.name}
            onChange={(e) =>
              setGuestHouse({
                ...guesthouse,
                name: e.target.value,
                id: guesthouseId,
              })
            }
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
            <SubmitButton label='更新する' />
          </div>
        </div>
        {error && <div className='text-red-500'>{error}</div>}
      </form>
    </div>
  )
}
