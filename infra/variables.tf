variable "location" {
  type    = string
  default = "japaneast"
}

variable "subscription_id" {
  type    = string
}

variable "tenant_id" {
  type    = string
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
