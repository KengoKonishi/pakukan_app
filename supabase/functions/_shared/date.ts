export const getISODateInJST = (date: Date = new Date()) => {
  date.setHours(date.getHours() + 9) // UTCからJSTに変換（9時間加算）

  const isoStringInJST = date.toISOString().replace('Z', '+09:00')
  return isoStringInJST
}
