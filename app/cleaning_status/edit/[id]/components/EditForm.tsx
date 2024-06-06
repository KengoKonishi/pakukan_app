'use client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { CLEANING_STATUS_ID } from '@/constants/CleaningStatus'
import { createClient } from '@/utils/supabase/client'
import UpdateButton from './UpdateButton'

type CleaningReportInEditPage = {
  id: number
  edit_form_url: string | null
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
  } | null
}

export default function SettingForm() {
  const [cleaningReport, setCleaningReport] = useState<CleaningReportInEditPage>({
    id: 0,
    edit_form_url: '',
    response_url: '',
    cleaning_schedules: {
      id: 0,
      start_datetime: '',
      end_datetime: '',
      guest_houses: {
        name: '',
      },
      cleaning_status_id: 0,
      cleaners: {
        name: '',
      },
    },
  })

  const [error, setError] = useState('')
  const [validationError, setValidationError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const supabase = createClient()
  const { id } = useParams<{ id: string }>() // 文字列型で取得する
  // NOTE: cleaning_schedules.idで絞り込むと期待する結果が取得できなかったので
  // ベースとなるcleaning_reportsテーブルの主キーで絞り込む
  const cleaningReportId = parseInt(id)

  useEffect(() => {
    const fetchCleaningReportsWithSchedule = async () => {
      try {
        const { data, error: getCleaningReportsError } = await supabase
          .from('cleaning_reports')
          .select(
            'id, edit_form_url, response_url, cleaning_schedules (id, start_datetime, end_datetime, guest_houses (name), cleaning_status_id, cleaners (name))',
          )
          .eq('id', cleaningReportId)
          .limit(1)
          .single()

        if (getCleaningReportsError) {
          console.log(getCleaningReportsError)
          return
        }
        if (!data || !data.cleaning_schedules) {
          return
        }

        setCleaningReport(data)
      } catch (error) {
        console.error('Error fetching guest houses:', error)
      }
    }

    void fetchCleaningReportsWithSchedule()
  }, [cleaningReportId, supabase])

  const onClickUpdateButton = async (
    e: React.MouseEvent<HTMLButtonElement>,
    updateStatus: number,
  ) => {
    e.preventDefault()

    setValidationError('')
    setSuccessMessage('')

    try {
      if (!cleaningReport.cleaning_schedules) {
        throw new Error('更新処理が失敗しました: 清掃報告のデータがありません')
      }

      const dataString = JSON.stringify({
        cleaningScheduleId: cleaningReport.cleaning_schedules.id,
        updateStatus,
        cleaningReportId: cleaningReport.id,
        cleaningReportResponseUrl: cleaningReport.response_url,
      })

      await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/update-cleaning-status`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: dataString,
        },
      )

      if (updateStatus === CLEANING_STATUS_ID.COMPLETED) {
        window.location.reload()
      }

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
      <div className='flex flex-col gap-4 w-full'>
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
        <div className='flex mb-6 items-center gap-4'>
          <div>
            <label htmlFor='checkInDatetime' className='mb-4 pl-4 text-gray-700'>
              開始日時
            </label>
            <div className='pl-4'>
              {cleaningReport?.cleaning_schedules?.start_datetime
                ? new Date(
                    cleaningReport.cleaning_schedules.start_datetime,
                  ).toLocaleString()
                : ''}
            </div>
          </div>
          <div className='p-2'> 〜 </div>
          <div>
            <label htmlFor='checkInDatetime' className='mb-4 pl-4 text-gray-700'>
              終了日時
            </label>
            <div className='pl-4'>
              {cleaningReport?.cleaning_schedules?.end_datetime
                ? new Date(
                    cleaningReport.cleaning_schedules.start_datetime,
                  ).toLocaleString()
                : ''}
            </div>
          </div>
        </div>
        <div className='flex flex-col mb-6'>
          <label htmlFor='guestHouseName' className='mb-4 pl-4 text-gray-700'>
            宿泊施設名
          </label>
          <div className='pl-4'>
            {cleaningReport?.cleaning_schedules?.guest_houses?.name ?? ''}
          </div>
        </div>
        <div className='flex flex-col mb-6'>
          <label htmlFor='guestHouseName' className='mb-4 pl-4 text-gray-700'>
            清掃員
          </label>
          <div className='pl-4'>
            {cleaningReport?.cleaning_schedules?.cleaners?.name ?? ''}
          </div>
        </div>
        <div className='flex flex-col mb-6'>
          <label htmlFor='guestHouseName' className='mb-4 pl-4 text-gray-700'>
            回答用URL
          </label>
          <div className='pl-4'>
            <div className='text-sm text-red-600 mb-2'>
              ※画像は下記のURLからでは確認できないため、Gmailに届いたメールのリンクからご確認ください。
            </div>
            <a href={cleaningReport?.edit_form_url ?? ''} target='_blank'>
              {cleaningReport?.edit_form_url ?? ''}
            </a>
          </div>
        </div>
        <div className='flex flex-col mb-6'>
          <label htmlFor='name' className='mb-4 pl-4 text-gray-700'>
            Googleフォームリンク (任意 ※Gmailに届いたメールのリンクを登録ください。
            差し戻し時に、リンクを探す手間を省くことができます)
          </label>
          <input
            type='response_url'
            id='response_url'
            value={cleaningReport?.response_url ?? ''}
            onChange={(e) =>
              setCleaningReport((prev) => ({
                ...prev,
                response_url: e.target.value,
              }))
            }
            required
            className='px-3 py-3 border rounded-md ring-2 ring-amber-500 ring-offset-0 focus:ring-4 focus:outline-none'
          />
        </div>
        <div className='flex justify-center'>
          <div className='flex justify-center mr-10'>
            <Link href='/cleaning_status/list/'>
              <div className='flex justify-center items-center px-4 py-2 bg-gray-300 text-white rounded-full font-bold w-40 text-lg focus:outline-none focus:ring-4'>
                戻る
              </div>
            </Link>
          </div>
          {cleaningReport.cleaning_schedules &&
            cleaningReport.cleaning_schedules.cleaning_status_id !==
              CLEANING_STATUS_ID.COMPLETED && (
              <div className='flex justify-center mr-10'>
                <UpdateButton
                  confirmMessage={`差し戻しします。\n\nGoogleフォームで清掃員に修正してほしい箇所をコメントしていただけましたか。`}
                  label='差し戻し'
                  onClickUpdateButton={onClickUpdateButton}
                  upadteStatus={CLEANING_STATUS_ID.RETURNED}
                />
              </div>
            )}
          {cleaningReport.cleaning_schedules?.cleaning_status_id !==
            CLEANING_STATUS_ID.COMPLETED && (
            <div className='flex justify-center'>
              <UpdateButton
                confirmMessage={`清掃を完了します。\n\nよろしいですか。`}
                label='完了'
                onClickUpdateButton={onClickUpdateButton}
                upadteStatus={CLEANING_STATUS_ID.COMPLETED}
              />
            </div>
          )}
          {cleaningReport.cleaning_schedules?.cleaning_status_id ===
            CLEANING_STATUS_ID.COMPLETED && (
            <div className='flex justify-center'>
              <UpdateButton
                confirmMessage={`更新します。\n\nよろしいですか。`}
                label='更新'
                onClickUpdateButton={onClickUpdateButton}
                upadteStatus={CLEANING_STATUS_ID.COMPLETED}
              />
            </div>
          )}
        </div>
        {error && <div className='text-red-500'>{error}</div>}
      </div>
    </div>
  )
}
