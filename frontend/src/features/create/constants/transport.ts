import type { TransportType } from '../types'
import { Train, Bus, Plane, Car, Ship, Bike, PersonStanding } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// 交通手段の選択肢
export const TRANSPORT_OPTIONS: {
  value: TransportType
  label: string
  icon?: LucideIcon
}[] = [
  { value: '', label: '（なし）' },
  { value: 'walk', label: '徒歩', icon: PersonStanding },
  { value: 'train', label: '電車', icon: Train },
  { value: 'bus', label: 'バス', icon: Bus },
  { value: 'plane', label: '飛行機', icon: Plane },
  { value: 'car', label: '車', icon: Car },
  { value: 'ship', label: '船', icon: Ship },
  { value: 'bike', label: '自転車', icon: Bike },
]
