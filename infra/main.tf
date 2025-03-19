provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
  tenant_id       = var.tenant_id
}

# リソースグループ
resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location
}

# ACR (admin_enabled = false 推奨, マネージドIDでpull)
resource "azurerm_container_registry" "acr" {
  name                = var.acr_name
  resource_group_name = azurerm_resource_group.rg.name
  location            = var.location
  sku                 = "Basic"
  admin_enabled       = false
}

# Service Plan (Linux)
resource "azurerm_service_plan" "asp" {
  name                = var.service_plan_name
  location            = var.location
  resource_group_name = var.resource_group_name
  sku_name            = "B1"
  os_type             = "Linux"
}

# PostgreSQL サーバー
resource "azurerm_postgresql_flexible_server" "db" {
  name                   = var.db_server_name
  resource_group_name    = azurerm_resource_group.rg.name
  location               = var.location
  version                = "15"
  administrator_login    = var.db_admin_username
  administrator_password = var.db_admin_password
  storage_mb             = 32768
  sku_name               = "B_Standard_B1ms"
  backup_retention_days  = 7
  zone                   = "1"

  # パブリックアクセスを許可
  delegated_subnet_id = null
  private_dns_zone_id = null
}

# PostgreSQL データベース
resource "azurerm_postgresql_flexible_server_database" "nextauth_db" {
  name      = "nextauth"
  server_id = azurerm_postgresql_flexible_server.db.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

# ファイアウォールルール - Azure サービスへのアクセスを許可
resource "azurerm_postgresql_flexible_server_firewall_rule" "azure_services" {
  name             = "AllowAzureServices"
  server_id        = azurerm_postgresql_flexible_server.db.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# ファイアウォールルール - 開発環境からのアクセスを許可
resource "azurerm_postgresql_flexible_server_firewall_rule" "dev_access" {
  name             = "DevEnvironment"
  server_id        = azurerm_postgresql_flexible_server.db.id
  start_ip_address = var.dev_ip_address
  end_ip_address   = var.dev_ip_address
}

# PostgreSQL の SSL を無効化 (開発環境用、本番環境では適切に設定すること)
resource "azurerm_postgresql_flexible_server_configuration" "require_secure_transport" {
  name      = "require_secure_transport"
  server_id = azurerm_postgresql_flexible_server.db.id
  value     = "off"
}

# Linux Web App (Docker)
resource "azurerm_linux_web_app" "webapp" {
  name                = var.webapp_name
  location            = var.location
  resource_group_name = var.resource_group_name
  service_plan_id     = azurerm_service_plan.asp.id

  # システム割り当てマネージドIDを有効化
  identity {
    type = "SystemAssigned"
  }

  # コンテナイメージ指定
  site_config {
    container_registry_use_managed_identity = true
    application_stack {
      docker_image_name = "${azurerm_container_registry.acr.login_server}/${var.docker_image_name}:latest"
    }

    # 追加のサイト設定
    always_on                         = true
    ftps_state                        = "Disabled"
    health_check_path                 = "/"
    health_check_eviction_time_in_min = 5
  }

  # アプリケーション設定（環境変数）
  app_settings = {
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false"
    "NEXTAUTH_URL"                        = "https://${var.webapp_name}.azurewebsites.net"
    "NEXTAUTH_SECRET"                     = var.nextauth_secret
    "DATABASE_URL"                        = "postgresql://${var.db_admin_username}:${urlencode(var.db_admin_password)}@${azurerm_postgresql_flexible_server.db.fqdn}:5432/nextauth?sslmode=disable"
    "GITHUB_ID"                           = var.github_id
    "GITHUB_SECRET"                       = var.github_secret
    "GOOGLE_CLIENT_ID"                    = var.google_client_id
    "GOOGLE_CLIENT_SECRET"                = var.google_client_secret
    "NODE_ENV"                            = "production"
    # OpenAI設定
    "OPENAI_API_KEY"                      = var.openai_api_key
    "OPENAI_API_URL"                      = var.openai_api_url
    "OPENAI_API_MODEL"                    = var.openai_api_model
  }
}

# ACR PullロールをWeb Appに割り当て
resource "azurerm_role_assignment" "acr_pull" {
  scope                = azurerm_container_registry.acr.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_linux_web_app.webapp.identity[0].principal_id
}
