# データ項目

データベースに保存するデータの最小限の定義。詳細設計は実装時に決定する。

---

## しおりテーブル

### テーブル名
`shiori`

### カラム定義

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| `id` | UUID | PRIMARY KEY | 一意のID（URLに使用） |
| `title` | VARCHAR(255) | NOT NULL | しおりのタイトル |
| `overview` | JSON | NULL | 概要データ（配列） |
| `schedule` | JSON | NULL | 行程データ（配列） |
| `password_hash` | VARCHAR(255) | NULL | 合言葉のハッシュ値（bcrypt） |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | 作成日時 |
| `last_accessed_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | 最終アクセス日時 |

---

## JSONデータ構造

### overview（概要）

**型**: JSON配列

**構造**:
```json
[
  {
    "title": "旅費",
    "content": "1人あたり50,000円"
  },
  {
    "title": "持ち物",
    "content": "着替え、充電器、カメラ..."
  }
]
```

**項目**:
- `title` (String): 概要のタイトル
- `content` (String): 概要の内容

---

### schedule（行程）

**型**: JSON配列

**構造**:
```json
[
  {
    "date": "2025-03-15",
    "day_number": 1,
    "time": "08:00",
    "title": "東京駅集合",
    "transport": "train",
    "note": "8:30までに集合してください"
  },
  {
    "date": "2025-03-15",
    "day_number": 1,
    "time": "10:30",
    "title": "京都駅到着",
    "transport": "walk",
    "note": "改札を出て右手に進む"
  }
]
```

**項目**:
- `date` (String): 日付（ISO 8601形式: YYYY-MM-DD）
- `day_number` (Number, 任意): 日数（1日目、2日目など）
- `time` (String): 時刻（HH:MM形式）
- `title` (String): 場所名・イベント名
- `transport` (String): 交通手段
  - 選択肢: `walk`, `train`, `bus`, `plane`, `car`, `ship`, `bicycle`
- `note` (String, 任意): 補足情報

---

## インデックス

パフォーマンス向上のため、以下のインデックスを作成予定：

| カラム | 目的 |
|--------|------|
| `id` | PRIMARY KEY（自動作成） |
| `created_at` | ソート・検索用 |
| `last_accessed_at` | 自動削除処理用 |

---

## 制約・ルール

### バリデーション（実装時に詳細化）
- `title`: 必須、最大255文字
- `overview`: 任意、各項目の`title`と`content`は必須
- `schedule`: 任意、各項目の`date`, `time`, `title`, `transport`は必須
- `password_hash`: 任意、bcryptでハッシュ化（ソルトラウンド: 10）

### デフォルト値
- `created_at`: レコード作成時の現在時刻
- `last_accessed_at`: レコード作成時の現在時刻

### 更新ルール
- `last_accessed_at`: しおり表示時に毎回更新
- 自動削除: `last_accessed_at`が3ヶ月以上前のレコードを削除

---

## サンプルデータ

```sql
INSERT INTO shiori (id, title, overview, schedule, password_hash)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '沖縄旅行 2025年3月',
  '[
    {"title": "旅費", "content": "1人あたり50,000円"},
    {"title": "持ち物", "content": "水着、日焼け止め、サングラス"}
  ]'::json,
  '[
    {
      "date": "2025-03-15",
      "day_number": 1,
      "time": "08:00",
      "title": "那覇空港集合",
      "transport": "plane",
      "note": "8:30のフライトです"
    },
    {
      "date": "2025-03-15",
      "day_number": 1,
      "time": "11:00",
      "title": "ホテルチェックイン",
      "transport": "car",
      "note": "レンタカーで移動"
    }
  ]'::json,
  '$2b$10$abcdefghijklmnopqrstuvwxyz123456'
);
```

---

## 将来の拡張案

### Phase 2以降で検討
- `theme` (String): カラーテーマ選択
- `header_image` (String): ヘッダー画像URL
- `header_icon` (String): ヘッダーアイコンURL
- `photos` (JSON): 写真データ（Cloudflare R2のURL配列）

### 別テーブル化の検討
現在はすべてJSON形式で管理しているが、以下の場合は正規化を検討：
- 概要・行程の検索機能が必要になった場合
- データ量が大幅に増加した場合
- 集計・分析が必要になった場合

---

## 技術的考慮事項

### Neon Postgres (via Vercel統合)
- PostgreSQL 14/15/16/17互換
- 無料枠: 512MB、190時間/月のコンピュート時間、10データベース
- JSON型をネイティブサポート
- 注: 2024年Q4にVercel PostgresからNeon Postgresへ移行済み（無料枠は改善）

### ORM候補
- **Drizzle ORM**: 軽量、型安全、Next.jsとの相性良い
- **Prisma**: 多機能、マイグレーション管理が楽

実装時にどちらか選定。

---

## セキュリティ

### 合言葉のハッシュ化
- **アルゴリズム**: bcrypt
- **ソルトラウンド**: 10
- 平文では絶対に保存しない

### SQLインジェクション対策
- ORMを使用してプリペアドステートメントで実行
- ユーザー入力を直接SQLに埋め込まない

### XSS対策
- Reactの自動エスケープを活用
- `dangerouslySetInnerHTML`は使用しない
