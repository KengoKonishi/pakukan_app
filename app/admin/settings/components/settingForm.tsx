'use client'
import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function SettingForm() {
  const [name, setName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setName(user?.user_metadata?.name || '')
        setEmail(user?.user_metadata?.email || '')
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      // 更新するデータを準備
      const userData = {
        name: name,
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      }

      // Supabaseのupdateメソッドを使用してデータを更新
      const { error } = await supabase.from('admin').update(userData).single()

      if (error) {
        throw error
      }

      // 更新処理が成功した場合の処理
      console.log('フォームの更新処理が成功しました')
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
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor='name'>名前</label>
        <input
          type='text'
          id='name'
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor='email'>メールアドレス</label>
        <input
          type='email'
          id='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor='password'>パスワード</label>
        <input
          type='password'
          id='password'
          value={password}
          placeholder='8文字以上の英字または数字のみ'
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor='confirmPassword'>確認用パスワード</label>
        <input
          type='password'
          id='confirmPassword'
          value={confirmPassword}
          placeholder='8文字以上の英字または数字のみ'
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      <button type='submit'>更新する</button>
    </form>
  )
}
