import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/features/common/Header";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description:
    "Tabijiのプライバシーポリシーです。収集する情報、利用目的、データの保管についてご説明します。",
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-6 w-1 rounded-sm bg-[#3D8A5A]" />
      <h2 className="font-[family-name:var(--font-outfit)] font-bold text-[#1A1918] text-xl tracking-tight">
        {children}
      </h2>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#F5F4F1]">
      <div className="mx-auto max-w-[480px]">
        <Header />

        <div className="flex flex-col gap-8 bg-white px-6 py-8">
          {/* タイトルブロック */}
          <div className="flex flex-col gap-2">
            <h1 className="font-[family-name:var(--font-outfit)] font-bold text-2xl text-[#1A1918] tracking-tight">
              プライバシーポリシー
            </h1>
            <p className="text-[#9C9B99] text-[13px]">制定日：2026年XX月XX日</p>
          </div>

          {/* イントロ */}
          <p className="text-justify text-[#6D6C6A] text-sm leading-[1.7]">
            Tabiji（以下「本サービス」）は、ユーザーのプライバシーを尊重し、個人情報の適切な取り扱いに努めます。
          </p>

          {/* 区切り線 */}
          <hr className="border-[#E5E4E1]" />

          {/* 第1条 収集する情報 */}
          <section className="flex flex-col gap-3">
            <SectionHeading>1. 収集する情報</SectionHeading>
            <p className="text-justify text-[#6D6C6A] text-sm leading-[1.7]">
              本サービスはアカウント登録を必要とせず、氏名・メールアドレス・電話番号などの個人を特定できる情報は収集しません。
            </p>
            <p className="text-justify text-[#6D6C6A] text-sm leading-[1.7]">
              しおり作成時にユーザーが入力した情報（タイトル・行程など）は、サービス提供のためにデータベースに保存されます。
            </p>
            <h3 className="font-[family-name:var(--font-outfit)] font-bold text-[#1A1918] text-base">
              アクセス解析
            </h3>
            <p className="text-justify text-[#6D6C6A] text-sm leading-[1.7]">
              本サービスでは、サービスの改善を目的としてアクセス解析ツール（Vercel Web
              Analytics）を使用しています。これにより、ページの閲覧状況や参照元などの情報が収集されますが、Cookieは使用せず、個人を特定する情報は収集しません。
            </p>
          </section>

          {/* 第2条 利用目的 */}
          <section className="flex flex-col gap-3">
            <SectionHeading>2. 利用目的</SectionHeading>
            <p className="text-justify text-[#6D6C6A] text-sm leading-[1.7]">
              収集した情報は、しおりの表示・編集機能の提供、およびサービスの品質改善のためにのみ使用します。
            </p>
          </section>

          {/* 第3条 データの保管 */}
          <section className="flex flex-col gap-3">
            <SectionHeading>3. データの保管</SectionHeading>
            <p className="text-justify text-[#6D6C6A] text-sm leading-[1.7]">
              データは外部のホスティングサービスおよびデータベースサービスに保管されます。保管先は海外のサーバーを含む場合があります。
            </p>
            <p className="text-justify text-[#6D6C6A] text-sm leading-[1.7]">
              しおりのURLを知っている人は誰でも内容を閲覧できます。住所・電話番号などの個人情報や、機密性の高い情報の記載はお控えください。
            </p>
          </section>

          {/* 第4条 第三者への提供 */}
          <section className="flex flex-col gap-3">
            <SectionHeading>4. 第三者への提供</SectionHeading>
            <p className="text-justify text-[#6D6C6A] text-sm leading-[1.7]">
              収集した情報は、法令に基づき開示が求められる場合を除き、第三者に提供しません。
            </p>
          </section>

          {/* 第5条 免責事項 */}
          <section className="flex flex-col gap-3">
            <SectionHeading>5. 免責事項</SectionHeading>
            <p className="text-justify text-[#6D6C6A] text-sm leading-[1.7]">
              ユーザーが自らしおりに入力した個人情報の漏洩について、運営者は責任を負いません。
            </p>
            <p className="text-justify text-[#6D6C6A] text-sm leading-[1.7]">
              その他の免責事項については
              <Link className="font-bold text-[#3D8A5A]" href="/terms">
                利用規約
              </Link>
              を参照してください。
            </p>
          </section>

          {/* 第6条 ポリシーの変更 */}
          <section className="flex flex-col gap-3">
            <SectionHeading>6. ポリシーの変更</SectionHeading>
            <p className="text-justify text-[#6D6C6A] text-sm leading-[1.7]">
              本ポリシーは予告なく変更する場合があります。変更後のポリシーは本ページに掲載した時点から効力を持ちます。
            </p>
          </section>

          {/* 第7条 お問い合わせ */}
          <section className="flex flex-col gap-3">
            <SectionHeading>7. お問い合わせ</SectionHeading>
            <p className="text-justify text-[#6D6C6A] text-sm leading-[1.7]">
              本ポリシーに関するお問い合わせは、公式X（Twitter）アカウントまでお願いします。
            </p>
            <p className="text-[#9C9B99] text-[13px]">※ アカウント準備中</p>
          </section>
        </div>
      </div>
    </main>
  );
}
