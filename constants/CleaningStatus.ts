export const CLEANING_STATUS_ID = {
  UNFINISHED: 1,
  PENDING_REVIEW: 2,
  RETURNED: 3,
  COMPLETED: 4,
} as const

export const cleaningStatusBgColor = (cleaningStatusId: number) => {
  let bgColor = ''

  switch (cleaningStatusId) {
    case CLEANING_STATUS_ID.UNFINISHED:
      bgColor = 'bg-red-400'
      break
    case CLEANING_STATUS_ID.PENDING_REVIEW:
      bgColor = 'bg-green-600'
      break
    case CLEANING_STATUS_ID.RETURNED:
      bgColor = 'bg-yellow-400'
      break
    case CLEANING_STATUS_ID.COMPLETED:
      bgColor = 'bg-blue-500'
      break
  }

  return bgColor
}
