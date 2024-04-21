'use client'
import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import DeleteButton from './DeleteButton'
import EditButton from './EditButton'

interface DataItem {
  id: number
  name: string
}

const GuestHouseTable = () => {
  const [guestHouses, setGuestHouses] = useState<DataItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10) // 1ページあたりのアイテム数
  const supabase = createClient()
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const fetchGuestHouses = async () => {
      try {
        const { data, error } = await supabase
          .from('guest_houses')
          .select('id, name')
          .eq('is_deleted', 0)
          .order('id', { ascending: true })
        if (error) {
          throw error
        }
        setGuestHouses(data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching guest houses:', error)
      }
    }

    void fetchGuestHouses()
  }, [supabase])

  // レコード削除
  const handleDelete = async (id: number): Promise<void> => {
    setSuccessMessage('')
    try {
      const { error } = await supabase
        .from('guest_houses')
        .update({ is_deleted: 1 })
        .eq('id', id)
      if (error) {
        throw error
      }

      // 削除後にデータを再取得して更新する
      const { data: updatedGuestHouses, error: fetchError } = await supabase
        .from('guest_houses')
        .select('id, name')
        .eq('is_deleted', 0)
        .order('id', { ascending: true })
      if (fetchError) {
        throw fetchError
      }

      // すべての更新処理が成功した場合の処理
      console.log('フォームの削除処理が成功しました')
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSuccessMessage('削除しました')
      setGuestHouses(updatedGuestHouses)
    } catch (error) {
      console.error('Error deleting guest house:', error)
    }
  }

  // 現在のページのデータを取得
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentGuestHouses = guestHouses.slice(indexOfFirstItem, indexOfLastItem)

  // ページネーションのページ番号を生成
  const pageNumbers = []
  for (let i = 1; i <= Math.ceil(guestHouses.length / itemsPerPage); i++) {
    pageNumbers.push(i)
  }
  const calculateStartIndex = (currentPage: number, itemsPerPage: number) => {
    return (currentPage - 1) * itemsPerPage + 1
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
              className='px-6 py-3 text-left uppercase tracking-wider border-b border-r w-4/12'
            >
              名前
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left uppercase tracking-wider border-b border-r w-3/12'
            ></th>
          </tr>
        </thead>
        <tbody className='bg-white divide-y divide-gray-200'>
          {currentGuestHouses.map((guesthouse, index) => (
            <tr key={index + 1} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              <td className='px-6 py-2 whitespace-nowrap border-b border-r w-1/12'>
                {calculateStartIndex(currentPage, itemsPerPage) + index}
              </td>
              <td className='px-6 py-2 whitespace-nowrap border-b border-r w-6/12'>
                {guesthouse.name}
              </td>
              <td className='px-6 py-2 whitespace-nowrap border-b border-r w-1/12'>
                <div className='flex justify-center'>
                  <EditButton label='編集' id={guesthouse.id} />
                  <span className='mx-6'></span> {/* ボタン間の余白 */}
                  <DeleteButton onConfirmDelete={() => handleDelete(guesthouse.id)} />
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
