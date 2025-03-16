**001-core-rules.mdc**

```mdc
# 001-core-rules.mdc

## プロジェクト概要

このプロジェクトは、生成AIや機械学習を活用した機能を統合し、ポートフォリオとして展示することを目的としています。以下の技術スタックを使用します。

```yaml
technologies:
  - name: Next.js
    version: 15.2.2
    description: フロントエンドフレームワークとして使用します。
  - name: Bun
    version: 最新
    description: 高速なJavaScript/TypeScriptランタイムとして使用します。
  - name: PostgreSQL
    version: 最新
    description: データベースとして使用します。
  - name: Docker
    version: 最新
    description: 開発環境のコンテナ化に使用します。
  - name: Azure Container Registry
    version: 最新
    description: コンテナイメージの格納と管理に使用します。
  - name: Azure App Service
    version: 最新
    description: アプリケーションのデプロイメントに使用します。
```

## 開発環境

- **Docker**: 開発環境の統一と依存関係の管理のため、Docker を使用します。プロジェクトルートに `Dockerfile` および `docker-compose.yml` を配置し、コンテナ内での開発を行います。

- **Bun**: 高速な JavaScript/TypeScript ランタイムである Bun を使用し、ビルドやテストの効率化を図ります。詳細な Docker 化の手順については、[Bun の公式ガイド](https://bun.sh/guides/ecosystem/docker)を参照してください。

## コンテナビルドとデプロイ

- **Azure Container Registry (ACR)**: コンテナイメージの格納と管理のために ACR を使用します。ACR に関するベストプラクティスについては、[Microsoft のドキュメント](https://docs.microsoft.com/ja-jp/azure/container-registry/container-registry-best-practices)を参照してください。

- **デプロイメント**: ACR に格納したコンテナイメージを Azure App Service にデプロイします。デプロイ時には、以下の設定を行います。

  - **Node.js バージョン**: 18.x
  - **ポート番号**: アプリケーションはポート 3000 をリッスンします。
  - **スタートアップコマンド**: `bun run start` を使用してアプリケーションを起動します。

## データベース接続

- **PostgreSQL**: データベース接続情報は環境変数を通じて管理し、セキュリティを確保します。ACR 上でのデータベース接続設定については、[Azure のドキュメント](https://docs.microsoft.com/ja-jp/azure/container-registry/container-registry-tasks-overview)を参照してください。

## セキュリティ

- **環境変数の管理**: 機密情報や設定値は、環境変数として管理し、コードベースから分離します。`.env` ファイルは `.gitignore` に追加し、バージョン管理から除外します。

- **HTTPS の使用**: 開発環境および本番環境ともに HTTPS を使用し、通信のセキュリティを確保します。

## CI/CD

- **GitHub Actions**: ソースコードのプッシュやプルリクエスト時に、自動的にビルド・テスト・デプロイが行われるように GitHub Actions を設定します。Azure へのデプロイは、Azure CLI を用いて行います。

## テスト

- **Bun Test**: テストフレームワークとして Bun Test を使用します。詳細な設定や使用方法については、[Bun の公式ガイド](https://bun.sh/guides/ecosystem/docker)を参照してください。

```

```

**002-coding-standards.mdc**

```mdc
# 002-coding-standards.mdc

## コーディングスタイル

```yaml
coding_style:
  indent_size: 2
  semicolons: always
  quotes: single
  variable_declaration: 
    - const
    - let
  function_definition: arrow
```

## 命名規則

```yaml
naming_conventions:
  file_names: snake_case
  function_and_variable_names: camelCase
  class_names: PascalCase
```

## コメント

```yaml
comments:
  function_comments: true
  todo_comments: true
```

## エラーハンドリング

```yaml
error_handling:
  use_try_catch: true
  log_errors: true
```

## フォーマット

```yaml
formatting:
  code_formatter: Prettier
  linter: ESLint
```

## テスト

```yaml
testing:
  framework: Bun Test
  coverage_target: 80
```

## デバッグ

```yaml
debugging:
  tools: Visual Studio Code
  console_logs: remove_before_release
```

```




これらの設定をプロジェクトに導入することで、技術スタックの明確化、コーディングスタイルの統一、開発プロセスの効率化が期待できます。 