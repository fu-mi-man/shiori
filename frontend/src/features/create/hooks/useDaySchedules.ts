import { useState } from 'react'
import type { DaySchedule, ScheduleItem } from '../types'
import { generateId } from '../utils/idGenerator'

/**
 * 行程の状態管理カスタムフック
 */
export const useDaySchedules = () => {
  const [daySchedules, setDaySchedules] = useState<DaySchedule[]>([
    {
      id: generateId(),
      date: '',
      schedules: [
        {
          id: generateId(),
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

  // 新しい日を追加
  const addDay = () => {
    const newDay: DaySchedule = {
      id: generateId(),
      date: '',
      schedules: [],
    }
    setDaySchedules([...daySchedules, newDay])
  }

  // 日を削除
  const deleteDay = (dayId: string) => {
    setDaySchedules(daySchedules.filter(day => day.id !== dayId))
  }

  // 日付を更新
  const updateDate = (dayId: string, newDate: string) => {
    setDaySchedules(
      daySchedules.map(day => (day.id === dayId ? { ...day, date: newDate } : day))
    )
  }

  // 特定の日に行程を追加
  const addScheduleToDay = (dayId: string) => {
    const newSchedule: ScheduleItem = {
      id: generateId(),
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
  const updateSchedule = (dayId: string, scheduleId: string, updates: Partial<ScheduleItem>) => {
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
  const deleteSchedule = (dayId: string, scheduleId: string) => {
    setDaySchedules(
      daySchedules.map(day =>
        day.id === dayId
          ? { ...day, schedules: day.schedules.filter(s => s.id !== scheduleId) }
          : day
      )
    )
  }

  // 行程を上に移動
  const moveScheduleUp = (dayId: string, scheduleIndex: number) => {
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
  const moveScheduleDown = (dayId: string, scheduleIndex: number) => {
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

  return {
    daySchedules,
    addDay,
    deleteDay,
    updateDate,
    addScheduleToDay,
    updateSchedule,
    deleteSchedule,
    moveScheduleUp,
    moveScheduleDown,
  }
}
