"use client";

import Link from "next/link";

const systemDetails = [
  {
    label: "Application",
    value: "PrimeWave Lab Resource Reservation System",
  },
  {
    label: "Framework",
    value: "Next.js App Router",
  },
  {
    label: "Language",
    value: "TypeScript",
  },
  {
    label: "Database",
    value: "PostgreSQL",
  },
  {
    label: "ORM",
    value: "Prisma",
  },
];

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-800">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col bg-[#17172b] text-white lg:flex">
          <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500 text-xl font-bold">
              P
            </div>

            <div>
              <h1 className="text-lg font-bold">PrimeWave</h1>
              <p className="text-xs text-slate-400">LAB MANAGEMENT</p>
            </div>
          </div>

          <nav className="space-y-1 px-4 py-7">
            <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.2em] text-slate-500">
              WORKSPACE
            </p>

            {[
              ["Dashboard", "/"],
              ["Resources", "/resources"],
              ["Reservations", "/reservations"],
              ["Users", "/users"],
              ["Reports", "/reports"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="block rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                {label}
              </Link>
            ))}

            <p className="mb-3 mt-9 px-3 text-[10px] font-bold tracking-[0.2em] text-slate-500">
              PREFERENCES
            </p>

            <Link
              href="/settings"
              className="block rounded-xl bg-violet-500 px-3 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/30"
            >
              Settings
            </Link>
          </nav>

          <div className="mt-auto p-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold text-emerald-300">
                System Overview
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                View application information and available management pages.
              </p>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          <header className="flex min-h-20 items-center justify-between border-b border-slate-200/80 bg-white px-5 sm:px-8">
            <div>
              <p className="text-xs text-slate-500">
                Workspace / Settings
              </p>
              <h2 className="text-lg font-bold text-slate-900">
                Settings
              </h2>
            </div>

            <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
              System Information
            </span>
          </header>

          <div className="mx-auto max-w-[1200px] p-5 sm:p-8">
            <section className="mb-8">
              <p className="mb-2 text-sm font-medium text-violet-600">
                CONFIGURATION
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                System Settings
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Review the application details and navigate to the main
                management sections.
              </p>
            </section>

            {/* Application information */}
            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6">
                <h3 className="font-bold text-slate-900">
                  Application Information
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Technologies used in this resource reservation system.
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                {systemDetails.map((item) => (
                  <div
                    key={item.label}
                    className="grid grid-cols-1 gap-2 py-4 sm:grid-cols-[200px_1fr] sm:items-center"
                  >
                    <span className="text-sm font-medium text-slate-500">
                      {item.label}
                    </span>
                    <span className="break-words text-sm font-semibold text-slate-800">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Quick links */}
            <section className="mt-6">
              <h3 className="mb-4 font-bold text-slate-900">
                Quick Navigation
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {[
                  {
                    title: "Dashboard",
                    description: "View reservation statistics and summaries.",
                    href: "/",
                  },
                  {
                    title: "Resources",
                    description: "View the resources registered in the system.",
                    href: "/resources",
                  },
                  {
                    title: "Reservations",
                    description: "Review and manage resource reservations.",
                    href: "/reservations",
                  },
                  {
                    title: "Users",
                    description: "View registered users.",
                    href: "/users",
                  },
                  {
                    title: "Reports",
                    description: "View reservation analytics and reports.",
                    href: "/reports",
                  },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-slate-900">
                        {item.title}
                      </h4>
                      <span className="text-lg text-violet-600 transition group-hover:translate-x-1">
                        →
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {item.description}
                    </p>
                  </Link>
                ))}
              </div>
            </section>

            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-800">
                Configuration note
              </p>
              <p className="mt-1 text-sm leading-6 text-amber-700">
                This page displays system information only. It does not
                change database settings, credentials or persistent
                application preferences.
              </p>
            </div>

            <footer className="mt-8 border-t border-slate-200 py-5 text-xs text-slate-400">
              © 2026 PrimeWave Lab
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
