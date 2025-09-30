# Terraform Setup

Use the provided modules under `infra/terraform` to provision:

- VPC (public/private subnets)
- ECS Fargate cluster/services
- RDS Postgres, ElastiCache Redis
- ALB + WAF, CloudFront + S3
- Route53 + ACM

## Prerequisites

- Terraform 1.5+
- AWS account and credentials

## Steps

1. Review variables and set your domain, region, CIDRs.
2. `terraform init`
3. `terraform apply`
4. Configure GitHub OIDC role for CI/CD.
