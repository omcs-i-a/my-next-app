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
    # 4.23.0ではこの方法が正しい
    application_stack {
      docker_image_name = "${azurerm_container_registry.acr.login_server}/${var.docker_image_name}:latest"
    }
  }
}

# ACR PullロールをWeb Appに割り当て
resource "azurerm_role_assignment" "acr_pull" {
  scope = azurerm_container_registry.acr.id
  role_definition_name = "AcrPull"
  principal_id = azurerm_linux_web_app.webapp.identity[0].principal_id
}
