# データベースセットアップガイド

このアプリケーションはPostgreSQLデータベースを使用してデータを永続化します。

## セットアップ手順

### 1. PostgreSQLの起動

Dockerを使用してPostgreSQLを起動します：

```bash
cd docker
docker compose up -d postgres
```

### 2. データベースマイグレーションの実行

Prismaを使用してデータベーススキーマを作成します：

```bash
# Prismaクライアントの生成
pnpm db:generate

# データベースにスキーマを適用
pnpm db:push
```

または、マイグレーションファイルを作成する場合：

```bash
pnpm db:migrate
```

### 3. アプリケーションの起動

```bash
pnpm dev
```

アプリケーションは http://localhost:3000 で起動します。

## データベース接続情報

デフォルトの接続情報：
- ホスト: localhost
- ポート: 5432
- データベース名: dietapp
- ユーザー名: dietapp
- パスワード: dietapp123

`.env`ファイルに以下の環境変数が設定されています：

```
DATABASE_URL="postgresql://dietapp:dietapp123@localhost:5432/dietapp"
```

## 便利なコマンド

### Prisma Studio（データベースGUI）

データベースの内容を視覚的に確認・編集できます：

```bash
pnpm db:studio
```

### データベースのリセット

開発中にデータベースをリセットしたい場合：

```bash
# Dockerコンテナを停止して削除
cd docker
docker compose down -v

# 再度起動
docker compose up -d postgres

# マイグレーションを再実行
cd ..
pnpm db:push
```

## トラブルシューティング

### Dockerが利用できない場合

ローカルにPostgreSQLをインストールして実行することもできます。
その場合、`.env`ファイルの`DATABASE_URL`を適切に変更してください。

### マイグレーションエラー

Prismaのバイナリダウンロードでエラーが発生する場合：

```bash
# チェックサムの検証をスキップ
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 pnpm db:push
```

### 接続エラー

PostgreSQLコンテナが起動しているか確認：

```bash
cd docker
docker compose ps
```

ログを確認：

```bash
docker compose logs postgres
```

## データモデル

### Meal（食事）
- id: ユニークID
- date: 日付（yyyy-MM-dd）
- type: 食事の種類（breakfast/lunch/dinner/snack）
- name: 食事名
- calories: カロリー（kcal）
- protein: タンパク質（g）
- carbs: 炭水化物（g）
- fat: 脂質（g）

### Exercise（運動）
- id: ユニークID
- date: 日付（yyyy-MM-dd）
- name: 運動名
- duration: 時間（分）
- caloriesBurned: 消費カロリー（kcal）
- type: 運動の種類（cardio/strength/flexibility/other）
