import { useState } from 'react'

function CreatePage() {
  const [title, setTitle] = useState('')

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-lg mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">旅のしおりを作成</h1>

        {/* タイトル入力 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            しおりのタイトル
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="例: 大阪旅行 2025"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* プレビュー（デバッグ用） */}
        {title && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">入力中のタイトル:</p>
            <p className="font-bold text-gray-800">{title}</p>
          </div>
        )}

        {/* 完了ボタン（後で実装） */}
        <button
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg transition"
          onClick={() => alert(`タイトル: ${title}`)}>
          完了（仮）
        </button>
      </div>
    </div>
  )
}

export default CreatePage
