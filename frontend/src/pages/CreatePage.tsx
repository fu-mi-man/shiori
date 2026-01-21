import { useState } from 'react'
import {
  Train,
  Bus,
  Plane,
  Car,
  Ship,
  Bike,
  PersonStanding,
  ChevronUp,
  ChevronDown,
  Trash2,
} from 'lucide-react'

// 概要項目の型を定義
type OverviewItem = {
  title: string   // 例: "旅費", "持ち物", "ホテル情報"
  content: string // 例: "1人あたり50,000円"
}

// 日付グループの型を定義
type DaySchedule = {
  id: string      // 一意のID
  date: string    // 日付（例: "2025-01-15"）
  schedules: ScheduleItem[] // その日の行程
}

// 行程項目の型を定義（日付はDayScheduleが持つ）
type ScheduleItem = {
  id: string      // 一意のID（並び替え用）
  startTime: string // 開始時間（例: "08:00"）
  endTime: string   // 終了時間（例: "10:00"、任意）
  isAround: boolean // 「頃」フラグ
  title: string   // タイトル（例: "東京駅集合"）
  transport: TransportType // 交通手段（空欄可）
  note: string    // 補足（例: "8:30までに集合"）
}

// 交通手段の型（空欄を含む）
type TransportType = '' | 'walk' | 'train' | 'bus' | 'plane' | 'car' | 'ship' | 'bike'

// 交通手段の選択肢
const TRANSPORT_OPTIONS: { value: TransportType; label: string; icon?: typeof Train }[] = [
  { value: '', label: '（なし）' },
  { value: 'walk', label: '徒歩', icon: PersonStanding },
  { value: 'train', label: '電車', icon: Train },
  { value: 'bus', label: 'バス', icon: Bus },
  { value: 'plane', label: '飛行機', icon: Plane },
  { value: 'car', label: '車', icon: Car },
  { value: 'ship', label: '船', icon: Ship },
  { value: 'bike', label: '自転車', icon: Bike },
]

function CreatePage() {
  const [title, setTitle] = useState('')
  // 概要項目を配列で管理
  const [overviewItems, setOverviewItems] = useState<OverviewItem[]>([])
  // 日付ごとの行程を配列で管理（デフォルトで1日分表示）
  const [daySchedules, setDaySchedules] = useState<DaySchedule[]>([
    {
      id: Date.now().toString(),
      date: '',
      schedules: [
        {
          id: (Date.now() + 1).toString(),
          startTime: '',
          endTime: '',
          isAround: false,
          title: '',
          transport: '',
          note: '',
        },
      ],
    },
  ])

  // 概要項目を追加する関数
  const handleAddOverview = () => {
    setOverviewItems([
      ...overviewItems,
      {
        title: '',
        content: '',
      },
    ])
  }

  // 概要項目を更新する関数
  const handleUpdateOverview = (index: number, updates: Partial<OverviewItem>) => {
    setOverviewItems(
      overviewItems.map((item, i) => (i === index ? { ...item, ...updates } : item))
    )
  }

  // 概要項目を削除する関数
  const handleDeleteOverview = (index: number) => {
    setOverviewItems(overviewItems.filter((_, i) => i !== index))
  }

  // 概要項目を上に移動
  const handleMoveOverviewUp = (index: number) => {
    if (index === 0) return
    const newItems = [...overviewItems]
    ;[newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]]
    setOverviewItems(newItems)
  }

  // 概要項目を下に移動
  const handleMoveOverviewDown = (index: number) => {
    if (index === overviewItems.length - 1) return
    const newItems = [...overviewItems]
    ;[newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]]
    setOverviewItems(newItems)
  }

  // 新しい日を追加
  const handleAddDay = () => {
    const newDay: DaySchedule = {
      id: Date.now().toString(),
      date: '',
      schedules: [],
    }
    setDaySchedules([...daySchedules, newDay])
  }

  // 日を削除
  const handleDeleteDay = (dayId: string) => {
    setDaySchedules(daySchedules.filter(day => day.id !== dayId))
  }

  // 日付を更新
  const handleUpdateDate = (dayId: string, newDate: string) => {
    setDaySchedules(
      daySchedules.map(day => (day.id === dayId ? { ...day, date: newDate } : day))
    )
  }

  // 特定の日に行程を追加
  const handleAddScheduleToDay = (dayId: string) => {
    const newSchedule: ScheduleItem = {
      id: Date.now().toString(),
      startTime: '',
      endTime: '',
      isAround: false,
      title: '',
      transport: '',
      note: '',
    }
    setDaySchedules(
      daySchedules.map(day =>
        day.id === dayId ? { ...day, schedules: [...day.schedules, newSchedule] } : day
      )
    )
  }

  // 行程を更新
  const handleUpdateSchedule = (dayId: string, scheduleId: string, updates: Partial<ScheduleItem>) => {
    setDaySchedules(
      daySchedules.map(day =>
        day.id === dayId
          ? {
              ...day,
              schedules: day.schedules.map(schedule =>
                schedule.id === scheduleId ? { ...schedule, ...updates } : schedule
              ),
            }
          : day
      )
    )
  }

  // 行程を削除
  const handleDeleteSchedule = (dayId: string, scheduleId: string) => {
    setDaySchedules(
      daySchedules.map(day =>
        day.id === dayId
          ? { ...day, schedules: day.schedules.filter(s => s.id !== scheduleId) }
          : day
      )
    )
  }

  // 行程を上に移動
  const handleMoveScheduleUp = (dayId: string, scheduleIndex: number) => {
    if (scheduleIndex === 0) return
    setDaySchedules(
      daySchedules.map(day => {
        if (day.id !== dayId) return day
        const newSchedules = [...day.schedules]
        ;[newSchedules[scheduleIndex - 1], newSchedules[scheduleIndex]] = [
          newSchedules[scheduleIndex],
          newSchedules[scheduleIndex - 1],
        ]
        return { ...day, schedules: newSchedules }
      })
    )
  }

  // 行程を下に移動
  const handleMoveScheduleDown = (dayId: string, scheduleIndex: number) => {
    setDaySchedules(
      daySchedules.map(day => {
        if (day.id !== dayId) return day
        if (scheduleIndex === day.schedules.length - 1) return day
        const newSchedules = [...day.schedules]
        ;[newSchedules[scheduleIndex], newSchedules[scheduleIndex + 1]] = [
          newSchedules[scheduleIndex + 1],
          newSchedules[scheduleIndex],
        ]
        return { ...day, schedules: newSchedules }
      })
    )
  }

  // 滞在時間を計算する関数（分単位で返す）
  const calculateDuration = (startTime: string, endTime: string): number | null => {
    if (!startTime || !endTime) return null
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)
    const durationMin = (endHour * 60 + endMin) - (startHour * 60 + startMin)
    return durationMin > 0 ? durationMin : null
  }

  // 滞在時間を文字列に変換
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0 && mins > 0) return `${hours}時間${mins}分`
    if (hours > 0) return `${hours}時間`
    return `${mins}分`
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pb-24 md:pb-8">
      <div className="max-w-lg mx-auto px-4">
        {/* タイトル入力 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-700 mb-4">しおりのタイトル</h2>
          <input
            type="text"
            id="title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="例: 大阪旅行 2025"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 概要セクション */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-700 mb-4">概要</h2>

          {/* 概要項目リスト */}
          <div className="space-y-3">
            {overviewItems.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="mb-3">
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    項目名
                  </label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={e => handleUpdateOverview(index, { title: e.target.value })}
                    placeholder="例: 旅費"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-base font-medium text-gray-700 mb-2">内容</label>
                  <textarea
                    value={item.content}
                    onChange={e => handleUpdateOverview(index, { content: e.target.value })}
                    placeholder="例: 1人あたり50,000円"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* ボタン群 */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleMoveOverviewUp(index)}
                    disabled={index === 0}
                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition">
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveOverviewDown(index)}
                    disabled={index === overviewItems.length - 1}
                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteOverview(index)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 概要を追加ボタン */}
          <button
            onClick={handleAddOverview}
            className="w-full mt-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg cursor-pointer transition">
            + 概要を追加
          </button>
        </div>

        {/* 行程セクション */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-700 mb-4">行程</h2>

          {/* 日付ごとのセクション */}
          <div className="space-y-6">
            {daySchedules.map((day, dayIndex) => (
              <div key={day.id} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                {/* 日付ヘッダー */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 flex items-center justify-between">
                  <input
                    type="date"
                    value={day.date}
                    onChange={e => handleUpdateDate(day.id, e.target.value)}
                    style={{ colorScheme: 'light' }}
                    className="flex-1 px-4 py-3 bg-white border-0 rounded-lg text-lg font-medium focus:ring-2 focus:ring-blue-300"
                  />
                  <button
                    onClick={() => handleDeleteDay(day.id)}
                    className="ml-3 p-2 text-white hover:bg-white/20 rounded-lg cursor-pointer transition"
                    title="この日を削除">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* その日の行程コンテナ */}
                <div className="p-4 bg-gray-50">

                {/* その日の行程 */}
                <div className="space-y-3">
                  {day.schedules.map((schedule, scheduleIndex) => {
                    const TransportIcon = TRANSPORT_OPTIONS.find(
                      opt => opt.value === schedule.transport
                    )?.icon
                    const duration = calculateDuration(schedule.startTime, schedule.endTime)

                    return (
                      <div key={schedule.id} className="bg-white border rounded-lg p-4">
                        {/* 時間入力 */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div>
                            <label className="block text-base font-medium text-gray-700 mb-2">開始時間</label>
                            <input
                              type="time"
                              value={schedule.startTime}
                              onChange={e =>
                                handleUpdateSchedule(day.id, schedule.id, {
                                  startTime: e.target.value,
                                })
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-base font-medium text-gray-700 mb-2">終了時間</label>
                            <input
                              type="time"
                              value={schedule.endTime}
                              onChange={e =>
                                handleUpdateSchedule(day.id, schedule.id, {
                                  endTime: e.target.value,
                                })
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        {/* 「頃」チェックボックス */}
                        <label className="flex items-center gap-2 mb-4 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={schedule.isAround}
                            onChange={e =>
                              handleUpdateSchedule(day.id, schedule.id, {
                                isAround: e.target.checked,
                              })
                            }
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-base text-gray-700">開始時間に「頃」をつける</span>
                        </label>

                        {/* タイトル入力 */}
                        <div className="mb-4">
                          <label className="block text-base font-medium text-gray-700 mb-2">
                            タイトル
                          </label>
                          <input
                            type="text"
                            value={schedule.title}
                            onChange={e =>
                              handleUpdateSchedule(day.id, schedule.id, {
                                title: e.target.value,
                              })
                            }
                            placeholder="例: ランチ"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        {/* 交通手段 */}
                        <div className="mb-4">
                          <label className="block text-base font-medium text-gray-700 mb-2">交通手段</label>
                          <select
                            value={schedule.transport}
                            onChange={e =>
                              handleUpdateSchedule(day.id, schedule.id, {
                                transport: e.target.value as TransportType,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer">
                            {TRANSPORT_OPTIONS.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* 補足 */}
                        <div className="mb-4">
                          <label className="block text-base font-medium text-gray-700 mb-2">補足</label>
                          <textarea
                            value={schedule.note}
                            onChange={e =>
                              handleUpdateSchedule(day.id, schedule.id, {
                                note: e.target.value,
                              })
                            }
                            placeholder="例: 8:30までに集合"
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        {/* ボタン群 */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleMoveScheduleUp(day.id, scheduleIndex)}
                            disabled={scheduleIndex === 0}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition">
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMoveScheduleDown(day.id, scheduleIndex)}
                            disabled={scheduleIndex === day.schedules.length - 1}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition">
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSchedule(day.id, schedule.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                  {/* この日の行程を追加ボタン */}
                  <button
                    onClick={() => handleAddScheduleToDay(day.id)}
                    className="w-full mt-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg cursor-pointer transition shadow-sm">
                    + この日の行程を追加
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 新しい日を追加ボタン */}
          <button
            onClick={handleAddDay}
            className="w-full mt-6 py-3 border-2 border-dashed border-blue-400 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 font-medium rounded-lg cursor-pointer transition">
            + 新しい日を追加
          </button>
        </div>

        {/* 完了ボタン（後で実装） - PCでは通常表示、SPでは固定表示 */}
        <div className="md:block">
          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg cursor-pointer transition shadow-lg"
            onClick={() =>
              alert(
                `タイトル: ${title}\n概要:\n${overviewItems.map(item => `- ${item.title}: ${item.content}`).join('\n')}`
              )
            }>
            しおりを保存
          </button>
        </div>
      </div>

      {/* スマホ用固定ボタン */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-lg mx-auto">
          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg cursor-pointer transition shadow-lg"
            onClick={() =>
              alert(
                `タイトル: ${title}\n概要:\n${overviewItems.map(item => `- ${item.title}: ${item.content}`).join('\n')}`
              )
            }>
            しおりを保存
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreatePage
