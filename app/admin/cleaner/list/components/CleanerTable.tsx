'use client'
import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import DeleteButton from './DeleteButton'
import EditButton from './EditButton'

interface DataItem {
  id: number
  name: string
  email: string
  tel: string | null
}

const GuestHouseTable = () => {
  const [cleaners, setCleaners] = useState<DataItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10) // 1ページあたりのアイテム数
  const supabase = createClient()
  const [successMessage, setSuccessMessage] = useState('')
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const fetchCleaners = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()
        const currentUser = data?.user

        if (!currentUser) {
          throw error
        }

        const { data: cleanersData, error: cleanersError } = await supabase
          .from('cleaners')
          .select('id, name, email, tel')
          .eq('is_deleted', 0)
          .eq('user_id', currentUser.id.toString())
          .order('id', { ascending: true })

        if (cleanersError) {
          throw cleanersError
        }
        setCleaners(cleanersData)
        setUserId(currentUser.id)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching cleaners:', error)
      }
    }

    void fetchCleaners()
  }, [supabase])

  const handleDelete = async (cleanerId: number, userId: string): Promise<void> => {
    setSuccessMessage('')
    try {
      const { error } = await supabase
        .from('cleaners')
        .update({ is_deleted: 1 })
        .eq('id', cleanerId)
      if (error) {
        throw error
      }

      const { data: updatedCleaners, error: fetchError } = await supabase
        .from('cleaners')
        .select('id, name, email, tel')
        .eq('is_deleted', 0)
        .eq('user_id', userId)
        .order('id', { ascending: true })
      if (fetchError) {
        throw fetchError
      }

      console.log('フォームの削除処理が成功しました')
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSuccessMessage('削除しました')
      setCleaners(updatedCleaners)
    } catch (error) {
      console.error('Error deleting cleaner:', error)
    }
  }

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentCleaners = cleaners.slice(indexOfFirstItem, indexOfLastItem)

  const pageNumbers = []
  for (let i = 1; i <= Math.ceil(cleaners.length / itemsPerPage); i++) {
    pageNumbers.push(i)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      {successMessage && (
        <div className='text-blue-500 px-4 py-2 bg-yellow-200 rounded-md font-bold mb-5'>
          {successMessage}
        </div>
      )}
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-amber-500 text-black'>
          <tr>
            <th
              scope='col'
              className='px-6 py-3 text-left uppercase tracking-wider border-b border-r w-1/12'
            >
              No
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left uppercase tracking-wider border-b border-r w-3/12'
            >
              名前
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left uppercase tracking-wider border-b border-r w-3/12'
            >
              メールアドレス
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left uppercase tracking-wider border-b border-r w-3/12'
            >
              電話番号
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left uppercase tracking-wider border-b border-r w-3/12'
            ></th>
          </tr>
        </thead>
        <tbody className='bg-white divide-y divide-gray-200'>
          {currentCleaners.map((cleaner, index) => (
            <tr key={index + 1} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              <td className='px-6 py-2 whitespace-nowrap border-b border-r w-1/12'>
                {index + 1}
              </td>
              <td className='px-6 py-2 whitespace-nowrap border-b border-r w-3/12'>
                {cleaner.name}
              </td>
              <td className='px-6 py-2 whitespace-nowrap border-b border-r w-3/12'>
                {cleaner.email}
              </td>
              <td className='px-6 py-2 whitespace-nowrap border-b border-r w-3/12'>
                {cleaner.tel}
              </td>
              <td className='px-6 py-2 whitespace-nowrap border-b border-r w-3/12'>
                <div className='flex justify-center'>
                  <EditButton label='編集' id={cleaner.id} />
                  <span className='mx-6'></span>
                  <DeleteButton onClick={() => handleDelete(cleaner.id, userId)} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className='mt-4 flex justify-center'>
        {pageNumbers.map((number) => (
          <button
            key={number}
            className='mr-2 px-3 py-1 bg-gray-200 hover:bg-gray-300 focus:outline-none'
            onClick={() => setCurrentPage(number)}
          >
            {number}
          </button>
        ))}
      </div>
    </div>
  )
}

export default GuestHouseTable
