import {
  Check,
  CircleCheck,
  Home as HomeIcon,
  Link as LinkIcon,
  MapPin,
  Minus,
  PenLine,
  Timer,
  Users,
  UserX,
  X,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/features/common/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  { num: "1", title: "しおりを作る", desc: "タイトルと行程を入力するだけ" },
  { num: "2", title: "URLをコピー", desc: "完成したらURLが自動で発行" },
  { num: "3", title: "みんなにシェア", desc: "URLを送れば全員が同じ予定を確認" },
];

type CompareValue = "yes" | "no" | "partial";

const comparisonRows: {
  label: string;
  app: CompareValue;
  web: CompareValue;
  shiori: CompareValue;
}[] = [
  { label: "登録不要", app: "no", web: "yes", shiori: "yes" },
  { label: "インストール不要", app: "no", web: "yes", shiori: "yes" },
  { label: "モバイル最適化", app: "yes", web: "partial", shiori: "yes" },
  { label: "即シェア（URL共有）", app: "partial", web: "yes", shiori: "yes" },
  { label: "オフライン対応", app: "yes", web: "partial", shiori: "partial" },
  { label: "地図連携", app: "yes", web: "partial", shiori: "no" },
];

const features = [
  {
    icon: Zap,
    title: "かんたん作成",
    desc: "タイトルを入れるだけでOK、行程は後から追加できます",
  },
  {
    icon: LinkIcon,
    title: "URLでシェア",
    desc: "URLを送るだけでみんなに共有できる",
  },
  {
    icon: UserX,
    title: "アカウント不要",
    desc: "会員登録なしですぐ使える、メールアドレスも不要です",
  },
];

const experiencePoints = [
  { icon: MapPin, text: "タイムライン表示で、次の予定がひと目でわかる" },
  { icon: HomeIcon, text: "ホーム画面に追加すれば、アプリ感覚でワンタップで開ける" },
  { icon: Users, text: "全員が同じ画面を見るから、認識のズレが起きない" },
];

const voices = [
  {
    icon: PenLine,
    title: "旅の全体像がクリアになる",
    desc: "書き出してみたら『ホテルのチェックイン時間調べてなかった』に気づける",
  },
  {
    icon: Users,
    title: "「予定どうだっけ？」がなくなる",
    desc: "グループLINEにURL貼るだけで共有完了、説明いらずでラク",
  },
  {
    icon: Timer,
    title: "当日の段取りがスムーズになる",
    desc: "当日『次どこ行くんだっけ？』と聞かれなくなる",
  },
];

const faqs = [
  {
    q: "本当に無料ですか？",
    a: "すべての機能を無料でお使いいただけます。アカウント登録も不要です。",
  },
  {
    q: "作ったしおりはいつまで残りますか？",
    a: "最後のアクセスから3ヶ月経過すると自動的に削除されます。期間内にアクセスすれば延長されます。",
  },
  {
    q: "他の人に勝手に編集されませんか？",
    a: "編集保護機能を準備中です。URLを知っている人のみ閲覧・編集できます。",
  },
];

const ctaClassName =
  "h-[52px] w-full cursor-pointer gap-2 rounded-xl bg-[#3D8A5A] font-semibold text-base text-white shadow-[0_2px_8px_#3D8A5A30] hover:bg-[#2f6e47] active:scale-95 [a]:hover:bg-[#2f6e47]";

function CompareIcon({ value }: { value: CompareValue }) {
  if (value === "yes")
    return (
      <>
        <Check className="h-4 w-4 text-[#3D8A5A]" />
        <span className="sr-only">対応</span>
      </>
    );
  if (value === "no")
    return (
      <>
        <X className="h-4 w-4 text-red-400" />
        <span className="sr-only">非対応</span>
      </>
    );
  return (
    <>
      <Minus className="h-4 w-4 text-gray-300" />
      <span className="sr-only">一部対応</span>
    </>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F4F1]">
      <Header />

      <div className="mx-auto max-w-xl">
        {/* Hero Section */}
        <section className="flex flex-col items-center gap-7 px-6 pt-10 pb-10">
          {/* Icon */}
          <Image
            alt=""
            className="rounded-[20px]"
            height={72}
            priority
            src="/tabiji-icon.png"
            width={72}
          />

          {/* Text */}
          <div className="flex w-full flex-col items-center gap-4">
            <h1 className="text-center font-extrabold text-[32px] text-stone-900 leading-[1.3] tracking-tight">
              旅のしおりを
              <br />
              かんたん作成
            </h1>
            <p className="text-center text-[15px] text-stone-600 leading-[1.6]">
              行程表を作って、URLでシェア。たった3ステップ。
              <br />
              アプリもアカウントも不要です。
            </p>
          </div>

          {/* CTA Button */}
          <Button asChild className={ctaClassName}>
            <Link href="/create">
              <PenLine className="h-5 w-5" />
              しおりを作る
            </Link>
          </Button>

          {/* Free Badge */}
          <div className="flex items-center gap-1.5">
            <CircleCheck className="h-4 w-4 text-[#3D8A5A]" />
            <span className="font-semibold text-[#3D8A5A] text-sm">無料・登録不要ですぐ使える</span>
          </div>
        </section>

        {/* Steps Section */}
        <section className="flex flex-col gap-6 px-6 py-6">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-1 rounded-sm bg-[#3D8A5A]" />
            <h2 className="font-bold text-stone-900 text-xl tracking-tight">たった3ステップ</h2>
          </div>
          <div className="flex flex-col gap-5">
            {steps.map(({ num, title, desc }) => (
              <div className="flex items-center gap-3.5" key={num}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3D8A5A]">
                  <span className="font-bold text-sm text-white">{num}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-[15px] text-stone-900">{title}</span>
                  <span className="text-[13px] text-stone-600">{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison Section */}
        <section className="flex flex-col gap-5 px-6 py-6">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-1 rounded-sm bg-[#3D8A5A]" />
            <h2 className="font-bold text-stone-900 text-xl tracking-tight">他サービスとの違い</h2>
          </div>
          <div className="overflow-hidden rounded-xl border border-[#E5E4E1]">
            {/* Table Header */}
            <div className="flex h-10 items-center bg-[#3D8A5A] px-4">
              <span className="flex-1" />
              <span className="w-[70px] text-center font-semibold text-white/70 text-xs">
                アプリ型
              </span>
              <span className="w-[70px] text-center font-semibold text-white/70 text-xs">
                他Web型
              </span>
              <span className="w-[60px] text-center font-bold text-white text-xs">Tabiji</span>
            </div>
            {/* Table Rows */}
            {comparisonRows.map(({ label, app, web, shiori }, i) => (
              <div
                className={`flex h-10 items-center bg-white px-4 ${i < comparisonRows.length - 1 ? "border-[#E5E4E1] border-b" : ""}`}
                key={label}
              >
                <span className="flex-1 font-medium text-stone-900 text-xs">{label}</span>
                <div className="flex w-[70px] justify-center">
                  <CompareIcon value={app} />
                </div>
                <div className="flex w-[70px] justify-center">
                  <CompareIcon value={web} />
                </div>
                <div className="flex w-[60px] justify-center">
                  <CompareIcon value={shiori} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="flex flex-col gap-6 px-6 py-6">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-1 rounded-sm bg-[#3D8A5A]" />
            <h2 className="font-bold text-stone-900 text-xl tracking-tight">Tabijiの特徴</h2>
          </div>
          <div className="flex flex-col gap-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <Card className="border-[#E5E4E1] bg-white py-0" key={title}>
                <CardContent className="flex items-center gap-3.5 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#3D8A5A]/10">
                    <Icon className="h-[22px] w-[22px] text-[#3D8A5A]" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-[15px] text-stone-900">{title}</span>
                    <span className="text-[13px] text-stone-600 leading-[1.5]">{desc}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Experience Section */}
        <section className="flex flex-col gap-5 px-6 py-6">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-1 rounded-sm bg-[#3D8A5A]" />
            <h2 className="font-bold text-stone-900 text-xl tracking-tight">
              旅先での「確認」に最適化
            </h2>
          </div>
          <p className="text-[14px] text-stone-600 leading-[1.7]">
            移動中でもストレスなく、次の予定がすぐわかります。
          </p>
          <div className="flex flex-col gap-3">
            {experiencePoints.map(({ icon: Icon, text }) => (
              <div className="flex items-center gap-2.5" key={text}>
                <Icon className="h-[18px] w-[18px] shrink-0 text-[#3D8A5A]" />
                <span className="font-semibold text-[14px] text-stone-900">{text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Voices Section */}
        <section className="flex flex-col gap-5 px-6 py-6">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-1 rounded-sm bg-[#3D8A5A]" />
            <h2 className="font-bold text-stone-900 text-xl tracking-tight">
              しおりがあると、こう変わる
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {voices.map(({ icon: Icon, title, desc }) => (
              <Card className="border-[#E5E4E1] bg-white py-0" key={title}>
                <CardContent className="flex items-center gap-3.5 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50">
                    <Icon className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-[14px] text-stone-900">{title}</span>
                    <span className="text-[12px] text-stone-600 leading-[1.5]">{desc}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="flex flex-col gap-5 px-6 py-6">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-1 rounded-sm bg-[#3D8A5A]" />
            <h2 className="font-bold text-stone-900 text-xl tracking-tight">よくある質問</h2>
          </div>
          <div className="flex flex-col gap-3">
            {faqs.map(({ q, a }) => (
              <Card className="border-[#E5E4E1] bg-white py-0" key={q}>
                <CardContent className="flex flex-col gap-2 p-4">
                  <span className="font-semibold text-[14px] text-stone-900">Q. {q}</span>
                  <span className="text-[13px] text-stone-600 leading-[1.6]">A. {a}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="flex flex-col items-center gap-4 px-6 pt-4 pb-10">
          <Button asChild className={ctaClassName}>
            <Link href="/create">
              <PenLine className="h-5 w-5" />
              しおりを作る
            </Link>
          </Button>
          <div className="flex items-center gap-1.5">
            <CircleCheck className="h-4 w-4 text-[#3D8A5A]" />
            <span className="font-semibold text-[#3D8A5A] text-sm">無料・登録不要ですぐ使える</span>
          </div>
          <p className="text-center text-[12px] text-stone-600">
            しおりを作ることで
            <Link className="font-bold underline" href="/terms">
              利用規約
            </Link>
            と
            <Link className="font-bold underline" href="/privacy">
              プライバシーポリシー
            </Link>
            に同意したものとみなされます。
          </p>
        </div>
      </div>
    </div>
  );
}
