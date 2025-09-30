export default function DocsIndexPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold">Kanvaro Documentation</h1>
      <p className="mt-2 text-gray-600">Learn how to deploy and run Kanvaro.</p>

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <a href="/docs/aws" className="p-5 border rounded-xl hover:shadow-sm">
          <div className="font-semibold">Deploy on AWS</div>
          <div className="text-sm text-gray-600">
            Provision a production stack in your AWS account.
          </div>
        </a>
        <a
          href="/docs/self-hosting"
          className="p-5 border rounded-xl hover:shadow-sm"
        >
          <div className="font-semibold">Self-hosting</div>
          <div className="text-sm text-gray-600">
            Run locally or on your own infrastructure.
          </div>
        </a>
      </div>
    </div>
  );
}
