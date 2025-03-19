# AI統合型データ分析・管理ポートフォリオ

このプロジェクトは、最新のWeb技術、クラウドインフラ、生成AI、データサイエンス技術を統合した包括的なポートフォリオアプリケーションです。Next.js 15をベースに構築され、生成AIを活用したチャット機能、データベース管理機能、クラウドデプロイメントなどの機能を提供します。

## 主な機能

- **認証システム**: NextAuth.jsによるマルチプロバイダー認証（Email/Password, Google, GitHub）
- **生成AI対話**: OpenAIのAPIを使用したインテリジェントな会話機能
- **データ分析ダッシュボード**: データの可視化と分析
- **管理パネル**: データベーステーブルの閲覧・管理機能
- **クラウドデプロイメント**: Azure上でのコンテナ化されたデプロイメント

## プロジェクト構造

```
.
├── src/                    # ソースコード
│   ├── app/                # Next.js App Router
│   │   ├── api/            # APIエンドポイント
│   │   ├── admin/          # 管理パネル
│   │   ├── auth/           # 認証関連ページ
│   │   └── chat/           # チャットアプリケーション
│   ├── components/         # 共通コンポーネント
│   ├── lib/                # ユーティリティとヘルパー
│   └── types/              # TypeScript型定義
├── prisma/                 # Prismaスキーマとマイグレーション
├── public/                 # 静的アセット
├── infra/                  # Terraformスクリプト
├── docs/                   # プロジェクトドキュメント
├── docker-compose.yml      # 開発環境設定
├── Dockerfile.dev          # 開発環境ビルド用
└── Dockerfile              # 本番ビルド用
```

## アプリケーション使用フロー

```mermaid
graph TD
    A[ホームページ] -->|ログイン| B{認証方法選択}
    A -->|管理パネルへ| J[管理者ログイン画面]
    
    subgraph "認証フロー"
        B -->|メール/パスワード| C[認証情報入力]
        B -->|GitHub| D[GitHubログイン]
        B -->|Google| E[Googleログイン]
        C -->|認証成功| F[ユーザーダッシュボード]
        D -->|認証成功| F
        E -->|認証成功| F
    end

    subgraph "ユーザーフロー"
        F -->|チャット開始| G[AI対話セッション]
        G -->|質問入力| H[OpenAI API呼び出し]
        H -->|回答生成| G
    end

    subgraph "管理者フロー"
        J -->|認証| K[管理パネル]
        K -->|テーブル一覧表示| L[データベーステーブル]
        L -->|テーブル名クリック| M[テーブルレコード詳細]
    end
```

## 技術スタック

### フロントエンド
- **Next.js 15**: App Routerによる最新のReactフレームワーク
- **React 19**: コンポーネントベースUI
- **TypeScript**: 型安全なコーディング
- **TailwindCSS**: モダンなスタイリング

### バックエンド
- **Next.js API Routes**: RESTful APIエンドポイント
- **Prisma ORM**: タイプセーフなデータベースアクセス
- **PostgreSQL**: リレーショナルデータベース
- **NextAuth.js**: 認証フレームワーク

### AI / データサイエンス
- **OpenAI API**: GPT-4等のLLMを使用した生成AI機能
- **数理最適化アルゴリズム**: データ処理と分析
- **機械学習モデル**: 需要予測 
- **データ可視化**: インタラクティブなチャートとグラフ

### インフラストラクチャ
- **Docker**: アプリケーションのコンテナ化
- **Terraform**: インフラストラクチャのコード化（IaC）
- **Azure**: クラウドデプロイメント
  - Container Registry
  - App Service
  - PostgreSQL Flexible Server

## ローカル開発環境のセットアップ

### 前提条件
- Docker と Docker Compose
- Node.js 18以上
- npm または yarn
- Git

### 手順

1. リポジトリのクローン
```bash
git clone https://github.com/yourusername/your-portfolio-app.git
cd your-portfolio-app
```

2. 環境変数の設定
`.env.local`ファイルを作成し、必要な環境変数を設定:
```
# NextAuth設定
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# データベース接続
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nextauth"

# OAuth設定
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OpenAI設定
OPENAI_API_KEY=your-openai-api-key

# 管理者認証情報
ADMIN_EMAIL=test_omc@gmail.com
ADMIN_PASSWORD=test_omc_Pass
```

3. Docker Composeでの起動
```bash
docker-compose up -d
```
これにより、アプリケーションとPostgreSQLデータベースが起動します。

4. マイグレーションの実行
```bash
docker compose exec app npx prisma migrate dev
```

5. アプリケーションにアクセス
ブラウザで [http://localhost:3000](http://localhost:3000) にアクセス

### 管理パネルへのアクセス
[http://localhost:3000/admin](http://localhost:3000/admin) にアクセスし、設定した管理者認証情報でログインします。

## Azureへのデプロイ

プロジェクトには、Azure環境へのデプロイに必要なTerraformスクリプトが含まれています。infraディレクトリのmain.tf、variables.tf、terraform.tfvarsを適宜作成・編集してください。

```bash
cd infra
terraform init
terraform plan
terraform apply
```


