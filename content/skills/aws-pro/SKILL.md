---
name: aws-pro
description: >-
  Expert AWS architecture and management covering core services (EC2, S3, RDS,
  Lambda), IAM security, and Infrastructure as Code (Terraform/CDK).
x-kind: domain
x-version: 0.1.0
x-roles: []
x-tags: []
x-compatible:
  - claude
  - cursor
  - codex
  - gemini
---

# AWS Pro

Expert-level orchestration of Amazon Web Services. Focuses on security, scalability, and cost-optimized cloud architecture.

## Boundary

**`aws-pro`** covers core infrastructure (VPC, EC2, RDS), storage (S3), serverless (Lambda, API Gateway), security (IAM, KMS), and Infrastructure as Code (CDK, Terraform). It does NOT cover specific application code logic (use language skills for that).

## When to use

- Designing a highly available, multi-region architecture on AWS.
- Implementing least-privilege IAM policies.
- Automating infrastructure deployment using Terraform or AWS CDK.
- Optimizing AWS costs and performance for existing workloads.

## Workflow

1. **Architecture Design**: Map requirements to AWS Well-Architected Framework.
2. **Security & Access**: Define IAM roles and security groups.
3. **Provisioning**: Write IaC (Terraform/CDK) to define resources.
4. **Networking**: Configure VPC, Subnets, and Routing.
5. **Deployment**: Deploy resources and verify connectivity.
6. **Monitoring**: Set up CloudWatch alarms and cost tracking.

### Operating principles

- **Least Privilege**: Grant only the minimum permissions necessary (IAM).
- **IaC First**: Never manually create resources in the console; use code.
- **Statelessness**: Design for failure and scale by keeping components stateless.
- **Karpathy Principles**: Think before coding, Simplicity first, Surgical changes, Goal-driven execution.

## Suggested response format (STRICT)

Your response MUST follow this structure:

```xml
<Role>
AWS Cloud Architect / DevOps Engineer.
</Role>

<Architecture>
[Brief description of the AWS architecture/components]
</Architecture>

<Implementation>
[IaC Artifact: Terraform hcl or CDK typescript]
</Implementation>

<Verification>
[Step-by-step verification plan: CLI commands or console checks]
</Verification>
```

## Resources in this skill

| Topic | Reference |
|-------|-----------|
| AWS Roadmap | [roadmap.sh/aws](https://roadmap.sh/aws) |
| AWS Well-Architected | [aws.amazon.com/architecture/well-architected](https://aws.amazon.com/architecture/well-architected/) |
| Terraform AWS Provider | [registry.terraform.io/providers/hashicorp/aws](https://registry.terraform.io/providers/hashicorp/aws/latest/docs) |
| IAM Best Practices | [docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html) |

## Quick example

**Feature:** Secure S3 bucket with Terraform.

```hcl
resource "aws_s3_bucket" "secure_bucket" {
  bucket = "my-secure-data-••••"
}

resource "aws_s3_bucket_public_access_block" "block" {
  bucket = aws_s3_bucket.secure_bucket.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
```

## Checklist before calling the skill done

- [ ] **Think Before Coding**: Cost and security implications analyzed.
- [ ] **Simplicity First**: Managed services (RDS/S3) preferred over self-managed.
- [ ] **Surgical Changes**: Only modified relevant IaC modules.
- [ ] **Goal-Driven Execution**: Verified resource creation and connectivity.
- [ ] Least-privilege IAM policies implemented.
- [ ] Encryption (at rest and in transit) enabled where applicable.
- [ ] Multi-AZ and high availability considered for production.
