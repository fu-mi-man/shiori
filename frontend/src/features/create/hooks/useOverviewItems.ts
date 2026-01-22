import { useState } from 'react'
import type { OverviewItem } from '../types'
import { generateId } from '../utils/idGenerator'

/**
 * 概要項目の状態管理カスタムフック
 */
export const useOverviewItems = () => {
  const [overviewItems, setOverviewItems] = useState<OverviewItem[]>([])

  // 概要項目を追加する関数
  const addOverview = () => {
    setOverviewItems([
      ...overviewItems,
      {
        id: generateId(),
        title: '',
        content: '',
      },
    ])
  }

  // 概要項目を更新する関数
  const updateOverview = (index: number, updates: Partial<OverviewItem>) => {
    setOverviewItems(
      overviewItems.map((item, i) => (i === index ? { ...item, ...updates } : item))
    )
  }

  // 概要項目を削除する関数
  const deleteOverview = (index: number) => {
    setOverviewItems(overviewItems.filter((_, i) => i !== index))
  }

  // 概要項目を上に移動
  const moveOverviewUp = (index: number) => {
    if (index === 0) return
    const newItems = [...overviewItems]
    ;[newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]]
    setOverviewItems(newItems)
  }

  // 概要項目を下に移動
  const moveOverviewDown = (index: number) => {
    if (index === overviewItems.length - 1) return
    const newItems = [...overviewItems]
    ;[newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]]
    setOverviewItems(newItems)
  }

  return {
    overviewItems,
    addOverview,
    updateOverview,
    deleteOverview,
    moveOverviewUp,
    moveOverviewDown,
  }
}
