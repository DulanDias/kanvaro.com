export default function AwsDocs() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 prose">
      <h1>Deploy on AWS</h1>
      <p>
        Use our Terraform modules to provision a production-ready stack in your
        AWS account.
      </p>
      <h2>What gets created</h2>
      <ul>
        <li>VPC with public/private subnets</li>
        <li>ECS Fargate cluster and services (web, api)</li>
        <li>RDS PostgreSQL 15+</li>
        <li>ElastiCache Redis</li>
        <li>Application Load Balancer + WAF</li>
        <li>CloudFront + S3 for static assets</li>
        <li>Route53 + ACM for TLS</li>
      </ul>
      <h2>Steps</h2>
      <ol>
        <li>
          Clone the repo and review <code>infra/terraform</code>.
        </li>
        <li>Configure variables for your AWS account and domain.</li>
        <li>
          Run <code>terraform init</code> and <code>terraform apply</code>.
        </li>
        <li>Ship images via GitHub Actions OIDC or push manually.</li>
      </ol>
    </div>
  );
}
