# VPC Outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "vpc_cidr_block" {
  description = "CIDR block of the VPC"
  value       = module.vpc.vpc_cidr_block
}

# Database Outputs
output "database_endpoint" {
  description = "RDS instance endpoint"
  value       = module.database.endpoint
  sensitive   = true
}

output "database_port" {
  description = "RDS instance port"
  value       = module.database.port
}

# Redis Outputs
output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = module.redis.endpoint
  sensitive   = true
}

output "redis_port" {
  description = "ElastiCache Redis port"
  value       = module.redis.port
}

# S3 Outputs
output "attachments_bucket_name" {
  description = "Name of the attachments S3 bucket"
  value       = module.storage.attachments_bucket_name
}

output "static_bucket_name" {
  description = "Name of the static assets S3 bucket"
  value       = module.storage.static_bucket_name
}

# ECS Outputs
output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = module.ecs.cluster_name
}

output "ecs_service_name" {
  description = "Name of the ECS service"
  value       = module.ecs.service_name
}

# Load Balancer Outputs
output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = module.alb.alb_dns_name
}

output "alb_zone_id" {
  description = "Zone ID of the Application Load Balancer"
  value       = module.alb.alb_zone_id
}

# CloudFront Outputs
output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = module.cloudfront.cloudfront_domain_name
}

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = module.cloudfront.cloudfront_distribution_id
}

# DNS Outputs
output "app_domain" {
  description = "Application domain"
  value       = module.dns.app_domain
}

output "api_domain" {
  description = "API domain"
  value       = module.dns.api_domain
}

# SES Outputs
output "ses_verified_domain" {
  description = "SES verified domain"
  value       = module.ses.verified_domain
}

# Monitoring Outputs
output "cloudwatch_log_group_name" {
  description = "Name of the CloudWatch log group"
  value       = module.monitoring.log_group_name
}

# Connection Information
output "connection_info" {
  description = "Connection information for the application"
  value = {
    app_url    = "https://${module.dns.app_domain}"
    api_url    = "https://${module.dns.api_domain}"
    database   = "${module.database.endpoint}:${module.database.port}"
    redis      = "${module.redis.endpoint}:${module.redis.port}"
  }
  sensitive = true
}
