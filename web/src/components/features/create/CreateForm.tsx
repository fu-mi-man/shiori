"use client";

import {
  Bike,
  Bus,
  CableCar,
  Car,
  CarTaxiFront,
  Footprints,
  Lock,
  PenLine,
  Plane,
  Plus,
  Ship,
  TrainFront,
  X,
} from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { CreateShioriState } from "@/app/create/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// 概要アイテムの型．idはReactのkey用（削除しても重複しないように採番する）
type Overview = {
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

// 行程の1コマ
type Schedule = {
  id: number;
  time: string;
  title: string;
  transport: TransportMode | "";
  memo: string;
};

// 1日分のグループ
type Day = {
  id: number;
  schedules: Schedule[];
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

const initialState: CreateShioriState = { status: "idle", message: "" };

type CreateFormProps = {
  action: (prevState: CreateShioriState, formData: FormData) => Promise<CreateShioriState>;
  initialTitle?: string;
  initialOverviews?: Overview[];
  initialDays?: Day[];
  initialStartDate?: string;
  showPassphrase?: boolean;
  submitLabel?: string;
};

export function CreateForm({
  action,
  initialTitle = "",
  initialOverviews = [],
  initialDays = [
    { id: 0, schedules: [{ id: 0, time: "", title: "", transport: "" as const, memo: "" }] },
  ],
  initialStartDate = "",
  showPassphrase = false,
  submitLabel = "作成する",
}: CreateFormProps) {
  // Server Action の状態管理
  const [state, formAction, pending] = useActionState(action, initialState);

  // バリデーションエラーをトーストで表示
  useEffect(() => {
    if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state]);

  // テキストフィールドのstate（バリデーションエラー時に値を保持するため制御コンポーネントにする）
  const [title, setTitle] = useState(initialTitle);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [passphrase, setPassphrase] = useState("");

  // 概要セクションのstate
  const [overviews, setOverviews] = useState<Overview[]>(initialOverviews);
  const nextOverviewIdRef = useRef(Math.max(0, ...initialOverviews.map((o) => o.id)) + 1);

  // 行程セクションのstate
  const [days, setDays] = useState<Day[]>(initialDays);
  const nextDayIdRef = useRef(Math.max(0, ...initialDays.map((d) => d.id)) + 1);
  const nextScheduleIdRef = useRef(
    Math.max(0, ...initialDays.flatMap((d) => d.schedules.map((s) => s.id))) + 1,
  );

  // 概要カードを末尾に追加（上限10件）
  const addOverview = () => {
    setOverviews((prev) => {
      if (prev.length >= 10) return prev;
      return [...prev, { id: nextOverviewIdRef.current++, title: "", content: "" }];
    });
  };

  // 指定IDの概要カードを削除
  const removeOverview = (id: number) => {
    setOverviews((prev) => prev.filter((item) => item.id !== id));
  };

  // 指定IDの概要カードのフィールドを更新
  const updateOverview = (id: number, field: "title" | "content", value: string) => {
    setOverviews((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  // 日程を末尾に追加（上限10日）．追加時に予定を1件自動追加する
  const addDay = () => {
    setDays((prev) => {
      if (prev.length >= 10) return prev;
      return [
        ...prev,
        {
          id: nextDayIdRef.current++,
          schedules: [
            {
              id: nextScheduleIdRef.current++,
              time: "",
              title: "",
              transport: "" as const,
              memo: "",
            },
          ],
        },
      ];
    });
  };

  // 指定IDの日程を削除
  const removeDay = (id: number) => {
    setDays((prev) => prev.filter((day) => day.id !== id));
  };

  // 指定日程にスケジュールを追加
  const addSchedule = (dayId: number) => {
    setDays((prev) =>
      prev.map((day) =>
        day.id === dayId
          ? {
              ...day,
              schedules: [
                ...day.schedules,
                {
                  id: nextScheduleIdRef.current++,
                  time: "",
                  title: "",
                  transport: "",
                  memo: "",
                },
              ],
            }
          : day,
      ),
    );
  };

  // 指定日程から指定スケジュールを削除
  const removeSchedule = (dayId: number, scheduleId: number) => {
    setDays((prev) =>
      prev.map((day) =>
        day.id === dayId
          ? {
              ...day,
              schedules: day.schedules.filter((schedule) => schedule.id !== scheduleId),
            }
          : day,
      ),
    );
  };

  // 指定スケジュールのフィールドを更新
  const updateSchedule = (
    dayId: number,
    scheduleId: number,
    field: keyof Omit<Schedule, "id">,
    value: string,
  ) => {
    setDays((prev) =>
      prev.map((day) =>
        day.id === dayId
          ? {
              ...day,
              schedules: day.schedules.map((schedule) =>
                schedule.id === scheduleId ? { ...schedule, [field]: value } : schedule,
              ),
            }
          : day,
      ),
    );
  };

  return (
    <form action={formAction} className="flex flex-col gap-7 px-5 py-6">
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
          onChange={(e) => setTitle(e.target.value)}
          placeholder="沖縄旅行 2025年3月"
          value={title}
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
            name="startDate"
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
              {/* スケジュールリスト */}
              {day.schedules.map((schedule, scheduleIndex) => (
                <Card
                  className="gap-2 border-[#E5E4E1] bg-white shadow-[0_2px_12px_rgba(26,25,24,0.03)]"
                  key={schedule.id}
                >
                  <CardHeader>
                    <CardTitle>
                      <Badge variant="step">予定 {scheduleIndex + 1}</Badge>
                    </CardTitle>
                    {day.schedules.length > 1 && (
                      <CardAction>
                        <Button
                          aria-label="予定を削除"
                          className="relative cursor-pointer rounded-full before:absolute before:-inset-2.5 before:content-[''] active:scale-90"
                          onClick={() => removeSchedule(day.id, schedule.id)}
                          size="icon-sm"
                          type="button"
                          variant="destructive"
                        >
                          <X />
                        </Button>
                      </CardAction>
                    )}
                  </CardHeader>

                  <CardContent className="flex flex-col gap-4">
                    {/* 時間 */}
                    <div className="flex w-36 flex-col gap-1">
                      <Label
                        className="text-[#6D6C6A] text-xs"
                        htmlFor={`schedule-time-${day.id}-${schedule.id}`}
                      >
                        時間
                      </Label>
                      <Input
                        className="h-11 cursor-pointer bg-white"
                        id={`schedule-time-${day.id}-${schedule.id}`}
                        onChange={(e) =>
                          updateSchedule(day.id, schedule.id, "time", e.target.value)
                        }
                        onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                        type="time"
                        value={schedule.time}
                      />
                    </div>

                    {/* タイトル */}
                    <div className="flex flex-col gap-1">
                      <Label
                        className="text-[#6D6C6A] text-xs"
                        htmlFor={`schedule-title-${day.id}-${schedule.id}`}
                      >
                        タイトル
                      </Label>
                      <Input
                        className="h-11 bg-white"
                        id={`schedule-title-${day.id}-${schedule.id}`}
                        maxLength={255}
                        onChange={(e) =>
                          updateSchedule(day.id, schedule.id, "title", e.target.value)
                        }
                        placeholder="例: 那覇空港 到着"
                        value={schedule.title}
                      />
                    </div>

                    {/* 交通手段 */}
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-[#6D6C6A] text-xs">交通手段</span>
                      <ToggleGroup
                        aria-label="交通手段"
                        className="flex w-full gap-2 overflow-x-auto"
                        onValueChange={(value) =>
                          updateSchedule(day.id, schedule.id, "transport", value)
                        }
                        type="single"
                        value={schedule.transport}
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
                        htmlFor={`schedule-memo-${day.id}-${schedule.id}`}
                      >
                        補足
                      </Label>
                      <Textarea
                        className="min-h-[88px] bg-white px-3 leading-relaxed"
                        id={`schedule-memo-${day.id}-${schedule.id}`}
                        maxLength={200}
                        onChange={(e) =>
                          updateSchedule(day.id, schedule.id, "memo", e.target.value)
                        }
                        placeholder="例: LCC利用。第2ターミナル"
                        value={schedule.memo}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* 予定を追加ボタン */}
              <Button
                className="relative h-11 w-full cursor-pointer border-[#D1D0CD] border-dashed text-[#6D6C6A] text-xs before:absolute before:-inset-[2px] before:content-[''] hover:bg-[#F5F5F4] hover:text-[#6D6C6A] active:scale-95"
                onClick={() => addSchedule(day.id)}
                type="button"
                variant="outline"
              >
                <Plus className="size-4" />
                予定を追加
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* 合言葉セクション */}
      {showPassphrase && (
        <section className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <Lock aria-hidden="true" className="size-4 text-[#6D6C6A]" />
            <Label className="gap-1.5" htmlFor="passphrase">
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
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder="合言葉を入力"
            value={passphrase}
          />
        </section>
      )}

      {/* stateで管理している複雑なデータをFormDataに含めるためのhidden input */}
      <input
        name="overviews"
        type="hidden"
        value={JSON.stringify(
          overviews.map((item) => ({
            title: item.title,
            content: item.content,
          })),
        )}
      />
      <input
        name="days"
        type="hidden"
        value={JSON.stringify(
          days.map((day) => ({
            schedules: day.schedules.map((schedule) => ({
              time: schedule.time,
              title: schedule.title,
              transport: schedule.transport,
              memo: schedule.memo,
            })),
          })),
        )}
      />
      {/* 作成ボタン */}
      <Button
        className="h-[52px] w-full cursor-pointer gap-2 rounded-xl bg-[#3D8A5A] font-semibold text-base text-white shadow-[0_2px_8px_#3D8A5A30] hover:bg-[#2f6e47] active:scale-95"
        disabled={pending}
        type="submit"
      >
        <PenLine className="h-5 w-5" />
        {pending ? "保存中..." : submitLabel}
      </Button>
    </form>
  );
}
