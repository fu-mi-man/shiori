import type { OverviewItem } from '../types'

type Props = {
  onSave: () => void
  title: string
  overviewItems: OverviewItem[]
  variant: 'desktop' | 'mobile'
}

/**
 * しおり保存ボタン
 * PC版とモバイル版で共通のロジックを持つ
 */
export const SaveButton = ({ onSave, title, overviewItems, variant }: Props) => {
  const handleClick = () => {
    // 仮実装：alertで内容表示
    alert(
      `タイトル: ${title}\n概要:\n${overviewItems.map(item => `- ${item.title}: ${item.content}`).join('\n')}`
    )
    onSave()
  }

  const buttonClasses =
    'w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg cursor-pointer transition shadow-lg'

  if (variant === 'desktop') {
    return (
      <div className="hidden md:block">
        <button className={buttonClasses} onClick={handleClick}>
          しおりを保存
        </button>
      </div>
    )
  }

  // mobile
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-lg mx-auto">
        <button className={buttonClasses} onClick={handleClick}>
          しおりを保存
        </button>
      </div>
    </div>
  )
}
