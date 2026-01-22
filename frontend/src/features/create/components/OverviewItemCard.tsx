import type { OverviewItem } from '../types'
import { ItemControlButtons } from './ItemControlButtons'

type Props = {
  item: OverviewItem
  index: number
  totalCount: number
  onUpdate: (index: number, updates: Partial<OverviewItem>) => void
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
  onDelete: (index: number) => void
}

/**
 * 概要項目1件のカード
 */
export const OverviewItemCard = ({
  item,
  index,
  totalCount,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onDelete,
}: Props) => {
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="mb-3">
        <label className="block text-base font-medium text-gray-700 mb-2">
          項目名
        </label>
        <input
          type="text"
          value={item.title}
          onChange={e => onUpdate(index, { title: e.target.value })}
          placeholder="例: 旅費"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div className="mb-3">
        <label className="block text-base font-medium text-gray-700 mb-2">内容</label>
        <textarea
          value={item.content}
          onChange={e => onUpdate(index, { content: e.target.value })}
          placeholder="例: 1人あたり50,000円"
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* ボタン群 */}
      <ItemControlButtons
        onMoveUp={() => onMoveUp(index)}
        onMoveDown={() => onMoveDown(index)}
        onDelete={() => onDelete(index)}
        canMoveUp={index > 0}
        canMoveDown={index < totalCount - 1}
        itemType="概要"
      />
    </div>
  )
}
