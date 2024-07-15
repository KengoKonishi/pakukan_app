export const CLEANING_STATUS_ID = {
  UNFINISHED: 1,
  PENDING_REVIEW: 2,
  RETURNED: 3,
  COMPLETED: 4,
} as const

export const cleaningStatusBgColor = (cleaningStatusId: number) => {
  // NOTE: Switch文で定義すると動的に当てたクラスにスタイルが適用されなかったため配列に修正
  const cleaningStatusBgColors = [
    'bg-red-400',
    'bg-green-600',
    'bg-yellow-400',
    'bg-blue-500',
  ]
  return cleaningStatusBgColors[cleaningStatusId - 1]
}
