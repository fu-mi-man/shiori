"use client"

import { Check } from "lucide-react";

export function CreateForm() {
  return (
    <div className="flex flex-col gap-7 px-5 py-6">
      {/* タイトルセクション */}
      <section className="flex flex-col gap-2">
        <label htmlFor="title" className="flex items-center gap-1">
          <span className="font-semibold text-[#1A1918] text-sm">タイトル</span>
          <span className="rounded bg-[#3D8A5A] px-1.5 py-0.5 font-semibold text-[11px] text-white">必須</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="沖縄旅行 2025年3月"
          className="h-12 w-full rounded-xl border border-[#D1D0CD] bg-white px-4 text-[#1A1918] text-[15px] placeholder:text-[#9C9B99]"
        />
      </section>

      {/* 完了ボタン */}
      <button
        type="button"
        className="flex h-[52px] items-center justify-center gap-2 rounded-xl bg-[#3D8A5A] font-semibold text-white shadow-[0_2px_8px_rgba(61,138,90,0.19)]"
      >
        <Check className="size-5" />
        <span className="text-base">完了</span>
      </button>
    </div>
  )
}
