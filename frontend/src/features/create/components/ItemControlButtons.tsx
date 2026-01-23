import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react'

type Props = {
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
  canMoveUp: boolean
  canMoveDown: boolean
  itemType: '概要' | '行程'
}

/**
 * 項目の制御ボタン群（上へ移動、下へ移動、削除）
 * 概要項目と行程項目で共通使用
 */
export const ItemControlButtons = ({
  onMoveUp,
  onMoveDown,
  onDelete,
  canMoveUp,
  canMoveDown,
  itemType,
}: Props) => {
  return (
    <div className="flex gap-2">
      <button
        aria-label={`${itemType}を上へ移動`}
        onClick={onMoveUp}
        disabled={!canMoveUp}
        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition">
        <ChevronUp className="w-4 h-4" aria-hidden="true" />
      </button>
      <button
        aria-label={`${itemType}を下へ移動`}
        onClick={onMoveDown}
        disabled={!canMoveDown}
        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition">
        <ChevronDown className="w-4 h-4" aria-hidden="true" />
      </button>
      <button
        aria-label={`${itemType}を削除`}
        onClick={onDelete}
        className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer transition">
        <Trash2 className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  )
}
