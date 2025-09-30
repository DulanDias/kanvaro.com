# Kanvaro Infrastructure
# Production-ready AWS infrastructure for single-tenant deployment

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# VPC and Networking
module "vpc" {
  source = "./modules/vpc"
  
  environment = var.environment
  vpc_cidr    = var.vpc_cidr
}

# RDS PostgreSQL Database
module "database" {
  source = "./modules/database"
  
  environment = var.environment
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.private_subnet_ids
  
  db_instance_class = var.db_instance_class
  db_allocated_storage = var.db_allocated_storage
  db_max_allocated_storage = var.db_max_allocated_storage
}

# ElastiCache Redis
module "redis" {
  source = "./modules/redis"
  
  environment = var.environment
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.private_subnet_ids
  
  redis_node_type = var.redis_node_type
}

# S3 Buckets
module "storage" {
  source = "./modules/storage"
  
  environment = var.environment
}

# ECS Cluster and Services
module "ecs" {
  source = "./modules/ecs"
  
  environment = var.environment
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.private_subnet_ids
  
  api_image = var.api_image
  web_image = var.web_image
  
  database_url = module.database.connection_string
  redis_url    = module.redis.connection_string
}

# Application Load Balancer
module "alb" {
  source = "./modules/alb"
  
  environment = var.environment
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.public_subnet_ids
  
  certificate_arn = module.acm.certificate_arn
  target_group_arn = module.ecs.target_group_arn
}

# CloudFront Distribution
module "cloudfront" {
  source = "./modules/cloudfront"
  
  environment = var.environment
  domain_name = var.domain_name
  
  s3_bucket_domain_name = module.storage.static_bucket_domain_name
  alb_domain_name = module.alb.alb_dns_name
}

# SSL Certificate
module "acm" {
  source = "./modules/acm"
  
  domain_name = var.domain_name
  environment = var.environment
}

# Route53 DNS
module "dns" {
  source = "./modules/dns"
  
  domain_name = var.domain_name
  environment = var.environment
  
  cloudfront_domain_name = module.cloudfront.cloudfront_domain_name
  alb_domain_name = module.alb.alb_dns_name
}

# SES Email Service
module "ses" {
  source = "./modules/ses"
  
  domain_name = var.domain_name
  environment = var.environment
}

# WAF
module "waf" {
  source = "./modules/waf"
  
  environment = var.environment
  alb_arn = module.alb.alb_arn
}

# Monitoring and Logging
module "monitoring" {
  source = "./modules/monitoring"
  
  environment = var.environment
  
  ecs_cluster_name = module.ecs.cluster_name
  rds_instance_id = module.database.instance_id
  redis_cluster_id = module.redis.cluster_id
}

# IAM Roles
module "iam" {
  source = "./modules/iam"
  
  environment = var.environment
  
  ecs_task_role_arn = module.ecs.task_role_arn
  s3_bucket_arns = [
    module.storage.attachments_bucket_arn,
    module.storage.static_bucket_arn
  ]
}
