# Azure環境へのログイン認証機能のデプロイ（Azure Container Registry、Azure App Service、Terraform使用）

このIssueでは、ローカルのDocker環境で動作するログイン認証機能を、Azure環境にデプロイするための作業を行います。Terraformを使用してAzureインフラをコードで管理し、必要なリソースを自動的に構築・設定します。具体的には、以下のステップで進めます：

1. **TerraformでAzureリソースを構築**:
   - **Azure Container Registry (ACR)** をTerraformで作成し、コンテナイメージの格納と管理を行う。
   - **Azure App Service** をTerraformで構築し、コンテナのデプロイ環境を準備する。
   - 必要な **環境変数** や **リソース**（例えば、PostgreSQLの接続情報）をTerraformで設定。

2. **Azure Container Registryへのコンテナイメージのプッシュ**:
   - ローカル環境で作成したコンテナイメージを **Azure Container Registry (ACR)** にプッシュ。
   - Terraformで作成したACRを使ってイメージの格納と管理を行います。

3. **Azure App Serviceの設定**:
   - **Azure App Service** でコンテナをデプロイするための設定をTerraformで構成。
   - **ACR** から取得したコンテナイメージを **Azure App Service** で起動できるように構成。
   - Azure App Serviceに適切な環境変数（例えば、データベース接続情報や認証プロバイダー設定）を設定します。

4. **ログイン認証機能の動作確認**:
   - ローカル環境で正常に動作しているログイン認証機能がAzure環境でも正しく動作することを確認。
   - 必要に応じて、OAuthプロバイダー（Google、GitHubなど）やJWTセッションの動作確認。

5. **データベース接続の確認**:
   - **Azure環境**でのデータベース接続設定（PostgreSQLなど）を確認。
   - 必要に応じて、接続設定やスキーママイグレーションの実行。

6. **セキュリティとHTTPS対応**:
   - **Azure環境**での通信がHTTPSで行われるように設定。
   - 認証トークンのセキュアな取り扱いを確認。


### 目標:
- **Terraform** を使用して、Azure環境にログイン認証機能のためのインフラをコード化し、自動で構築・設定できるようにする。
- ローカル環境で動作するログイン認証機能を **Azure環境** にデプロイし、実際に **Azure App Service** で動作するようにする。
- **Azure Container Registry** にコンテナイメージをプッシュし、Azure App Serviceを通じてデプロイ、動作確認を行う。

---

Terraformを使用してAzureリソースの管理を行う手順を組み込み、インフラ構築の自動化を進めることができます。これにより、Azureのリソースをコード化して管理し、繰り返しのデプロイを効率化できます。