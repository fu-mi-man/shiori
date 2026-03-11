"use client";

import {
  Bike,
  Bus,
  CableCar,
  Car,
  CarTaxiFront,
  Check,
  Footprints,
  Plane,
  Plus,
  Ship,
  TrainFront,
  X,
} from "lucide-react";
import { useState } from "react";

// 概要アイテムの型．idはReactのkey用（削除しても重複しないように採番する）
type OverviewItem = {
  id: number;
  title: string;
  content: string;
};

// 交通手段のユニオン型（取りうる値を制限する）
type TransportMode =
  | "walk"
  | "train"
  | "bus"
  | "car"
  | "bicycle"
  | "ship"
  | "plane"
  | "taxi"
  | "cablecar";

// スケジュールの1コマ
type ScheduleCard = {
  id: number;
  time: string;
  title: string;
  transport: TransportMode | "";
  memo: string;
};

// 1日分のグループ
type DayGroup = {
  id: number;
  date: string; // 日付
  dayNumber: number; // 日数（1日目，2日目）
  cards: ScheduleCard[];
};

// 交通手段の選択肢（アイコンはLucide）
const TRANSPORT_OPTIONS = [
  { mode: "walk", icon: Footprints, label: "徒歩" },
  { mode: "train", icon: TrainFront, label: "電車" },
  { mode: "car", icon: Car, label: "車" },
  { mode: "bus", icon: Bus, label: "バス" },
  { mode: "taxi", icon: CarTaxiFront, label: "タクシー" },
  { mode: "plane", icon: Plane, label: "飛行機" },
  { mode: "bicycle", icon: Bike, label: "自転車" },
  { mode: "ship", icon: Ship, label: "船" },
  { mode: "cablecar", icon: CableCar, label: "ケーブルカー" },
] as const;

export function CreateForm() {
  // 概要セクションのstate
  const [_overviews, setOverviews] = useState<OverviewItem[]>([]);
  const [nextId, setNextId] = useState(1);

  // 行程セクションのstate
  const [days, setDays] = useState<DayGroup[]>([]);
  const [nextDayId, setNextDayId] = useState(1);
  const [nextCardId, setNextCardId] = useState(1);
  const [startDate, setStartDate] = useState("");

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

  // 日程グループを末尾に追加
  const addDay = () => {
    setDays((prev) => [
      ...prev,
      { id: nextDayId, date: "", dayNumber: prev.length + 1, cards: [] },
    ]);
    setNextDayId((prev) => prev + 1);
  };

  // 指定IDの日程グループを削除
  const removeDay = (id: number) => {
    setDays((prev) => prev.filter((day) => day.id !== id));
  };

  // 指定日程グループにコマを追加
  const addCard = (dayId: number) => {
    setDays((prev) =>
      prev.map((day) =>
        day.id === dayId
          ? {
              ...day,
              cards: [
                ...day.cards,
                { id: nextCardId, time: "", title: "", transport: "", memo: "" },
              ],
            }
          : day,
      ),
    );
    setNextCardId((prev) => prev + 1);
  };

  // 指定日程グループから指定コマを削除
  const removeCard = (dayId: number, cardId: number) => {
    setDays((prev) =>
      prev.map((day) =>
        day.id === dayId ? { ...day, cards: day.cards.filter((card) => card.id !== cardId) } : day,
      ),
    );
  };

  // 指定コマのフィールドを更新
  const updateCard = (dayId: number, cardId: number, field: keyof Omit<ScheduleCard, "id">, value: string) => {
    setDays((prev) =>
      prev.map((day) =>
        day.id === dayId
          ? {
              ...day,
              cards: day.cards.map((card) =>
                card.id === cardId ? { ...card, [field]: value } : card,
              ),
            }
          : day,
      ),
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
            className="flex cursor-pointer items-center gap-1 rounded-full bg-[#C8F0D8] px-3 py-1.5 font-semibold text-[#3D8A5A] text-[13px] transition-colors hover:bg-[#A8E4C0]"
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
                <label
                  htmlFor={`overview-title-${item.id}`}
                  className="font-medium text-[#6D6C6A] text-xs"
                >
                  タイトル
                </label>
                <button
                  type="button"
                  onClick={() => removeOverview(item.id)}
                  className="group -m-2.5 flex size-11 cursor-pointer items-center justify-center"
                  aria-label="概要を削除"
                >
                  <span className="flex size-6 items-center justify-center rounded-full bg-destructive/15 transition-colors group-hover:bg-destructive/25">
                    <X className="size-3 text-destructive" />
                  </span>
                </button>
              </div>
              <input
                id={`overview-title-${item.id}`}
                type="text"
                value={item.title}
                onChange={(e) => updateOverview(item.id, "title", e.target.value)}
                placeholder="例: 旅費"
                maxLength={255}
                className="h-10 w-full rounded-lg border border-[#E5E4E1] bg-white px-3 text-[#1A1918] text-sm placeholder:text-[#9C9B99]"
              />
            </div>

            {/* 内容 */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor={`overview-content-${item.id}`}
                className="font-medium text-[#6D6C6A] text-xs"
              >
                内容
              </label>
              <textarea
                id={`overview-content-${item.id}`}
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

      {/* 行程セクション */}
      <section className="flex flex-col gap-4">
        {/* セクションヘッダー */}
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[#1A1918] text-base tracking-tight">行程</h2>
          <button
            type="button"
            onClick={addDay}
            className="flex cursor-pointer items-center gap-1 rounded-full bg-[#C8F0D8] px-3 py-1.5 font-semibold text-[#3D8A5A] text-[13px] transition-colors hover:bg-[#A8E4C0]"
          >
            <Plus className="size-3.5" />
            日程を追加
          </button>
        </div>

        {/* 旅行開始日 */}
        <div className="flex flex-col gap-2">
          <label htmlFor="start-date" className="flex items-center gap-1.5">
            <span className="font-semibold text-[#1A1918] text-sm">旅行開始日</span>
            <span className="rounded bg-[#EDECEA] px-1.5 py-0.5 text-[#9C9B99] text-[11px]">
              任意
            </span>
          </label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-10 w-full rounded-lg border border-[#E5E4E1] bg-white px-3 text-[#1A1918] text-sm"
          />
        </div>

        {/* 日程グループリスト */}
        {days.map((day) => (
          <div
            key={day.id}
            className="flex flex-col gap-3 rounded-xl border border-[#E5E4E1] bg-white p-4 shadow-[0_2px_12px_rgba(26,25,24,0.03)]"
          >
            {/* 日程ヘッダー */}
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#3D8A5A] px-3 py-1 font-semibold text-white text-xs">
                {day.dayNumber}日目
              </span>
              <button
                type="button"
                onClick={() => removeDay(day.id)}
                className="group -m-2.5 flex size-11 cursor-pointer items-center justify-center"
                aria-label="日程を削除"
              >
                <span className="flex size-6 items-center justify-center rounded-full bg-destructive/15 transition-colors group-hover:bg-destructive/25">
                  <X className="size-3 text-destructive" />
                </span>
              </button>
            </div>

            {/* スケジュールカードリスト */}
            {day.cards.map((card) => (
              <div
                key={card.id}
                className="flex flex-col gap-3 rounded-xl border border-[#E5E4E1] bg-white p-4 shadow-[0_2px_12px_rgba(26,25,24,0.03)]"
              >
                {/* 時間 + 削除ボタン */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex w-[150px] flex-col gap-1">
                    <label
                      htmlFor={`card-time-${day.id}-${card.id}`}
                      className="font-medium text-[#6D6C6A] text-xs"
                    >
                      時間
                    </label>
                    <input
                      id={`card-time-${day.id}-${card.id}`}
                      type="time"
                      value={card.time}
                      onChange={(e) => updateCard(day.id, card.id, "time", e.target.value)}
                      className="h-10 w-full rounded-lg border border-[#E5E4E1] bg-white px-3 text-[#1A1918] text-[13px]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCard(day.id, card.id)}
                    className="group -m-2.5 flex size-11 cursor-pointer items-center justify-center"
                    aria-label="コマを削除"
                  >
                    <span className="flex size-6 items-center justify-center rounded-full bg-destructive/15 transition-colors group-hover:bg-destructive/25">
                      <X className="size-3 text-destructive" />
                    </span>
                  </button>
                </div>

                {/* タイトル */}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor={`card-title-${day.id}-${card.id}`}
                    className="font-medium text-[#6D6C6A] text-xs"
                  >
                    タイトル
                  </label>
                  <input
                    id={`card-title-${day.id}-${card.id}`}
                    type="text"
                    value={card.title}
                    onChange={(e) => updateCard(day.id, card.id, "title", e.target.value)}
                    placeholder="例: 那覇空港 到着"
                    maxLength={255}
                    className="h-10 w-full rounded-lg border border-[#E5E4E1] bg-white px-3 text-[#1A1918] text-[13px] placeholder:text-[#9C9B99]"
                  />
                </div>

                {/* 交通手段 */}
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-[#6D6C6A] text-xs">交通手段</span>
                  <div className="flex gap-2 overflow-x-auto">
                    {TRANSPORT_OPTIONS.map((option) => (
                      <button
                        key={option.mode}
                        type="button"
                        onClick={() =>
                          updateCard(
                            day.id,
                            card.id,
                            "transport",
                            card.transport === option.mode ? "" : option.mode,
                          )
                        }
                        className={`flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border transition-colors ${
                          card.transport === option.mode
                            ? "border-[#3D8A5A] border-[1.5px] bg-[#C8F0D8]"
                            : "border-[#E5E4E1] bg-white hover:bg-[#F5F5F4]"
                        }`}
                        aria-label={option.label}
                      >
                        <option.icon
                          className={`size-5 ${card.transport === option.mode ? "text-[#3D8A5A]" : "text-[#9C9B99]"}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* 補足 */}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor={`card-memo-${day.id}-${card.id}`}
                    className="font-medium text-[#6D6C6A] text-xs"
                  >
                    補足
                  </label>
                  <textarea
                    id={`card-memo-${day.id}-${card.id}`}
                    value={card.memo}
                    onChange={(e) => updateCard(day.id, card.id, "memo", e.target.value)}
                    placeholder="例: LCC利用。第2ターミナル"
                    maxLength={200}
                    className="h-[84px] w-full resize-none rounded-lg border border-[#E5E4E1] bg-white px-3 py-2 text-[#1A1918] text-[13px] leading-relaxed placeholder:text-[#9C9B99]"
                  />
                </div>
              </div>
            ))}

            {/* コマを追加ボタン */}
            <button
              type="button"
              onClick={() => addCard(day.id)}
              className="flex h-11 w-full cursor-pointer items-center justify-center gap-1 rounded-lg border border-dashed border-[#D1D0CD] text-[#6D6C6A] text-[13px] transition-colors hover:bg-[#F5F5F4]"
            >
              <Plus className="size-3.5" />
              コマを追加
            </button>
          </div>
        ))}
      </section>

      {/* 完了ボタン */}
      <button
        type="button"
        className="flex h-[52px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#3D8A5A] font-semibold text-white shadow-[0_2px_8px_rgba(61,138,90,0.19)] transition-colors hover:bg-[#357A50]"
      >
        <Check className="size-5" />
        <span className="text-base">完了</span>
      </button>
    </div>
  );
}
