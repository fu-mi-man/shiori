## 概要

本ドキュメントは、Shioriの**テーブル定義・インデックス・更新ルール**をまとめたものである。
機能要件は `02_features.md`、画面仕様は `03_screens.md` を参照のこと。

### 目次

1. [テーブル構成](#1-テーブル構成)
2. [テーブル定義](#2-テーブル定義)
3. [インデックス](#3-インデックス)
4. [更新ルール](#4-更新ルール)
5. [Phase 2以降の拡張](#5-phase-2以降の拡張)


## 1. テーブル構成

```
shioris (しおり)
├── overviews (概要) 1対多
└── schedules (行程) 1対多
```


## 2. テーブル定義

### 1. shioris（しおり）

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | UUID | PK | 一意のID（URLに使用） |
| title | VARCHAR(255) | NOT NULL | タイトル |
| passphrase | VARCHAR(255) | NULL | 合言葉（平文）。簡易ロック目的のためハッシュ化不要 |
| is_premium | BOOLEAN | NOT NULL, DEFAULT FALSE | 課金済みフラグ |
| last_accessed_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 最終アクセス日時 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新日時 |

### 2. overviews（概要）

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | SERIAL | PK | ID |
| shiori_id | UUID | FK → shioris.id, NOT NULL | しおりID |
| sort_order | INT | NOT NULL | 並び順 |
| title | VARCHAR(255) | NULL | タイトル |
| content | TEXT | NULL | 内容（最大500文字） |

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
| transport | VARCHAR(50) | NULL | 交通手段 |
| note | TEXT | NULL | 補足（最大200文字） |

**transport（交通手段）の選択肢**:
`walk` / `train` / `bus` / `plane` / `car` / `ship` / `bicycle` / `taxi` / `cablecar`

> **設計方針**: 日付はすべて任意。表示画面の日付範囲（`YYYY/MM/DD 〜 YYYY/MM/DD`）は `date` の MIN/MAX から動的算出する。日付が1件も設定されていない場合は非表示。`shioris` テーブルに冗長に持たない。


## 3. インデックス

| テーブル | カラム | 目的 |
|----------|--------|------|
| shioris | last_accessed_at | 自動削除処理 |
| overviews | shiori_id | 外部キー検索 |
| schedules | shiori_id | 外部キー検索 |


## 4. 更新ルール

- **last_accessed_at**: しおり表示時に更新
- **自動削除**: `is_premium = FALSE` かつ最終アクセスから3ヶ月後に自動削除（関連する overviews / schedules も CASCADE で削除）


## 5. Phase 2以降の拡張

### 1. カラム追加

| Phase | テーブル | カラム | 型 | 用途 |
|-------|----------|--------|-----|------|
| 2 | shioris | theme | VARCHAR(50) | カラーテーマ |
| 2 | shioris | header_icon | VARCHAR(100) | ヘッダーアイコン |
| 2 | shioris | locale | VARCHAR(10) | 作成言語（`ja` / `en`） |

### 2. 新規テーブル（Phase 2）: posts（フィードバック掲示板）

```
posts (投稿)
└── posts (コメント) 1対多 ※parent_idで自己参照
```

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | SERIAL | PK | ID |
| parent_id | INT | FK → posts.id, NULL | 親投稿ID（NULLならスレッド、値ありならコメント） |
| title | VARCHAR(255) | NULL | タイトル（スレッドのみ） |
| content | TEXT | NOT NULL | 内容 |
| locale | VARCHAR(10) | NOT NULL, DEFAULT 'ja' | 投稿言語（`ja` / `en`） |
| vote_count | INT | NOT NULL, DEFAULT 0 | 賛成数 |
| ip_hash | VARCHAR(255) | NOT NULL | 投稿者IPのハッシュ（レートリミット用） |
| is_hidden | BOOLEAN | NOT NULL, DEFAULT FALSE | モデレーションで非表示 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 投稿日時 |

### 3. 新規テーブル（Phase 3）: photos（写真）

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | SERIAL | PK | ID |
| schedule_id | INT | FK → schedules.id, NOT NULL | 行程ID |
| url | TEXT | NOT NULL | Cloudflare R2のURL |
| sort_order | INT | NOT NULL | 並び順 |
