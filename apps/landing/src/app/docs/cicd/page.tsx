export default function CicdDocs() {
  return (
    <div className="prose">
      <h1>CI/CD</h1>
      <p>
        Use GitHub Actions with OIDC to build and deploy Docker images to your
        AWS ECR and roll out ECS services.
      </p>
      <h2>Workflows</h2>
      <ul>
        <li>Build & Test: install, type-check, lint, test</li>
        <li>
          Docker Build: build and push <code>apps/api</code> and{' '}
          <code>apps/web</code>
        </li>
        <li>Deploy: Terraform plan/apply and ECS update-service</li>
      </ul>
      <h2>Secrets</h2>
      <ul>
        <li>
          <code>AWS_ACCOUNT_ID</code>, <code>AWS_REGION</code>
        </li>
        <li>OIDC IAM role with ECR and ECS permissions</li>
      </ul>
    </div>
  );
}
