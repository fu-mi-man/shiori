# データ定義

## テーブル構成

```
shioris (しおり)
├── overviews (概要) 1対多
└── schedules (行程) 1対多
```



## shioris（しおり）

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | UUID | PK | 一意のID（URLに使用） |
| title | VARCHAR(255) | NOT NULL | タイトル |
| password_hash | VARCHAR(255) | NULL | 合言葉のハッシュ（bcrypt） |
| is_premium | BOOLEAN | NOT NULL, DEFAULT FALSE | 課金済みフラグ |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 作成日時 |
| last_accessed_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 最終アクセス日時 |



## overviews（概要）

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | SERIAL | PK | ID |
| shiori_id | UUID | FK → shioris.id, NOT NULL | しおりID |
| sort_order | INT | NOT NULL | 並び順 |
| title | VARCHAR(255) | NULL | タイトル |
| content | TEXT | NULL | 内容 |



## schedules（行程）

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
| note | TEXT | NULL | 補足 |

**transport（交通手段）の選択肢**:
`walk` / `train` / `bus` / `plane` / `car` / `ship` / `bicycle` / `taxi` / `cablecar`



## インデックス

| テーブル | カラム | 目的 |
|----------|--------|------|
| shioris | last_accessed_at | 自動削除処理 |
| overviews | shiori_id | 外部キー検索 |
| schedules | shiori_id | 外部キー検索 |



## 更新ルール

- **last_accessed_at**: しおり表示時に更新
- **自動削除**: `is_premium = FALSE` かつ `last_accessed_at` が3ヶ月以上前のレコードを削除（関連する overviews / schedules も CASCADE で削除）



## Phase 2以降の拡張

| Phase | テーブル/カラム | 用途 |
|-------|----------------|------|
| 2 | shioris.theme | カラーテーマ |
| 2 | shioris.header_icon | ヘッダーアイコン |
| 2 | posts（新規テーブル） | フィードバック掲示板 |
| 3 | photos（新規テーブル） | 写真（schedule_idで紐づけ） |
