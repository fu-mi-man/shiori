## 概要

本ドキュメントは、サービスの**テーブル定義・インデックス・更新ルール**をまとめたものである。  
サービス概要は `01_overview.md`、画面仕様は `02_screens/` を参照のこと。

### 目次

1. [テーブル構成](#1-テーブル構成)
2. [テーブル定義](#2-テーブル定義)
3. [インデックス](#3-インデックス)
4. [更新ルール](#4-更新ルール)
5. [将来の拡張](#5-将来の拡張)


## 1. テーブル構成

```
shioris (しおり)
├── overviews (概要) 1対多
└── schedules (行程) 1対多

ai_generations (AI生成ログ)  ※実装中。shioris と緩い関連（FK は ON DELETE SET NULL）
```


## 2. テーブル定義

### 1. shioris（しおり）

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | UUID | PK | 一意のID（URLに使用） |
| title | VARCHAR(255) | NOT NULL | タイトル |
| passphrase | VARCHAR(255) | NULL | 合言葉（平文）。簡易ロック目的のためハッシュ化不要 |
| start_date | DATE | NULL | 旅行開始日（任意） |
| is_premium | BOOLEAN | NOT NULL, DEFAULT FALSE | 課金済みフラグ |
| last_accessed_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 最終アクセス日時 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 更新日時 |

### 2. overviews（概要）

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | SERIAL | PK | ID |
| shiori_id | UUID | FK → shioris.id, NOT NULL | しおりID |
| sort_order | INT | NOT NULL | 並び順 |
| title | VARCHAR(255) | NULL | タイトル |
| content | TEXT | NULL | 内容（最大500文字） |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 更新日時 |

### 3. schedules（行程）

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | SERIAL | PK | ID |
| shiori_id | UUID | FK → shioris.id, NOT NULL | しおりID |
| sort_order | INT | NOT NULL | 並び順 |
| date | DATE | NULL | 日付 |
| day_number | INT | NULL | 日数（1日目、2日目など） |
| time | TIME | NULL | 時刻 |
| title | VARCHAR(255) | NULL | 場所名・イベント名 |
| note | TEXT | NULL | 補足（最大200文字） |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 更新日時 |

> **設計方針**:
日付はすべて任意。
旅行開始日は `shioris.start_date` に保持し，`schedules.date` は `start_date` を基準に算出した値。
閲覧画面の日付範囲は `schedules.date` の MIN/MAX から算出する。スケジュールがない場合は `shioris.start_date` で表示する。
開始日と終了日が同じ（1日旅行）場合は単一日付で表示する。
>
> **リンク対応**: `note` および `overviews.content` 内のリンクは表示時に処理する。
Markdown記法（`[テキスト](URL)`）とURLの自動検出を併用。DB側の変更は不要。

### 4. ai_generations（AI生成ログ）※実装中

AI行程作成（`../02_specification/ai-plan-generation.md`）のレート制限・利用量記録・再生成条件の保持に使う。

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | SERIAL | PK | ID |
| ip_hash | VARCHAR(64) | NOT NULL | SHA-256(IP + salt)。生IPは保存しない |
| user_id | INT | NULL | Phase 2（ログイン導入）から使用 |
| shiori_id | UUID | FK → shioris.id ON DELETE SET NULL, NULL | 生成したしおり。再生成条件の復元と編集済み判定に使う |
| request | JSONB | NOT NULL | 入力条件（出発日・自由記述）。再生成で再利用 |
| model | VARCHAR(64) | NOT NULL | 使用モデル |
| input_tokens | INT | NOT NULL | 入力トークン数（コスト可視化） |
| output_tokens | INT | NOT NULL | 出力トークン数 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 生成日時（レート制限の日次集計に使用） |

しおりが自動削除されてもログは残す（利用量の記録が目的のため SET NULL）。


## 3. インデックス

| テーブル | カラム | 目的 |
|----------|--------|------|
| shioris | last_accessed_at | 自動削除処理 |
| overviews | (shiori_id, sort_order) | 外部キー検索 + 表示順ソート |
| schedules | (shiori_id, day_number, sort_order) | 外部キー検索 + 日程・表示順ソート |


## 4. 更新ルール

- **last_accessed_at**: しおり表示時に更新
- **自動削除**: `is_premium = FALSE` かつ最終アクセスから3ヶ月後に自動削除（関連する overviews / schedules も CASCADE で削除）


## 5. 将来の拡張

### カラム追加

| テーブル | カラム | 型 | 用途 |
|----------|--------|-----|------|
| shioris | theme | VARCHAR(50) | カラーテーマ |
| shioris | visibility | VARCHAR(50) | 公開範囲。`public`（制限なし）/ `private`（閲覧に合言葉が必要）。合言葉と組み合わせて使用 |
| schedules | transport | ENUM | 次のスポットへの移動手段（意味の定義は実装時に確定）。候補例: `walk` / `train` / `bus` / `plane` / `car` / `ship` / `bicycle` / `taxi` / `cablecar` |
| schedules | end_time | TIME | 終了時刻（滞在時間の表現） |

### 新規テーブル: photos（写真）

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | SERIAL | PK | ID |
| schedule_id | INT | FK → schedules.id, NOT NULL | 行程ID |
| url | TEXT | NOT NULL | ストレージURL |
| sort_order | INT | NOT NULL | 並び順 |
