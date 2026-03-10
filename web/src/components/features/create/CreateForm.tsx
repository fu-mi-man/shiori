"use client";

import { Check, Plus, X } from "lucide-react";
import { useState } from "react";

// 概要アイテムの型．idはReactのkey用（削除しても重複しないように採番する）
type OverviewItem = {
  id: number;
  title: string;
  content: string;
};

export function CreateForm() {
  // 概要セクションのstate
  const [_overviews, setOverviews] = useState<OverviewItem[]>([]);
  const [nextId, setNextId] = useState(1);

  // 追加: 空のカードをリスト末尾に追加
  const addOverview = () => {
    setOverviews((prev) => [...prev, { id: nextId, title: "", content: "" }]);
    setNextId((prev) => prev + 1);
  };

  // 削除: 指定IDのカードをリストから除外
  const removeOverview = (id: number) => {
    setOverviews((prev) => prev.filter((item) => item.id !== id));
  };

  // 更新: 指定IDのカードの特定フィールドを更新
  const updateOverview = (id: number, field: "title" | "content", value: string) => {
    setOverviews((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  return (
    <div className="flex flex-col gap-7 px-5 py-6">
      {/* タイトルセクション */}
      <section className="flex flex-col gap-2">
        <label htmlFor="title" className="flex items-center gap-1">
          <span className="font-semibold text-[#1A1918] text-sm">タイトル</span>
          <span className="rounded bg-[#3D8A5A] px-1.5 py-0.5 font-semibold text-[11px] text-white">
            必須
          </span>
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

      {/* 概要セクション */}
      <section className="flex flex-col gap-4">
        {/* セクションヘッダー */}
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[#1A1918] text-base tracking-tight">概要</h2>
          <button
            type="button"
            onClick={addOverview}
            className="flex cursor-pointer items-center gap-1 rounded-full bg-[#C8F0D8] px-3 py-1.5 font-semibold text-[#3D8A5A] text-[13px]"
          >
            <Plus className="size-3.5" />
            追加
          </button>
        </div>

        {/* 概要カードリスト */}
        {_overviews.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 rounded-xl border border-[#E5E4E1] bg-white p-4 shadow-[0_2px_12px_rgba(26,25,24,0.03)]"
          >
            {/* タイトル行 */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#6D6C6A] text-xs">タイトル</span>
                <button
                  type="button"
                  onClick={() => removeOverview(item.id)}
                  className="flex size-6 cursor-pointer items-center justify-center rounded-full bg-[#FEF2F2]"
                  aria-label="概要を削除"
                >
                  <X className="size-3.5 text-[#EF4444]" />
                </button>
              </div>
              <input
                type="text"
                value={item.title}
                onChange={(e) => updateOverview(item.id, "title", e.target.value)}
                placeholder="例: 旅費"
                className="h-10 w-full rounded-lg border border-[#E5E4E1] bg-white px-3 text-[#1A1918] text-sm placeholder:text-[#9C9B99]"
              />
            </div>

            {/* 内容 */}
            <div className="flex flex-col gap-1">
              <span className="font-medium text-[#6D6C6A] text-xs">内容</span>
              <textarea
                value={item.content}
                onChange={(e) => updateOverview(item.id, "content", e.target.value)}
                placeholder="例: 一人あたり約50,000円"
                maxLength={500}
                className="h-[84px] w-full resize-none rounded-lg border border-[#E5E4E1] bg-white px-3 py-2 text-[#1A1918] text-sm leading-relaxed placeholder:text-[#9C9B99]"
              />
            </div>
          </div>
        ))}
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
  );
}
