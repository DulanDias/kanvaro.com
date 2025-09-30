# CI/CD Pipeline

GitHub Actions build and test the monorepo and build Docker images.

## Jobs

- CI: install, type-check, lint, build, test
- Docker (optional): build and push images to ECR
- Deploy (optional): Terraform plan/apply and ECS rollout

## OIDC Setup

- Create IAM role for GitHub OIDC
- Grant ECR and ECS permissions
- Configure role ARN in workflow
