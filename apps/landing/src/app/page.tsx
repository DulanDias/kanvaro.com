'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-semibold">Kanvaro</div>
          <nav className="hidden md:flex gap-6 text-sm text-gray-600">
            <a href="#features">Features</a>
            <a href="#deploy">Deploy</a>
            <a href="#selfhost">Self-host</a>
            <a href="#opensource">Open Source</a>
          </nav>
          <div className="flex gap-2">
            <Link
              className="px-3 py-1.5 border rounded-md"
              href="https://github.com/kanvaro/kanvaro"
            >
              GitHub
            </Link>
            <Link
              className="px-3 py-1.5 bg-black text-white rounded-md"
              href="/docs"
            >
              Docs
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="pt-20 pb-12">
          <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Agile project management, fast and learnable.
              </h1>
              <p className="mt-4 text-gray-600 text-lg">
                Kanvaro is a performance-first, single-tenant, open-source
                project management system built for teams who value speed,
                control, and privacy.
              </p>
              <div className="mt-6 flex gap-3">
                <Link
                  className="px-4 py-2 rounded-md bg-black text-white"
                  href="#deploy"
                >
                  Deploy now
                </Link>
                <Link
                  className="px-4 py-2 rounded-md border"
                  href="https://github.com/kanvaro/kanvaro"
                >
                  View on GitHub
                </Link>
              </div>
              <p className="mt-3 text-xs text-gray-500">
                Open source. Single-tenant. Deploy in your own AWS account or
                self-host anywhere.
              </p>
            </div>
            <div className="bg-gray-50 border rounded-xl aspect-video" />
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-16 border-t">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold">Everything your team needs</h2>
            <div className="mt-8 grid md:grid-cols-3 gap-6">
              {[
                ['Single-tenant by design', 'Your data, your VPC, your keys.'],
                [
                  'Kanban and Sprints',
                  'Drag-and-drop boards, LexoRank ordering, realtime updates.',
                ],
                [
                  'Time tracking',
                  'Timers, manual logs, reports and billable analytics.',
                ],
                [
                  'Reports & Insights',
                  'Velocity, CFD, throughput and performance dashboards.',
                ],
                [
                  'Robust Auth',
                  'Invites, MFA, sessions, magic links, rate limiting.',
                ],
                [
                  'AWS-first Infra',
                  'Terraform modules for VPC, ECS, RDS, Redis, WAF and more.',
                ],
              ].map(([title, desc]) => (
                <div
                  key={title}
                  className="p-5 border rounded-xl hover:shadow-sm transition"
                >
                  <div className="font-semibold">{title}</div>
                  <div className="text-sm text-gray-600 mt-1">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Deployment Options */}
        <section id="deploy" className="py-16 border-t">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold">Deploy your own Kanvaro</h2>
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className="p-6 border rounded-xl">
                <div className="font-semibold">AWS in your account</div>
                <p className="mt-2 text-sm text-gray-600">
                  Terraform modules provision a production-ready stack in your
                  AWS account (VPC, ECS Fargate, RDS, ElastiCache, ALB,
                  CloudFront, S3, WAF).
                </p>
                <div className="mt-4 flex gap-3">
                  <Link
                    className="px-4 py-2 rounded-md bg-black text-white"
                    href="/docs"
                  >
                    Read docs
                  </Link>
                  <Link
                    className="px-4 py-2 rounded-md border"
                    href="https://github.com/kanvaro/kanvaro"
                  >
                    GitHub
                  </Link>
                </div>
              </div>
              <div className="p-6 border rounded-xl">
                <div className="font-semibold">Self-host anywhere</div>
                <p className="mt-2 text-sm text-gray-600">
                  Run locally with Docker Compose or deploy to your own
                  infrastructure. It’s your stack, fully open source under MIT.
                </p>
                <div className="mt-4 flex gap-3">
                  <Link
                    className="px-4 py-2 rounded-md bg-black text-white"
                    href="/docs/self-hosting"
                  >
                    Self-host guide
                  </Link>
                  <Link
                    className="px-4 py-2 rounded-md border"
                    href="https://github.com/kanvaro/kanvaro"
                  >
                    GitHub
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Self-host / Open-source */}
        <section id="selfhost" className="py-16 border-t">
          <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-semibold">Deploy with confidence</h3>
              <p className="mt-2 text-gray-600">
                Use our Terraform modules to deploy a production-ready stack on
                AWS with ECS Fargate, RDS Postgres, ElastiCache Redis, ALB,
                CloudFront, S3, WAF and more.
              </p>
              <div className="mt-4 flex gap-3">
                <Link className="px-4 py-2 rounded-md border" href="/docs">
                  Read docs
                </Link>
                <Link
                  className="px-4 py-2 rounded-md bg-black text-white"
                  href="https://github.com/kanvaro/kanvaro"
                >
                  GitHub
                </Link>
              </div>
            </div>
            <div className="bg-gray-50 border rounded-xl aspect-video" />
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-sm text-gray-600">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div>© {new Date().getFullYear()} Kanvaro. MIT Licensed.</div>
          <div className="flex gap-4">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
