'use client'
import React, { useState, useEffect } from 'react'
import { useGuestHouseOptions } from '@/app/calendar/hooks/useGuestHouseOptions'
import { CheckBoxList } from '@/components/checkbox/CheckBoxList'
import { CLEANING_STATUS_ID } from '@/constants/CleaningStatus'
import { useCleaningStatusOptions } from '@/hooks/useCleaningStatusOptions'
import { createClient } from '@/utils/supabase/client'
import EditButton from './EditButton'

type CleaningReport = {
  id: number
  response_url: string | null
  cleaning_schedules: {
    id: number
    start_datetime: string
    end_datetime: string
    guest_houses: {
      name: string
    } | null
    cleaning_status_id: number
    cleaners: {
      name: string
    } | null
    cleaning_status: {
      name: string
    } | null
  } | null
}

const ITEM_PER_PAGE = 10

const CleaningStatusTable = () => {
  const [topicMessage, setTopicMessage] = useState('')
  const [currentCleaningReports, setCurrentCleaningReports] = useState<CleaningReport[]>(
    [],
  )

  const { guestHouseOptions, setGuestHouseOptions } = useGuestHouseOptions()
  const { cleaningStatusOptions, setCleaningStatusOptions } = useCleaningStatusOptions([
    CLEANING_STATUS_ID.PENDING_REVIEW,
    CLEANING_STATUS_ID.RETURNED,
  ])

  const [loading, setLoading] = useState(true)

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  const supabase = createClient()

  useEffect(() => {
    const fetch = async () => {
      const now = new Date()
      const threeDaysAgo = new Date(now.setDate(now.getDate() - 3))

      // NOTE: 3日以内に更新された、確認依頼中のデータ
      const { data, error } = await supabase
        .from('cleaning_schedules')
        .select('id, start_datetime, guest_houses (name)')
        .eq('cleaning_status_id', CLEANING_STATUS_ID.PENDING_REVIEW)
        .gte('updated_at', threeDaysAgo.toISOString())
        .order('id')

      if (error) {
        console.error(error)
        return
      }
      if (data.length === 0) {
        return
      }

      let topicMessage = ''
      data.forEach((schedule) => {
        const date = new Date(schedule.start_datetime)
        topicMessage += `・${date.getFullYear() + '/' + date.getMonth() + '/' + date.getDay()}の${schedule.guest_houses?.name}で清掃完了報告がありました。\n`
      })
      console.log(data)

      setTopicMessage(topicMessage)
    }
    void fetch()
  }, [])

  useEffect(() => {
    try {
      const checkedCleaingStatusOptions = cleaningStatusOptions
        .filter((option) => option.checked)
        .map((option) => option.id.toString())
      const checkedGuestHouseOptions = guestHouseOptions
        .filter((option) => option.checked)
        .map((option) => option.id.toString())

      // テーブルに表示する清掃報告
      void setCleaningReports(
        currentPage,
        checkedCleaingStatusOptions,
        checkedGuestHouseOptions,
      )
    } finally {
      setLoading(false)
    }
  }, [currentPage, guestHouseOptions, cleaningStatusOptions])

  // 清掃ステータスのチェックボックス変更時の処理
  const onChangeCleaningCheckBox = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPage(1)
    const { value: id, checked } = event.target

    setCleaningStatusOptions((prevOptions) =>
      prevOptions.map((option) =>
        option.id.toString() === id ? { ...option, checked } : option,
      ),
    )
  }

  // 民泊施設のチェックボックス変更時の処理
  const onChangeGuestHouseCheckBox = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPage(1)
    const { value: id, checked } = event.target

    setGuestHouseOptions((prevOptions) =>
      prevOptions.map((option) =>
        option.id.toString() === id ? { ...option, checked } : option,
      ),
    )
  }

  const setCleaningReports = async (
    currentPage: number,
    cleaningStatusIds: string[],
    guestHouseIds: string[],
  ) => {
    const { data, error: getCleaningReportsError } = await supabase
      .from('cleaning_reports')
      .select(
        'id, response_url, cleaning_schedules (id, start_datetime, end_datetime, guest_house_id, guest_houses (name), cleaning_status_id, cleaning_status (name), cleaners (name))',
      )
      .in('cleaning_schedules.guest_house_id', guestHouseIds)
      .in('cleaning_schedules.cleaning_status_id', cleaningStatusIds)
      .order('id')

    if (getCleaningReportsError) {
      console.log(getCleaningReportsError)
      return
    }

    const cleaningReports: CleaningReport[] = []
    data?.forEach((ele: CleaningReport) => {
      // NOTE: cleaning_schedulesテーブルでの絞り込みで対象外になった場合、cleaning_schedulesがnullとして返却される
      // cleaning_schedulesがある場合のみ対象のデータとして扱う
      if (ele.cleaning_schedules) {
        cleaningReports.push({
          id: ele.id,
          response_url: ele.response_url,
          cleaning_schedules: {
            id: ele.cleaning_schedules.id,
            start_datetime: ele.cleaning_schedules.start_datetime,
            end_datetime: ele.cleaning_schedules.end_datetime,
            guest_houses: {
              name: ele.cleaning_schedules.guest_houses?.name ?? '',
            },
            cleaning_status_id: ele.cleaning_schedules.cleaning_status_id,
            cleaners: {
              name: ele.cleaning_schedules.cleaners?.name ?? '',
            },
            cleaning_status: {
              name: ele.cleaning_schedules.cleaning_status?.name ?? '',
            },
          },
        })
      }
    })

    setTotalPages(Math.ceil(cleaningReports.length / ITEM_PER_PAGE))
    const indexOfLastItem = currentPage * ITEM_PER_PAGE
    const indexOfFirstItem = indexOfLastItem - ITEM_PER_PAGE
    setCurrentCleaningReports(cleaningReports.slice(indexOfFirstItem, indexOfLastItem))
  }

  const calculateStartIndex = (currentPage: number, itemsPerPage: number) => {
    return (currentPage - 1) * itemsPerPage + 1
  }

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      {topicMessage !== '' && (
        <div className='mb-8 px-4 py-4 bg-white rounded-md border-2 border-amber-500 whitespace-pre-wrap'>
          {topicMessage}
        </div>
      )}
      <div className='flex flex-row mb-8'>
        <CheckBoxList
          label='清掃ステータス'
          name='cleaningStatus'
          options={cleaningStatusOptions}
          onChange={onChangeCleaningCheckBox}
        />
      </div>
      <div className='flex flex-row mb-8'>
        <CheckBoxList
          label='宿泊施設'
          name='guestHouses'
          options={guestHouseOptions}
          onChange={onChangeGuestHouseCheckBox}
        />
      </div>

      <table className='w-full table-fixed divide-y divide-gray-200'>
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
              className='px-6 py-3 text-left uppercase tracking-wider border-b border-r w-2/12'
            >
              <div className='flex justify-center'>宿泊施設</div>
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left uppercase tracking-wider border-b border-r w-2/12'
            >
              <div className='flex justify-center'>清掃日</div>
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left uppercase tracking-wider border-b border-r w-2/12'
            >
              <div className='flex justify-center'>清掃員</div>
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left uppercase tracking-wider border-b border-r w-2/12'
            >
              <div className='flex justify-center'>フォームリンク</div>
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left uppercase tracking-wider border-b border-r w-2/12'
            >
              <div className='flex justify-center'>ステータス</div>
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left uppercase tracking-wider border-b border-r w-1/12'
            ></th>
          </tr>
        </thead>
        <tbody className='bg-white divide-y divide-gray-200'>
          {currentCleaningReports.map((cleaningReport, index) => (
            <tr key={index + 1} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              <td className='px-6 py-2 border-b border-r w-1/12 overflow-hidden text-ellipsis whitespace-nowrap'>
                {calculateStartIndex(currentPage, ITEM_PER_PAGE) + index}
              </td>
              <td className='px-6 py-2 border-b border-r w-2/12 overflow-hidden text-ellipsis whitespace-nowrap'>
                <div className='flex justify-center'>
                  {cleaningReport.cleaning_schedules?.guest_houses?.name}
                </div>
              </td>
              <td className='px-6 py-2 border-b border-r w-2/12 overflow-hidden text-ellipsis whitespace-nowrap'>
                <div className='flex justify-center'>
                  {cleaningReport.cleaning_schedules &&
                    new Date(
                      cleaningReport.cleaning_schedules.start_datetime,
                    ).toLocaleString()}
                </div>
              </td>
              <td className='px-6 py-2 border-b border-r w-2/12 overflow-hidden text-ellipsis whitespace-nowrap'>
                <div className='flex justify-center'>
                  {cleaningReport.cleaning_schedules?.cleaners?.name}
                </div>
              </td>
              <td className='px-6 py-2 border-b border-r w-2/12 overflow-hidden text-ellipsis whitespace-nowrap'>
                {cleaningReport.response_url ? (
                  <a href={cleaningReport.response_url}>{cleaningReport.response_url}</a>
                ) : (
                  <></>
                )}
              </td>
              <td className='px-6 py-2 border-b border-r w-2/12 overflow-hidden text-ellipsis whitespace-nowrap'>
                <div className='flex justify-center'>
                  {cleaningReport.cleaning_schedules?.cleaning_status?.name}
                </div>
              </td>
              <td className='px-6 py-2 border-b border-r w-1/12 overflow-hidden text-ellipsis whitespace-nowrap'>
                <div className='flex justify-center'>
                  <EditButton label='編集' id={cleaningReport.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className='mt-4 flex justify-center'>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => handlePageChange(i + 1)}
            className={`px-3 py-1 mx-1 border ${
              i + 1 === currentPage ? 'bg-blue-500 text-white' : 'bg-white text-black'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  )
}

export default CleaningStatusTable
