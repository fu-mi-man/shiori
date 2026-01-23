// 概要項目の型を定義
export type OverviewItem = {
  id: string      // 一意のID
  title: string   // 例: "旅費", "持ち物", "ホテル情報"
  content: string // 例: "1人あたり50,000円"
}

// 日付グループの型を定義
export type DaySchedule = {
  id: string      // 一意のID
  date: string    // 日付（例: "2025-01-15"）
  schedules: ScheduleItem[] // その日の行程
}

// 行程項目の型を定義（日付はDayScheduleが持つ）
export type ScheduleItem = {
  id: string      // 一意のID（並び替え用）
  startTime: string // 開始時間（例: "08:00"）
  endTime: string   // 終了時間（例: "10:00"、任意）
  isAround: boolean // 「頃」フラグ
  title: string   // タイトル（例: "東京駅集合"）
  transport: TransportType // 交通手段（空欄可）
  note: string    // 補足（例: "8:30までに集合"）
}

// 交通手段の型（空欄を含む）
export type TransportType = '' | 'walk' | 'train' | 'bus' | 'plane' | 'car' | 'ship' | 'bike'
