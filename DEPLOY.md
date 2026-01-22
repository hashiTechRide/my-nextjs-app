# Vercel デプロイ手順

このドキュメントでは、ダイエット管理アプリをVercelにデプロイする手順を説明します。

## 前提条件

- GitHubアカウント
- Vercelアカウント（https://vercel.com）
- PostgreSQLデータベース（以下のいずれか）
  - [Neon](https://neon.tech) - 無料枠あり（推奨）
  - [Supabase](https://supabase.com) - 無料枠あり
  - [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
  - その他のPostgreSQLプロバイダー

## 手順

### 1. データベースの準備

#### Neonを使用する場合（推奨）

1. [Neon](https://neon.tech)にアクセスしてアカウント作成
2. 新しいプロジェクトを作成
3. 「Connection Details」から接続文字列をコピー
   ```
   postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

#### Supabaseを使用する場合

1. [Supabase](https://supabase.com)にアクセスしてアカウント作成
2. 新しいプロジェクトを作成
3. 「Settings」→「Database」→「Connection string」→「URI」をコピー
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```

### 2. GitHubリポジトリの準備

1. このプロジェクトをGitHubにプッシュ
   ```bash
   git remote add origin https://github.com/your-username/your-repo.git
   git push -u origin main
   ```

### 3. Vercelでのデプロイ

1. [Vercel](https://vercel.com)にログイン

2. 「Add New...」→「Project」をクリック

3. GitHubリポジトリをインポート
   - 「Import Git Repository」でリポジトリを選択

4. プロジェクト設定
   - **Framework Preset**: Next.js（自動検出）
   - **Root Directory**: ./（デフォルト）
   - **Build Command**: `npm run build`（デフォルト）
   - **Output Directory**: `.next`（デフォルト）

5. 環境変数の設定
   - 「Environment Variables」セクションで以下を追加：

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | `postgresql://...（手順1でコピーした接続文字列）` |

6. 「Deploy」をクリック

### 4. データベースマイグレーション

デプロイ後、データベーススキーマを適用します。

#### 方法A: Vercel CLIを使用

```bash
# Vercel CLIをインストール
npm i -g vercel

# ログイン
vercel login

# 環境変数をローカルに取得
vercel env pull .env.local

# マイグレーション実行
npx prisma db push
```

#### 方法B: ローカルから直接実行

1. `.env`ファイルに本番データベースの接続文字列を設定
   ```
   DATABASE_URL="postgresql://...（本番の接続文字列）"
   ```

2. マイグレーション実行
   ```bash
   npx prisma db push
   ```

### 5. 動作確認

1. Vercelダッシュボードで表示されるURLにアクセス
2. 食事や運動の登録ができることを確認
3. 統計ページでグラフが表示されることを確認

## 再デプロイ

コードを更新した場合：

```bash
git add .
git commit -m "変更内容"
git push origin main
```

GitHubにプッシュすると、Vercelが自動的に再デプロイします。

## トラブルシューティング

### ビルドエラー: Prisma Client generation failed

**原因**: Prisma Clientが生成されていない

**解決策**: `package.json`の`postinstall`スクリプトが設定されていることを確認
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

### データベース接続エラー

**原因**: DATABASE_URLが正しく設定されていない

**解決策**:
1. Vercelダッシュボード →「Settings」→「Environment Variables」
2. `DATABASE_URL`の値を確認
3. 接続文字列に`?sslmode=require`が含まれていることを確認

### 500エラー（Internal Server Error）

**原因**: データベーススキーマが適用されていない

**解決策**: マイグレーションを実行
```bash
npx prisma db push
```

## 環境変数一覧

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `DATABASE_URL` | PostgreSQL接続文字列 | Yes |

## 関連リンク

- [Vercel Documentation](https://vercel.com/docs)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
