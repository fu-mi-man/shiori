import {
  Check,
  CircleCheck,
  Link as LinkIcon,
  Map as MapIcon,
  Minus,
  PenLine,
  Smartphone,
  Timer,
  Users,
  UserX,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
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
];

const voices = [
  {
    icon: PenLine,
    title: "旅の全体像がクリアになる",
    desc: "行程を書き出すだけで準備の抜け漏れに気づけます",
  },
  {
    icon: Users,
    title: "「予定どうだっけ？」がなくなる",
    desc: "URLを送るだけで全員が同じ予定を確認できます",
  },
  {
    icon: Timer,
    title: "当日の段取りがスムーズになる",
    desc: "集合時間や移動手段が明確だから、当日慌てません",
  },
];

const experiencePoints = [
  { icon: Smartphone, text: "モバイルファーストのタイムライン表示" },
  { icon: Zap, text: "高速表示に最適化された軽量設計" },
];

const features = [
  {
    icon: Zap,
    title: "かんたん作成",
    desc: "タイトルを入れるだけでOK。行程は後から追加できます",
  },
  {
    icon: LinkIcon,
    title: "URLでシェア",
    desc: "作ったしおりはURLをコピーするだけで共有完了",
  },
  {
    icon: UserX,
    title: "アカウント不要",
    desc: "会員登録なしですぐ使える。メールアドレスも不要です",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F4F1]">
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <header className="flex h-14 items-center px-5">
          <span className="font-bold text-[#3D8A5A] text-xl tracking-tight">Shiori</span>
        </header>

        {/* Hero Section */}
        <section className="flex flex-col items-center gap-7 px-6 pt-10 pb-10">
          {/* Icon */}
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[20px] bg-[#3D8A5A]">
            <MapIcon className="h-9 w-9 text-white" />
          </div>

          {/* Text */}
          <div className="flex w-full flex-col items-center gap-4">
            <h1 className="text-center font-extrabold text-[32px] text-gray-900 leading-[1.3] tracking-tight">
              旅のしおりを
              <br />
              かんたん作成
            </h1>
            <p className="text-center text-[15px] text-gray-500 leading-[1.6]">
              行程表をサクッと作って、URLでみんなにシェア。
              <br />
              アカウント登録は不要です。
            </p>
          </div>

          {/* CTA Button */}
          <Button
            asChild
            className="h-[52px] w-full gap-2 rounded-xl bg-[#3D8A5A] font-semibold text-base text-white shadow-[0_2px_8px_#3D8A5A30] hover:bg-[#2f6e47]"
          >
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

        {/* Features Section */}
        <section className="flex flex-col gap-6 px-6 py-6">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-1 rounded-sm bg-[#3D8A5A]" />
            <h2 className="font-bold text-gray-900 text-xl tracking-tight">Shioriの特徴</h2>
          </div>
          <div className="flex flex-col gap-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <Card className="border-[#E5E4E1] bg-white py-0" key={title}>
                <CardContent className="flex items-center gap-3.5 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#3D8A5A]/10">
                    <Icon className="h-[22px] w-[22px] text-[#3D8A5A]" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-[15px] text-gray-900">{title}</span>
                    <span className="text-[13px] text-gray-500 leading-[1.5]">{desc}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Steps Section */}
        <section className="flex flex-col gap-6 px-6 py-6">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-1 rounded-sm bg-[#3D8A5A]" />
            <h2 className="font-bold text-gray-900 text-xl tracking-tight">たった3ステップ</h2>
          </div>
          <div className="flex flex-col gap-5">
            {steps.map(({ num, title, desc }) => (
              <div className="flex items-center gap-3.5" key={num}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3D8A5A]">
                  <span className="font-bold text-sm text-white">{num}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-[15px] text-gray-900">{title}</span>
                  <span className="text-[13px] text-gray-500">{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Experience Section */}
        <section className="flex flex-col gap-5 px-6 py-6">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-1 rounded-sm bg-[#3D8A5A]" />
            <h2 className="font-bold text-gray-900 text-xl tracking-tight">
              旅先での「確認」に最適化
            </h2>
          </div>
          <p className="text-[14px] text-gray-500 leading-[1.7]">
            移動中でもストレスなく、次の予定がすぐわかります。
          </p>
          <div className="flex flex-col gap-3">
            {experiencePoints.map(({ icon: Icon, text }) => (
              <div className="flex items-center gap-2.5" key={text}>
                <Icon className="h-[18px] w-[18px] shrink-0 text-[#3D8A5A]" />
                <span className="font-semibold text-[14px] text-gray-900">{text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Voices Section */}
        <section className="flex flex-col gap-5 px-6 py-6">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-1 rounded-sm bg-[#3D8A5A]" />
            <h2 className="font-bold text-gray-900 text-xl tracking-tight">
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
                    <span className="font-semibold text-[14px] text-gray-900">{title}</span>
                    <span className="text-[12px] text-gray-500 leading-[1.5]">{desc}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        {/* Comparison Section */}
        <section className="flex flex-col gap-5 px-6 pt-6 pb-8">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-1 rounded-sm bg-[#3D8A5A]" />
            <h2 className="font-bold text-gray-900 text-xl tracking-tight">他サービスとの違い</h2>
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
              <span className="w-[60px] text-center font-bold text-white text-xs">Shiori</span>
            </div>
            {/* Table Rows */}
            {comparisonRows.map(({ label, app, web, shiori }, i) => (
              <div
                className={`flex h-10 items-center px-4 ${i < comparisonRows.length - 1 ? "border-[#E5E4E1] border-b" : ""}`}
                key={label}
              >
                <span className="flex-1 font-medium text-gray-900 text-xs">{label}</span>
                <div className="flex w-[70px] justify-center">
                  {app === "yes" ? (
                    <Check className="h-4 w-4 text-[#3D8A5A]" />
                  ) : app === "no" ? (
                    <X className="h-4 w-4 text-red-400" />
                  ) : (
                    <Minus className="h-4 w-4 text-gray-300" />
                  )}
                </div>
                <div className="flex w-[70px] justify-center">
                  {web === "yes" ? (
                    <Check className="h-4 w-4 text-[#3D8A5A]" />
                  ) : web === "no" ? (
                    <X className="h-4 w-4 text-red-400" />
                  ) : (
                    <Minus className="h-4 w-4 text-gray-300" />
                  )}
                </div>
                <div className="flex w-[60px] justify-center">
                  {shiori === "yes" ? (
                    <Check className="h-4 w-4 text-[#3D8A5A]" />
                  ) : (
                    <Minus className="h-4 w-4 text-gray-300" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="flex flex-col items-center gap-4 px-6 pt-4 pb-10">
          <Button
            asChild
            className="h-[52px] w-full gap-2 rounded-xl bg-[#3D8A5A] font-semibold text-base text-white shadow-[0_2px_8px_#3D8A5A30] hover:bg-[#2f6e47]"
          >
            <Link href="/create">
              <PenLine className="h-5 w-5" />
              しおりを作る
            </Link>
          </Button>
          <div className="flex items-center gap-1.5">
            <CircleCheck className="h-4 w-4 text-[#3D8A5A]" />
            <span className="font-semibold text-[#3D8A5A] text-sm">無料・登録不要ですぐ使える</span>
          </div>
        </div>
      </div>
    </div>
  );
}
