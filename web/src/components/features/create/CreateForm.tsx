"use client";

import {
  Bike,
  Bus,
  CableCar,
  Car,
  CarTaxiFront,
  Check,
  Footprints,
  Lock,
  Plane,
  Plus,
  Ship,
  TrainFront,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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
    <form
      action={() => {
        // TODO: Server Actionを実装したら接続する
      }}
      className="flex flex-col gap-7 px-5 py-6"
    >
      {/* タイトルセクション */}
      <section className="flex flex-col gap-2">
        <Label className="gap-1" htmlFor="title">
          <span className="font-semibold text-[#1A1918] text-sm">タイトル</span>
          <Badge className="bg-[#3D8A5A] font-semibold text-white">必須</Badge>
        </Label>
        <Input
          className="h-11 bg-white"
          id="title"
          name="title"
          placeholder="沖縄旅行 2025年3月"
          required
        />
      </section>

      {/* 概要セクション */}
      <section className="flex flex-col gap-4">
        {/* セクションヘッダー */}
        <div className="flex min-h-8 items-center justify-between">
          <h2 className="font-semibold text-[#1A1918] text-base tracking-tight">概要</h2>
          {overviews.length < 10 && (
            <Button
              className="relative cursor-pointer rounded-full bg-[#C8F0D8] px-3 py-1.5 font-semibold text-[#3D8A5A] text-xs leading-5 before:absolute before:-inset-[6px] before:content-[''] hover:bg-[#A8E4C0] active:scale-95"
              onClick={addOverview}
              type="button"
            >
              <Plus className="size-4" />
              追加
            </Button>
          )}
        </div>

        {/* 概要カードリスト */}
        {overviews.map((item, index) => (
          <Card
            className="gap-2 border-[#E5E4E1] bg-white shadow-[0_2px_12px_rgba(26,25,24,0.03)]"
            key={item.id}
          >
            <CardHeader>
              <CardTitle>
                <Badge variant="step">概要 {index + 1}</Badge>
              </CardTitle>
              <CardAction>
                <Button
                  aria-label="概要を削除"
                  className="relative cursor-pointer rounded-full before:absolute before:-inset-2.5 before:content-[''] active:scale-90"
                  onClick={() => removeOverview(item.id)}
                  size="icon-sm"
                  type="button"
                  variant="destructive"
                >
                  <X />
                </Button>
              </CardAction>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              {/* タイトル */}
              <div className="flex flex-col gap-1">
                <Label className="text-[#6D6C6A] text-xs" htmlFor={`overview-title-${item.id}`}>
                  タイトル
                </Label>
                <Input
                  className="h-11 bg-white"
                  id={`overview-title-${item.id}`}
                  maxLength={255}
                  onChange={(e) => updateOverview(item.id, "title", e.target.value)}
                  placeholder="例: 旅費"
                  value={item.title}
                />
              </div>

              {/* 内容 */}
              <div className="flex flex-col gap-1">
                <Label className="text-[#6D6C6A] text-xs" htmlFor={`overview-content-${item.id}`}>
                  内容
                </Label>
                <Textarea
                  className="min-h-[88px] bg-white px-3 leading-relaxed"
                  id={`overview-content-${item.id}`}
                  maxLength={500}
                  onChange={(e) => updateOverview(item.id, "content", e.target.value)}
                  placeholder="例: 一人あたり約50,000円"
                  value={item.content}
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
              className="relative cursor-pointer rounded-full bg-[#C8F0D8] px-3 py-1.5 font-semibold text-[#3D8A5A] text-xs leading-5 before:absolute before:-inset-[6px] before:content-[''] hover:bg-[#A8E4C0] active:scale-95"
              onClick={addDay}
              type="button"
            >
              <Plus className="size-4" />
              日程を追加
            </Button>
          )}
        </div>

        {/* 旅行開始日 */}
        <div className="flex flex-col gap-2">
          <Label className="gap-1.5" htmlFor="start-date">
            <span className="font-semibold text-[#1A1918] text-sm">旅行開始日</span>
            <span className="rounded bg-[#EDECEA] px-2 py-1 text-[#9C9B99] text-xs">任意</span>
          </Label>
          <Input
            className="h-11 cursor-pointer bg-white"
            id="start-date"
            onChange={(e) => setStartDate(e.target.value)}
            onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
            type="date"
            value={startDate}
          />
        </div>

        {/* 日程グループリスト */}
        {days.map((day, index) => (
          <Card
            className="gap-2 border-[#E5E4E1] bg-white shadow-[0_2px_12px_rgba(26,25,24,0.03)]"
            key={day.id}
          >
            <CardHeader>
              <CardTitle>
                <Badge variant="step">{index + 1}日目</Badge>
              </CardTitle>
              <CardAction>
                <Button
                  aria-label="日程を削除"
                  className="relative cursor-pointer rounded-full before:absolute before:-inset-2.5 before:content-[''] active:scale-90"
                  onClick={() => removeDay(day.id)}
                  size="icon-sm"
                  type="button"
                  variant="destructive"
                >
                  <X />
                </Button>
              </CardAction>
            </CardHeader>

            <CardContent className="flex flex-col gap-3">
              {/* スケジュールカードリスト */}
              {day.cards.map((card, cardIndex) => (
                <Card
                  className="gap-2 border-[#E5E4E1] bg-white shadow-[0_2px_12px_rgba(26,25,24,0.03)]"
                  key={card.id}
                >
                  <CardHeader>
                    <CardTitle>
                      <Badge variant="step">コマ {cardIndex + 1}</Badge>
                    </CardTitle>
                    <CardAction>
                      <Button
                        aria-label="コマを削除"
                        className="relative cursor-pointer rounded-full before:absolute before:-inset-2.5 before:content-[''] active:scale-90"
                        onClick={() => removeCard(day.id, card.id)}
                        size="icon-sm"
                        type="button"
                        variant="destructive"
                      >
                        <X />
                      </Button>
                    </CardAction>
                  </CardHeader>

                  <CardContent className="flex flex-col gap-4">
                    {/* 時間 */}
                    <div className="flex w-36 flex-col gap-1">
                      <Label
                        className="text-[#6D6C6A] text-xs"
                        htmlFor={`card-time-${day.id}-${card.id}`}
                      >
                        時間
                      </Label>
                      <Input
                        className="h-11 cursor-pointer bg-white"
                        id={`card-time-${day.id}-${card.id}`}
                        onChange={(e) => updateCard(day.id, card.id, "time", e.target.value)}
                        onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                        type="time"
                        value={card.time}
                      />
                    </div>

                    {/* タイトル */}
                    <div className="flex flex-col gap-1">
                      <Label
                        className="text-[#6D6C6A] text-xs"
                        htmlFor={`card-title-${day.id}-${card.id}`}
                      >
                        タイトル
                      </Label>
                      <Input
                        className="h-11 bg-white"
                        id={`card-title-${day.id}-${card.id}`}
                        maxLength={255}
                        onChange={(e) => updateCard(day.id, card.id, "title", e.target.value)}
                        placeholder="例: 那覇空港 到着"
                        value={card.title}
                      />
                    </div>

                    {/* 交通手段 */}
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-[#6D6C6A] text-xs">交通手段</span>
                      <ToggleGroup
                        aria-label="交通手段"
                        className="flex w-full gap-2 overflow-x-auto"
                        onValueChange={(value) => updateCard(day.id, card.id, "transport", value)}
                        type="single"
                        value={card.transport}
                      >
                        {TRANSPORT_OPTIONS.map((option) => (
                          <ToggleGroupItem
                            aria-label={option.label}
                            className="size-11 shrink-0 cursor-pointer rounded-lg border border-[#E5E4E1] bg-white text-[#9C9B99] hover:bg-[#F5F5F4] data-[state=on]:border-[#3D8A5A] data-[state=on]:border-[1.5px] data-[state=on]:bg-[#C8F0D8] data-[state=on]:text-[#3D8A5A]"
                            key={option.mode}
                            value={option.mode}
                          >
                            <option.icon className="size-5" />
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                    </div>

                    {/* 補足 */}
                    <div className="flex flex-col gap-1">
                      <Label
                        className="text-[#6D6C6A] text-xs"
                        htmlFor={`card-memo-${day.id}-${card.id}`}
                      >
                        補足
                      </Label>
                      <Textarea
                        className="min-h-[88px] bg-white px-3 leading-relaxed"
                        id={`card-memo-${day.id}-${card.id}`}
                        maxLength={200}
                        onChange={(e) => updateCard(day.id, card.id, "memo", e.target.value)}
                        placeholder="例: LCC利用。第2ターミナル"
                        value={card.memo}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* コマを追加ボタン */}
              <Button
                className="relative h-11 w-full cursor-pointer border-[#D1D0CD] border-dashed text-[#6D6C6A] text-xs before:absolute before:-inset-[2px] before:content-[''] hover:bg-[#F5F5F4] hover:text-[#6D6C6A] active:scale-95"
                onClick={() => addCard(day.id)}
                type="button"
                variant="outline"
              >
                <Plus className="size-4" />
                コマを追加
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* 合言葉セクション */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <Lock aria-hidden="true" className="size-4 text-[#6D6C6A]" />
          <Label htmlFor="passphrase">
            <span className="font-semibold text-[#1A1918] text-sm">合言葉</span>
            <span className="rounded bg-[#EDECEA] px-2 py-1 text-[#9C9B99] text-xs">任意</span>
          </Label>
        </div>
        <p className="text-[#9C9B99] text-xs leading-relaxed" id="passphrase-description">
          設定すると、編集時に合言葉の入力が必要になります
        </p>
        <Input
          aria-describedby="passphrase-description"
          className="h-11 bg-white"
          id="passphrase"
          name="passphrase"
          placeholder="合言葉を入力"
        />
      </section>

      {/* 完了ボタン */}
      <Button
        className="h-12 w-full cursor-pointer bg-[#3D8A5A] text-base shadow-[0_2px_8px_rgba(61,138,90,0.19)] hover:bg-[#357A50] active:scale-95"
        size="lg"
        type="submit"
      >
        <Check className="size-5" />
        完了
      </Button>
    </form>
  );
}
