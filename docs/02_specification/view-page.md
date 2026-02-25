# 表示画面 詳細設計

> 対応デザイン: `designs/view-page.pen`
> ルーティング: `/i/[id]` → `app/i/[id]/page.tsx`

## タイムライン実装の注意

> ⚠️ **デザインファイル（.pen）のタイムライン構造をそのまま再現しない。**
>
> .penではTimeline Bar（左カラム）とCards Column（右カラム）が分離しており、
> 縦線・ドットに固定高さ（65px, 124px, 44px等）を指定してカードと位置合わせしている。
> この構造ではカード内のテキスト量が変わると縦位置がズレる。

### 推奨: CSS Gridで行単位に構成

```html
<ol class="timeline-grid" aria-label="1日目の行程">
  <li class="timeline-item" data-transport="car">
    <div class="timeline-marker" aria-hidden="true">●</div>
    <article class="timeline-card">
      <time datetime="10:00">10:00</time>
      <h3>那覇空港 到着</h3>
      <p>LCC利用。第2ターミナル</p>
    </article>
  </li>

  <li class="timeline-item">
    <div class="timeline-marker" aria-hidden="true">●</div>
    <article class="timeline-card">
      <time datetime="12:30">12:30</time>
      <h3>美ら海水族館</h3>
      <p>ジンベエザメを見る！入場券は事前購入済み。</p>
    </article>
  </li>
</ol>
```

- 左カラム（マーカー/接続線）と右カラム（カード）が**同じGrid行**にあるため、カード高さに自動追従する
- 接続線は `border-left` + 擬似要素で実装（固定heightを使わない）
- 交通手段アイコンは `data-transport` 属性 + `::after` 擬似要素で描画（`<li>` を増やさない）
