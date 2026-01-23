import { Trash2 } from 'lucide-react'
import type { DaySchedule, ScheduleItem } from '../types'
import { ScheduleItemCard } from './ScheduleItemCard'

type Props = {
  day: DaySchedule
  onUpdateDate: (dayId: string, date: string) => void
  onDeleteDay: (dayId: string) => void
  onAddSchedule: (dayId: string) => void
  onUpdateSchedule: (dayId: string, scheduleId: string, updates: Partial<ScheduleItem>) => void
  onMoveScheduleUp: (dayId: string, index: number) => void
  onMoveScheduleDown: (dayId: string, index: number) => void
  onDeleteSchedule: (dayId: string, scheduleId: string) => void
}

/**
 * 日付グループ全体（1日分のセクション）
 */
export const DayScheduleSection = ({
  day,
  onUpdateDate,
  onDeleteDay,
  onAddSchedule,
  onUpdateSchedule,
  onMoveScheduleUp,
  onMoveScheduleDown,
  onDeleteSchedule,
}: Props) => {
  return (
    <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
      {/* 日付ヘッダー */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 flex items-center justify-between">
        <input
          type="date"
          aria-label="日付"
          value={day.date}
          onChange={e => onUpdateDate(day.id, e.target.value)}
          style={{ colorScheme: 'light' }}
          className="flex-1 px-4 py-3 bg-white border-0 rounded-lg text-lg font-medium focus:ring-2 focus:ring-blue-300"
        />
        <button
          aria-label="この日を削除"
          onClick={() => onDeleteDay(day.id)}
          className="ml-3 p-2 text-white hover:bg-white/20 rounded-lg cursor-pointer transition"
          title="この日を削除">
          <Trash2 className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* その日の行程コンテナ */}
      <div className="p-4 bg-gray-50">
        {/* その日の行程 */}
        <div className="space-y-3">
          {day.schedules.map((schedule, scheduleIndex) => (
            <ScheduleItemCard
              key={schedule.id}
              dayId={day.id}
              schedule={schedule}
              scheduleIndex={scheduleIndex}
              totalCount={day.schedules.length}
              onUpdate={onUpdateSchedule}
              onMoveUp={onMoveScheduleUp}
              onMoveDown={onMoveScheduleDown}
              onDelete={onDeleteSchedule}
            />
          ))}
        </div>

        {/* この日の行程を追加ボタン */}
        <button
          onClick={() => onAddSchedule(day.id)}
          className="w-full mt-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg cursor-pointer transition shadow-sm">
          + この日の行程を追加
        </button>
      </div>
    </div>
  )
}
