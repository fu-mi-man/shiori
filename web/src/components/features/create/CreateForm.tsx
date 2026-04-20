"use client";

import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format, parse } from "date-fns";
import { CalendarDays, GripVertical, PenLine, Plus, X } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { CreateShioriState } from "@/app/create/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

/** 旅の情報アイテムの型．id は React key 用（削除後も重複しない連番） */
type Overview = {
  id: number;
  title: string;
  content: string;
};

/** 行程の1コマ．id は React key 用（削除後も重複しない連番） */
type Schedule = {
  id: number;
  time: string;
  title: string;
  memo: string;
};

/** 1日分の行程グループ */
type Day = {
  id: number;
  schedules: Schedule[];
};

/** Server Action の初期状態 */
const initialState: CreateShioriState = { status: "idle", message: "" };

/** CreateForm コンポーネントの props */
type CreateFormProps = {
  action: (prevState: CreateShioriState, formData: FormData) => Promise<CreateShioriState>;
  initialTitle?: string;
  initialOverviews?: Overview[];
  initialDays?: Day[];
  initialStartDate?: string;
  submitLabel?: string;
};

/** ドラッグ&ドロップ可能な予定カードの props */
type SortableScheduleCardProps = {
  /** 表示・編集対象の予定データ */
  schedule: Schedule;
  /** 日程内での表示順インデックス（0始まり），バッジの「予定 N」表示に使用 */
  scheduleIndex: number;
  /** 同じ日程内の予定件数，1件のときは削除ボタンを非表示にするために使用 */
  daySchedulesCount: number;
  /** 削除ボタン押下時のコールバック */
  onRemove: () => void;
  /** フィールド値変更時のコールバック */
  onUpdate: (field: keyof Omit<Schedule, "id">, value: string) => void;
};

/**
 * ドラッグ&ドロップで並び替えできる予定カード
 *
 * dnd-kit の `useSortable` を使い，ドラッグハンドル（GripVertical）にのみ
 * listeners/attributes を付与することで，カード本体のスクロール操作と干渉しない．
 */
function SortableScheduleCard({
  schedule,
  scheduleIndex,
  daySchedulesCount,
  onRemove,
  onUpdate,
}: SortableScheduleCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: schedule.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  };

  return (
    <Card
      className="gap-2 border-[#E5E4E1] bg-white shadow-[0_2px_12px_rgba(26,25,24,0.03)]"
      ref={setNodeRef}
      style={style}
    >
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-2">
            {/* ドラッグハンドル - 見た目 24px・タッチターゲット 44px（before で拡張） */}
            <button
              {...attributes}
              {...listeners}
              aria-label="予定を並び替え"
              className="relative flex size-6 cursor-grab items-center justify-center rounded text-[#C4C3C0] before:absolute before:-inset-2.5 before:content-[''] hover:bg-[#EDECEA] hover:text-[#6D6C6A] active:cursor-grabbing"
              title="ドラッグして並び替え"
              type="button"
            >
              <GripVertical className="size-4" />
            </button>
            <Badge variant="step">予定 {scheduleIndex + 1}</Badge>
          </div>
        </CardTitle>
        {daySchedulesCount > 1 && (
          <CardAction>
            <Button
              aria-label="予定を削除"
              className="relative cursor-pointer rounded-full before:absolute before:-inset-2.5 before:content-[''] active:scale-90"
              onClick={onRemove}
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
          <Label className="text-[#6D6C6A] text-xs" htmlFor={`schedule-time-${schedule.id}`}>
            時間
          </Label>
          <Input
            className="h-11 cursor-pointer appearance-none bg-white [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            id={`schedule-time-${schedule.id}`}
            onChange={(e) => onUpdate("time", e.target.value)}
            onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
            type="time"
            value={schedule.time}
          />
        </div>

        {/* 予定 */}
        <div className="flex flex-col gap-1">
          <Label className="text-[#6D6C6A] text-xs" htmlFor={`schedule-title-${schedule.id}`}>
            予定
          </Label>
          <Input
            className="h-11 bg-white"
            id={`schedule-title-${schedule.id}`}
            maxLength={255}
            onChange={(e) => onUpdate("title", e.target.value)}
            placeholder="例: 美ら海水族館"
            value={schedule.title}
          />
        </div>

        {/* メモ */}
        <div className="flex flex-col gap-1">
          <Label className="text-[#6D6C6A] text-xs" htmlFor={`schedule-memo-${schedule.id}`}>
            メモ
          </Label>
          <Textarea
            className="min-h-[88px] bg-white px-3 leading-relaxed"
            id={`schedule-memo-${schedule.id}`}
            maxLength={200}
            onChange={(e) => onUpdate("memo", e.target.value)}
            placeholder="例: チケットはコンビニで買うと安いよ！"
            value={schedule.memo}
          />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * しおり作成・編集フォーム
 *
 * 作成画面・編集画面で共用するフォームコンポーネント．
 * Server Actions（useActionState）経由で送信する．
 */
export function CreateForm({
  action,
  initialTitle = "",
  initialOverviews = [],
  initialDays = [{ id: 0, schedules: [{ id: 0, time: "", title: "", memo: "" }] }],
  initialStartDate = "",
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
  const [calendarOpen, setCalendarOpen] = useState(false);

  // 旅の情報セクションのstate
  const [overviews, setOverviews] = useState<Overview[]>(initialOverviews);
  const nextOverviewIdRef = useRef(Math.max(0, ...initialOverviews.map((o) => o.id)) + 1);

  // 行程セクションのstate
  const [days, setDays] = useState<Day[]>(initialDays);
  const nextDayIdRef = useRef(Math.max(0, ...initialDays.map((d) => d.id)) + 1);
  const nextScheduleIdRef = useRef(
    Math.max(0, ...initialDays.flatMap((d) => d.schedules.map((s) => s.id))) + 1,
  );

  /** 旅の情報カードを末尾に追加する．上限は10件 */
  const addOverview = () => {
    setOverviews((prev) => {
      if (prev.length >= 10) return prev;
      return [...prev, { id: nextOverviewIdRef.current++, title: "", content: "" }];
    });
  };

  /** 指定 id の旅の情報カードを削除する */
  const removeOverview = (id: number) => {
    setOverviews((prev) => prev.filter((item) => item.id !== id));
  };

  /** 指定 id の旅の情報カードのフィールドを更新する */
  const updateOverview = (id: number, field: "title" | "content", value: string) => {
    setOverviews((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  /** 日程を末尾に追加する．上限は10日．追加時に予定を1件自動追加する */
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
              memo: "",
            },
          ],
        },
      ];
    });
  };

  /** 指定 id の日程を削除する */
  const removeDay = (id: number) => {
    setDays((prev) => prev.filter((day) => day.id !== id));
  };

  /** 指定日程に予定を1件追加する */
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
                  memo: "",
                },
              ],
            }
          : day,
      ),
    );
  };

  /** 指定日程から指定予定を削除する */
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

  // ハンドル専用なのでスクロールとの競合はなし，5px 移動で即起動
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  /** 指定日程内の予定順序を並び替える */
  const reorderSchedule = (dayId: number, activeId: number, overId: number) => {
    setDays((prev) =>
      prev.map((day) => {
        if (day.id !== dayId) return day;
        const oldIndex = day.schedules.findIndex((s) => s.id === activeId);
        const newIndex = day.schedules.findIndex((s) => s.id === overId);
        // 現状は SortableContext items と schedule.id の整合が取れているため -1 にならないが，
        // 将来 id 生成ロジックが変わったときに arrayMove(list, -1, ...) で末尾が不可解に移動するのを防ぐ
        if (oldIndex === -1 || newIndex === -1) return day;
        return { ...day, schedules: arrayMove(day.schedules, oldIndex, newIndex) };
      }),
    );
  };

  /** 指定予定のフィールドを更新する */
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

      {/* 旅の情報セクション */}
      <section className="flex flex-col gap-4">
        {/* セクションヘッダー */}
        <div className="flex min-h-8 items-center justify-between">
          <h2 className="font-semibold text-[#1A1918] text-base tracking-tight">旅の情報</h2>
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

        {/* 旅の情報カードリスト */}
        {overviews.map((item, index) => (
          <Card
            className="gap-2 border-[#E5E4E1] bg-white shadow-[0_2px_12px_rgba(26,25,24,0.03)]"
            key={item.id}
          >
            <CardHeader>
              <CardTitle>
                <Badge variant="step">{index + 1}</Badge>
              </CardTitle>
              <CardAction>
                <Button
                  aria-label="旅の情報を削除"
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
              {/* 項目 */}
              <div className="flex flex-col gap-1">
                <Label className="text-[#6D6C6A] text-xs" htmlFor={`overview-title-${item.id}`}>
                  項目
                </Label>
                <Input
                  className="h-11 bg-white"
                  id={`overview-title-${item.id}`}
                  maxLength={255}
                  onChange={(e) => updateOverview(item.id, "title", e.target.value)}
                  placeholder="例: 持ち物"
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
                  placeholder="例: 日焼け止めとサングラスは必須！"
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
        <div className="flex w-1/2 flex-col gap-2">
          <Label className="gap-1.5" htmlFor="start-date-trigger">
            <span className="font-semibold text-[#1A1918] text-sm">旅行開始日</span>
            <span className="rounded bg-[#EDECEA] px-2 py-1 text-[#9C9B99] text-xs">任意</span>
          </Label>
          <Popover onOpenChange={setCalendarOpen} open={calendarOpen}>
            <PopoverTrigger asChild>
              <Button
                className="h-11 w-full cursor-pointer justify-start border-input bg-white px-2.5 font-normal text-base hover:bg-white md:text-sm"
                id="start-date-trigger"
                type="button"
                variant="outline"
              >
                <CalendarDays className="size-4 text-muted-foreground" />
                {startDate ? (
                  format(parse(startDate, "yyyy-MM-dd", new Date()), "yyyy年M月d日")
                ) : (
                  <span className="text-muted-foreground">日付を選択</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                mode="single"
                onSelect={(date) => {
                  setStartDate(date ? format(date, "yyyy-MM-dd") : "");
                  setCalendarOpen(false);
                }}
                selected={startDate ? parse(startDate, "yyyy-MM-dd", new Date()) : undefined}
              />
            </PopoverContent>
          </Popover>
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
              <DndContext
                id={`schedule-dnd-${day.id}`}
                onDragEnd={(event: DragEndEvent) => {
                  const { active, over } = event;
                  if (over && active.id !== over.id) {
                    reorderSchedule(day.id, active.id as number, over.id as number);
                  }
                }}
                sensors={sensors}
              >
                <SortableContext
                  items={day.schedules.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {day.schedules.map((schedule, scheduleIndex) => (
                    <SortableScheduleCard
                      daySchedulesCount={day.schedules.length}
                      key={schedule.id}
                      onRemove={() => removeSchedule(day.id, schedule.id)}
                      onUpdate={(field, value) => updateSchedule(day.id, schedule.id, field, value)}
                      schedule={schedule}
                      scheduleIndex={scheduleIndex}
                    />
                  ))}
                </SortableContext>
              </DndContext>

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

      {/* stateで管理している複雑なデータをFormDataに含めるためのhidden input */}
      <input name="startDate" type="hidden" value={startDate} />
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
