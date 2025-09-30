export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-[240px_1fr] gap-8">
        <aside className="md:sticky md:top-6 h-max border rounded-lg p-4 text-sm">
          <div className="font-semibold mb-2">Docs</div>
          <nav className="space-y-1">
            <a className="block hover:underline" href="/docs">
              Overview
            </a>
            <a className="block hover:underline" href="/docs/install">
              Installation
            </a>
            <a className="block hover:underline" href="/docs/environment">
              Environment
            </a>
            <a className="block hover:underline" href="/docs/local">
              Local (Docker)
            </a>
            <a className="block hover:underline" href="/docs/aws">
              AWS Deployment
            </a>
            <a className="block hover:underline" href="/docs/cicd">
              CI/CD
            </a>
            <a className="block hover:underline" href="/docs/self-hosting">
              Self-hosting
            </a>
          </nav>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
