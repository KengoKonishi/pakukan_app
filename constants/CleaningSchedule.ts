export const CLEANING_SCHEDULE = {
  // 宿泊者チェックアウト時刻の一定時間経過後を清掃開始時刻とする（単位：h）
  SETTING_TIME_FOR_CLEANING_START_DATETIME: 2,

  // 清掃員の清掃時間(単位：h)
  CLEANING_TIME: 3,

  // 清掃員のデフォルト開始時刻（単位：h）
  CLEANING_START_DEFAULT_TIME: 12,

  // 清掃員のデフォルト終了時刻（単位：h）
  CLEANING_END_DEFAULT_TIME: 15,
} as const
