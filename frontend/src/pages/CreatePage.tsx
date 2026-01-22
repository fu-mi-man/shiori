import { useState } from 'react'
import { useOverviewItems, useDaySchedules } from '@/features/create/hooks'
import {
  SaveButton,
  OverviewItemCard,
  DayScheduleSection,
} from '@/features/create/components'

function CreatePage() {
  const [title, setTitle] = useState('')

  // カスタムフックで状態管理
  const {
    overviewItems,
    addOverview,
    updateOverview,
    deleteOverview,
    moveOverviewUp,
    moveOverviewDown,
  } = useOverviewItems()

  const {
    daySchedules,
    addDay,
    deleteDay,
    updateDate,
    addScheduleToDay,
    updateSchedule,
    deleteSchedule,
    moveScheduleUp,
    moveScheduleDown,
  } = useDaySchedules()

  const handleSave = () => {
    // 保存処理（将来実装）
    console.log('保存:', { title, overviewItems, daySchedules })
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
              <OverviewItemCard
                key={item.id}
                item={item}
                index={index}
                totalCount={overviewItems.length}
                onUpdate={updateOverview}
                onMoveUp={moveOverviewUp}
                onMoveDown={moveOverviewDown}
                onDelete={deleteOverview}
              />
            ))}
          </div>

          {/* 概要を追加ボタン */}
          <button
            onClick={addOverview}
            className="w-full mt-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg cursor-pointer transition">
            + 概要を追加
          </button>
        </div>

        {/* 行程セクション */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-700 mb-4">行程</h2>

          {/* 日付ごとのセクション */}
          <div className="space-y-6">
            {daySchedules.map((day) => (
              <DayScheduleSection
                key={day.id}
                day={day}
                onUpdateDate={updateDate}
                onDeleteDay={deleteDay}
                onAddSchedule={addScheduleToDay}
                onUpdateSchedule={updateSchedule}
                onMoveScheduleUp={moveScheduleUp}
                onMoveScheduleDown={moveScheduleDown}
                onDeleteSchedule={deleteSchedule}
              />
            ))}
          </div>

          {/* 新しい日を追加ボタン */}
          <button
            onClick={addDay}
            className="w-full mt-6 py-3 border-2 border-dashed border-blue-400 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 font-medium rounded-lg cursor-pointer transition">
            + 新しい日を追加
          </button>
        </div>

        {/* PC用保存ボタン */}
        <SaveButton
          variant="desktop"
          onSave={handleSave}
          title={title}
          overviewItems={overviewItems}
        />
      </div>

      {/* モバイル用保存ボタン */}
      <SaveButton
        variant="mobile"
        onSave={handleSave}
        title={title}
        overviewItems={overviewItems}
      />
    </div>
  )
}

export default CreatePage
