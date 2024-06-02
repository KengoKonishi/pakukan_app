// 基準となる時刻に引数で指定した時刻を足す+日時の整形
export const addHoursAndFormatDatetime = (
  datetimeString: string,
  hours: number | null = null,
) => {
  const datetime = new Date(datetimeString)
  const timezoneOffset = datetime.getTimezoneOffset() // 現地時間からのオフセットを取得する
  let millisecondsToAdd = 0
  if (hours) {
    millisecondsToAdd = hours * 60 * 60 * 1000 // 指定された時間をミリ秒に変換する
  }
  const adjustedTime = datetime.getTime() + millisecondsToAdd - timezoneOffset * 60 * 1000 // ローカル時間に変換する
  const result = new Date(adjustedTime)
  return result.toISOString().slice(0, 16) // 'yyyy-mm-ddTHH:MM'
}
