import type { ScheduleItem, TransportType } from '../types'
import { TRANSPORT_OPTIONS } from '../constants'
import { ItemControlButtons } from './ItemControlButtons'

type Props = {
  dayId: string
  schedule: ScheduleItem
  scheduleIndex: number
  totalCount: number
  onUpdate: (dayId: string, scheduleId: string, updates: Partial<ScheduleItem>) => void
  onMoveUp: (dayId: string, index: number) => void
  onMoveDown: (dayId: string, index: number) => void
  onDelete: (dayId: string, scheduleId: string) => void
}

/**
 * 行程項目1件のカード
 */
export const ScheduleItemCard = ({
  dayId,
  schedule,
  scheduleIndex,
  totalCount,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onDelete,
}: Props) => {
  return (
    <div className="bg-white border rounded-lg p-4">
      {/* 時間入力 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-base font-medium text-gray-700 mb-2">開始時間</label>
          <input
            type="time"
            value={schedule.startTime}
            onChange={e =>
              onUpdate(dayId, schedule.id, {
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
              onUpdate(dayId, schedule.id, {
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
            onUpdate(dayId, schedule.id, {
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
            onUpdate(dayId, schedule.id, {
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
            onUpdate(dayId, schedule.id, {
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
            onUpdate(dayId, schedule.id, {
              note: e.target.value,
            })
          }
          placeholder="例: 8:30までに集合"
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* ボタン群 */}
      <ItemControlButtons
        onMoveUp={() => onMoveUp(dayId, scheduleIndex)}
        onMoveDown={() => onMoveDown(dayId, scheduleIndex)}
        onDelete={() => onDelete(dayId, schedule.id)}
        canMoveUp={scheduleIndex > 0}
        canMoveDown={scheduleIndex < totalCount - 1}
        itemType="行程"
      />
    </div>
  )
}
