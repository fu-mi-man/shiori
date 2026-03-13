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
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
  const [overviews, setOverviews] = useState<OverviewItem[]>([]);
  const nextOverviewIdRef = useRef(1);

  // 行程セクションのstate
  const [days, setDays] = useState<DayGroup[]>([]);
  const nextDayIdRef = useRef(1);
  const nextCardIdRef = useRef(1);
  const [startDate, setStartDate] = useState("");

  // 追加: 空のカードをリスト末尾に追加
  const addOverview = () => {
    setOverviews((prev) => {
      if (prev.length >= 10) return prev;
      return [...prev, { id: nextOverviewIdRef.current++, title: "", content: "" }];
    });
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

  // 日程グループを末尾に追加（MVPは最大10日）
  const addDay = () => {
    setDays((prev) => {
      if (prev.length >= 10) return prev;
      return [...prev, { id: nextDayIdRef.current++, cards: [] }];
    });
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
                { id: nextCardIdRef.current++, time: "", title: "", transport: "", memo: "" },
              ],
            }
          : day,
      ),
    );
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
  const updateCard = (
    dayId: number,
    cardId: number,
    field: keyof Omit<ScheduleCard, "id">,
    value: string,
  ) => {
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
        <Label htmlFor="title" className="gap-1">
          <span className="font-semibold text-[#1A1918] text-sm">タイトル</span>
          <span className="rounded bg-[#3D8A5A] px-2 py-1 font-semibold text-white text-xs">
            必須
          </span>
        </Label>
        <Input
          id="title"
          name="title"
          required
          placeholder="沖縄旅行 2025年3月"
          className="h-11 bg-white"
        />
      </section>

      {/* 概要セクション */}
      <section className="flex flex-col gap-4">
        {/* セクションヘッダー */}
        <div className="flex min-h-8 items-center justify-between">
          <h2 className="font-semibold text-[#1A1918] text-base tracking-tight">概要</h2>
          {overviews.length < 10 && (
            <Button
              type="button"
              onClick={addOverview}
              className="relative cursor-pointer rounded-full bg-[#C8F0D8] px-3 py-1.5 font-semibold text-[#3D8A5A] text-xs leading-5 before:absolute before:-inset-[6px] before:content-[''] hover:bg-[#A8E4C0] active:scale-95"
            >
              <Plus className="size-4" />
              追加
            </Button>
          )}
        </div>

        {/* 概要カードリスト */}
        {overviews.map((item, index) => (
          <Card
            key={item.id}
            className="gap-2 border-[#E5E4E1] bg-white shadow-[0_2px_12px_rgba(26,25,24,0.03)]"
          >
            <CardHeader>
              <CardTitle>
                <span className="rounded-full bg-[#3D8A5A] px-3 py-1 font-semibold text-white text-xs">
                  概要 {index + 1}
                </span>
              </CardTitle>
              <CardAction>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon-sm"
                  className="relative cursor-pointer rounded-full before:absolute before:-inset-2.5 before:content-[''] active:scale-90"
                  onClick={() => removeOverview(item.id)}
                  aria-label="概要を削除"
                >
                  <X />
                </Button>
              </CardAction>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              {/* タイトル */}
              <div className="flex flex-col gap-1">
                <Label htmlFor={`overview-title-${item.id}`} className="text-[#6D6C6A] text-xs">
                  タイトル
                </Label>
                <Input
                  id={`overview-title-${item.id}`}
                  value={item.title}
                  onChange={(e) => updateOverview(item.id, "title", e.target.value)}
                  placeholder="例: 旅費"
                  maxLength={255}
                  className="h-11 bg-white"
                />
              </div>

              {/* 内容 */}
              <div className="flex flex-col gap-1">
                <Label htmlFor={`overview-content-${item.id}`} className="text-[#6D6C6A] text-xs">
                  内容
                </Label>
                <Textarea
                  id={`overview-content-${item.id}`}
                  value={item.content}
                  onChange={(e) => updateOverview(item.id, "content", e.target.value)}
                  placeholder="例: 一人あたり約50,000円"
                  maxLength={500}
                  className="min-h-[88px] bg-white px-3 leading-relaxed"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* 行程セクション */}
      <section className="flex flex-col gap-4">
        {/* セクションヘッダー */}
        <div className="flex min-h-8 items-center justify-between">
          <h2 className="font-semibold text-[#1A1918] text-base tracking-tight">行程</h2>
          {days.length < 10 && (
            <Button
              type="button"
              onClick={addDay}
              className="relative cursor-pointer rounded-full bg-[#C8F0D8] px-3 py-1.5 font-semibold text-[#3D8A5A] text-xs leading-5 before:absolute before:-inset-[6px] before:content-[''] hover:bg-[#A8E4C0] active:scale-95"
            >
              <Plus className="size-4" />
              日程を追加
            </Button>
          )}
        </div>

        {/* 旅行開始日 */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="start-date" className="gap-1.5">
            <span className="font-semibold text-[#1A1918] text-sm">旅行開始日</span>
            <span className="rounded bg-[#EDECEA] px-2 py-1 text-[#9C9B99] text-xs">任意</span>
          </Label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
            className="h-11 cursor-pointer bg-white"
          />
        </div>

        {/* 日程グループリスト */}
        {days.map((day, index) => (
          <Card
            key={day.id}
            className="gap-2 border-[#E5E4E1] bg-white shadow-[0_2px_12px_rgba(26,25,24,0.03)]"
          >
            <CardHeader>
              <CardTitle>
                <span className="rounded-full bg-[#3D8A5A] px-3 py-1 font-semibold text-white text-xs">
                  {index + 1}日目
                </span>
              </CardTitle>
              <CardAction>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon-sm"
                  className="relative cursor-pointer rounded-full before:absolute before:-inset-2.5 before:content-[''] active:scale-90"
                  onClick={() => removeDay(day.id)}
                  aria-label="日程を削除"
                >
                  <X />
                </Button>
              </CardAction>
            </CardHeader>

            <CardContent className="flex flex-col gap-3">
              {/* スケジュールカードリスト */}
              {day.cards.map((card, cardIndex) => (
                <Card
                  key={card.id}
                  className="gap-2 border-[#E5E4E1] bg-white shadow-[0_2px_12px_rgba(26,25,24,0.03)]"
                >
                  <CardHeader>
                    <CardTitle>
                      <span className="rounded-full bg-[#3D8A5A] px-3 py-1 font-semibold text-white text-xs">
                        コマ {cardIndex + 1}
                      </span>
                    </CardTitle>
                    <CardAction>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon-sm"
                        className="relative cursor-pointer rounded-full before:absolute before:-inset-2.5 before:content-[''] active:scale-90"
                        onClick={() => removeCard(day.id, card.id)}
                        aria-label="コマを削除"
                      >
                        <X />
                      </Button>
                    </CardAction>
                  </CardHeader>

                  <CardContent className="flex flex-col gap-4">
                    {/* 時間 */}
                    <div className="flex w-36 flex-col gap-1">
                      <Label
                        htmlFor={`card-time-${day.id}-${card.id}`}
                        className="text-[#6D6C6A] text-xs"
                      >
                        時間
                      </Label>
                      <Input
                        id={`card-time-${day.id}-${card.id}`}
                        type="time"
                        value={card.time}
                        onChange={(e) => updateCard(day.id, card.id, "time", e.target.value)}
                        onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                        className="h-11 cursor-pointer bg-white"
                      />
                    </div>

                    {/* タイトル */}
                    <div className="flex flex-col gap-1">
                      <Label
                        htmlFor={`card-title-${day.id}-${card.id}`}
                        className="text-[#6D6C6A] text-xs"
                      >
                        タイトル
                      </Label>
                      <Input
                        id={`card-title-${day.id}-${card.id}`}
                        value={card.title}
                        onChange={(e) => updateCard(day.id, card.id, "title", e.target.value)}
                        placeholder="例: 那覇空港 到着"
                        maxLength={255}
                        className="h-11 bg-white"
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
                            aria-pressed={card.transport === option.mode}
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
                      <Label
                        htmlFor={`card-memo-${day.id}-${card.id}`}
                        className="text-[#6D6C6A] text-xs"
                      >
                        補足
                      </Label>
                      <Textarea
                        id={`card-memo-${day.id}-${card.id}`}
                        value={card.memo}
                        onChange={(e) => updateCard(day.id, card.id, "memo", e.target.value)}
                        placeholder="例: LCC利用。第2ターミナル"
                        maxLength={200}
                        className="min-h-[88px] bg-white px-3 leading-relaxed"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* コマを追加ボタン */}
              <Button
                type="button"
                variant="outline"
                onClick={() => addCard(day.id)}
                className="relative h-11 w-full cursor-pointer border-[#D1D0CD] border-dashed text-[#6D6C6A] text-xs before:absolute before:-inset-[2px] before:content-[''] hover:bg-[#F5F5F4] hover:text-[#6D6C6A] active:scale-95"
              >
                <Plus className="size-4" />
                コマを追加
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* 完了ボタン */}
      <Button
        type="button"
        size="lg"
        className="h-12 w-full cursor-pointer bg-[#3D8A5A] text-base shadow-[0_2px_8px_rgba(61,138,90,0.19)] hover:bg-[#357A50] active:scale-95"
      >
        <Check className="size-5" />
        完了
      </Button>
    </div>
  );
}
