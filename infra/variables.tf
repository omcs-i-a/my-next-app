variable "location" {
  type    = string
  default = "japaneast"
}

variable "subscription_id" {
  type = string
}

variable "tenant_id" {
  type = string
}

variable "resource_group_name" {
  type    = string
  default = "my-nextapp-rg"
}

variable "acr_name" {
  type    = string
  default = "mynextappacr"
}

variable "service_plan_name" {
  type    = string
  default = "my-nextapp-plan"
}

variable "webapp_name" {
  type    = string
  default = "my-nextapp-web"
}

variable "docker_image_name" {
  type    = string
  default = "my-next-app"
}

# PostgreSQL設定
variable "db_server_name" {
  type    = string
  default = "my-nextapp-db-server"
}

variable "db_admin_username" {
  type    = string
  default = "postgres"
}

variable "db_admin_password" {
  type      = string
  sensitive = true
}

variable "dev_ip_address" {
  type        = string
  description = "開発環境のIPアドレス"
}

# NextAuth設定
variable "nextauth_secret" {
  type      = string
  sensitive = true
}

variable "github_id" {
  type      = string
  sensitive = true
}

variable "github_secret" {
  type      = string
  sensitive = true
}

variable "google_client_id" {
  type      = string
  sensitive = true
}

variable "google_client_secret" {
  type      = string
  sensitive = true
}

# OpenAI設定
variable "openai_api_key" {
  type        = string
  sensitive   = true
  description = "OpenAI APIキー"
}

variable "openai_api_url" {
  type        = string
  default     = "https://api.openai.com/v1"
  description = "OpenAI APIのURL"
}

variable "openai_api_model" {
  type        = string
  default     = "gpt-4o"
  description = "使用するOpenAIのモデル"
}
