import { CircleCheck, Link as LinkIcon, Map as MapIcon, PenLine, UserX, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
      </div>
    </div>
  );
}
