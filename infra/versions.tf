terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "4.23.0" # 現在使用しているバージョンを明示
    }
  }
  required_version = ">= 1.0.0"
} 