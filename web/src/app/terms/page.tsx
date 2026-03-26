import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/features/common/Header";

export const metadata: Metadata = {
  title: "利用規約",
  description: "Tabijiの利用規約です。サービスの利用条件、禁止事項、免責事項などをご確認ください。",
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

function BulletItem({ children }: { children: React.ReactNode }) {
  return <p className="text-[#6D6C6A] text-sm leading-[1.6]">・ {children}</p>;
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#F5F4F1]">
      <div className="mx-auto max-w-[480px]">
        <Header />

        <div className="flex flex-col gap-8 bg-white px-6 py-8">
          {/* タイトルブロック */}
          <div className="flex flex-col gap-2">
            <h1 className="font-[family-name:var(--font-outfit)] font-bold text-2xl text-[#1A1918] tracking-tight">
              利用規約
            </h1>
            <p className="text-[#9C9B99] text-[13px]">制定日：2026年XX月XX日</p>
          </div>

          {/* 区切り線 */}
          <hr className="border-[#E5E4E1]" />

          {/* 第1条 本規約について */}
          <section className="flex flex-col gap-3">
            <SectionHeading>1. 本規約について</SectionHeading>
            <p className="text-justify text-[#6D6C6A] text-sm leading-[1.7]">
              本規約は、Tabiji（以下「本サービス」）の利用に関する条件を定めるものです。本サービスを利用した時点で、本規約に同意したものとみなします。
            </p>
            <p className="text-justify text-[#6D6C6A] text-sm leading-[1.7]">
              未成年者が本サービスを利用する場合は、法定代理人（親権者等）の同意を得た上でご利用ください。本サービスを利用した時点で、法定代理人の同意を得ているものとみなします。
            </p>
          </section>

          {/* 第2条 サービスの内容 */}
          <section className="flex flex-col gap-3">
            <SectionHeading>2. サービスの内容</SectionHeading>
            <p className="text-justify text-[#6D6C6A] text-sm leading-[1.7]">
              本サービスは、旅行のしおり（行程表）を作成・共有できるWebサービスです。アカウント登録不要で利用できます。
            </p>
            <p className="text-justify text-[#6D6C6A] text-sm leading-[1.7]">
              作成したしおりには一意のURLが発行されます。URLを知っている人は誰でもしおりの内容を閲覧できます。住所・電話番号などの個人情報や、機密性の高い情報の記載はお控えください。
            </p>
          </section>

          {/* 第3条 禁止事項 */}
          <section className="flex flex-col gap-3">
            <SectionHeading>3. 禁止事項</SectionHeading>
            <p className="text-justify text-[#6D6C6A] text-sm leading-[1.7]">
              以下の行為を禁止します。
            </p>
            <div className="flex flex-col gap-2">
              <BulletItem>法令または公序良俗に違反する内容の投稿</BulletItem>
              <BulletItem>他者の権利を侵害する内容の投稿</BulletItem>
              <BulletItem>虚偽の情報を故意に投稿する行為</BulletItem>
              <BulletItem>サービスの運営を妨害する行為</BulletItem>
              <BulletItem>不正アクセスやサーバーに過度な負荷をかける行為</BulletItem>
              <BulletItem>本サービスのデータを無断でスクレイピング・転用する行為</BulletItem>
            </div>
          </section>

          {/* 第4条 知的財産権 */}
          <section className="flex flex-col gap-3">
            <SectionHeading>4. 知的財産権</SectionHeading>
            <div className="flex flex-col gap-2">
              <BulletItem>
                本サービスに関する知的財産権（UI、デザイン、ロゴ等）は運営者に帰属します
              </BulletItem>
              <BulletItem>
                ユーザーが本サービスに投稿したコンテンツの著作権は、ユーザーに帰属します
              </BulletItem>
              <BulletItem>
                ユーザーは、投稿したコンテンツについて、本サービスの提供・改善に必要な範囲で運営者が利用（複製、表示、配信等）することを許諾するものとします
              </BulletItem>
            </div>
          </section>

          {/* 第5条 データの取り扱い */}
          <section className="flex flex-col gap-3">
            <SectionHeading>5. データの取り扱い</SectionHeading>
            <div className="flex flex-col gap-2">
              <BulletItem>
                作成したしおりは一定期間（最終アクセスから3ヶ月）経過後に、事前の通知なく削除される場合があります
              </BulletItem>
              <BulletItem>データの永続的な保存は保証しません</BulletItem>
              <BulletItem>
                詳細は
                <Link className="font-medium text-[#3D8A5A]" href="/privacy">
                  プライバシーポリシー
                </Link>
                を参照してください
              </BulletItem>
            </div>
          </section>

          {/* 第6条 広告について */}
          <section className="flex flex-col gap-3">
            <SectionHeading>6. 広告について</SectionHeading>
            <p className="text-justify text-[#6D6C6A] text-sm leading-[1.7]">
              本サービスには、運営者または第三者の広告が掲載される場合があります。広告の内容に関する責任は広告主に帰属し、運営者は広告の内容について責任を負いません。
            </p>
          </section>

          {/* 第7条 免責事項 */}
          <section className="flex flex-col gap-3">
            <SectionHeading>7. 免責事項</SectionHeading>
            <div className="flex flex-col gap-2">
              <BulletItem>
                本サービスは現状有姿（as-is）で提供されます。運営者は、本サービスの正確性、完全性、信頼性、特定目的への適合性について、いかなる保証も行いません
              </BulletItem>
              <BulletItem>
                運営者の故意または重過失による場合を除き、本サービスの利用により生じた損害について、運営者は責任を負いません
              </BulletItem>
              <BulletItem>
                運営者は、本サービスに保存されたデータの消失・破損について責任を負いません
              </BulletItem>
              <BulletItem>
                ユーザーと第三者との間で生じた紛争について、運営者は責任を負いません
              </BulletItem>
            </div>
          </section>

          {/* 第8条 サービスの変更・終了 */}
          <section className="flex flex-col gap-3">
            <SectionHeading>8. サービスの変更・終了</SectionHeading>
            <div className="flex flex-col gap-2">
              <BulletItem>運営者は、本サービスの内容を予告なく変更する場合があります</BulletItem>
              <BulletItem>
                運営者は、本サービス上での告知をもって、本サービスの全部または一部を終了できるものとします
              </BulletItem>
              <BulletItem>
                やむを得ない事由がある場合は、事前の告知なくサービスを終了する場合があります
              </BulletItem>
              <BulletItem>
                サービスの変更・終了に伴いユーザーに生じた損害について、運営者の故意または重過失による場合を除き、運営者は責任を負いません
              </BulletItem>
            </div>
          </section>

          {/* 第9条 規約の変更 */}
          <section className="flex flex-col gap-3">
            <SectionHeading>9. 規約の変更</SectionHeading>
            <p className="text-justify text-[#6D6C6A] text-sm leading-[1.7]">
              本規約は予告なく変更する場合があります。変更後の規約は本ページに掲載した時点から効力を持ちます。
            </p>
          </section>

          {/* 第10条 準拠法・管轄裁判所 */}
          <section className="flex flex-col gap-3">
            <SectionHeading>10. 準拠法・管轄裁判所</SectionHeading>
            <p className="text-justify text-[#6D6C6A] text-sm leading-[1.7]">
              本規約の解釈及び適用は、日本法に準拠するものとします。本サービスに関する一切の紛争については、大阪地方裁判所を第一審の専属的合意管轄裁判所とします。
            </p>
          </section>

          {/* 第11条 お問い合わせ */}
          <section className="flex flex-col gap-3">
            <SectionHeading>11. お問い合わせ</SectionHeading>
            <p className="text-justify text-[#6D6C6A] text-sm leading-[1.7]">
              本規約に関するお問い合わせは、公式X（Twitter）アカウントまでお願いします。
            </p>
            <p className="text-[#9C9B99] text-[13px]">※ アカウント準備中</p>
          </section>
        </div>
      </div>
    </main>
  );
}
