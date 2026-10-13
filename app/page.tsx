"use client";

import { useEffect, useState } from "react";

type DashboardReservation = {
  id: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  user: { name: string };
  resource: {
    name: string;
    type: string;
  };
};

type DashboardResource = {
  id: string;
  name: string;
  type: string;
  capacity: number | null;
  location: string | null;
  isAvailable: boolean;
};

type DashboardData = {
  totalUsers: number;
  totalResources: number;
  totalReservations: number;
  pendingReservations: number;
  approvedReservations: number;
  rejectedReservations: number;
  recentReservations: DashboardReservation[];
  dashboardResources: DashboardResource[];
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const avatarColors = [
  "bg-violet-100 text-violet-700",
  "bg-pink-100 text-pink-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
];

const resourceColors = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
];

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const response = await fetch("/api/dashboard", {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.error || "Could not load dashboard data."
          );
        }

        if (active) {
          setData(result.data as DashboardData);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const stats = [
    {
      label: "Total Resources",
      value: data?.totalResources ?? 0,
      change: "Resources in database",
      icon: "▦",
      color: "bg-violet-50 text-violet-600",
    },
    {
      label: "Active Reservations",
      value: data?.approvedReservations ?? 0,
      change: "Approved reservations",
      icon: "◷",
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Pending Requests",
      value: data?.pendingReservations ?? 0,
      change: "Awaiting approval",
      icon: "◉",
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Registered Users",
      value: data?.totalUsers ?? 0,
      change: "Registered in database",
      icon: "♙",
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  const reservations = data?.recentReservations ?? [];
  const resources = data?.dashboardResources ?? [];

  const pendingReservations = reservations.filter(
    (reservation) => reservation.status === "PENDING"
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8fc] text-slate-600">
        Loading dashboard...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8fc] p-6">
        <div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <p className="font-semibold text-red-600">
            Failed to load dashboard
          </p>

          <p className="mt-2 text-sm text-slate-500">
            {error || "Dashboard data unavailable."}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

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
              <h1 className="text-lg font-bold tracking-tight">
                PrimeWave
              </h1>
              <p className="text-xs text-slate-400">LAB MANAGEMENT</p>
            </div>
          </div>

          <div className="px-4 py-7">
            <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.2em] text-slate-500">
              WORKSPACE
            </p>

            <nav className="space-y-1">
              {[
                ["▦", "Dashboard", "/"],
                ["▤", "Resources", "/resources"],
                ["◷", "Reservations", "/reservations"],
                ["♙", "Users", "/users"],
                ["▥", "Reports", "/reports"],
              ].map(([icon, label, href]) => (
                <a
                  key={label}
                  href={href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    label === "Dashboard"
                      ? "bg-violet-500 text-white shadow-lg shadow-violet-950/30"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="w-5 text-center text-lg">
                    {icon}
                  </span>

                  {label}

                  {label === "Reservations" &&
                    data.pendingReservations > 0 && (
                      <span className="ml-auto rounded-md bg-white/10 px-2 py-0.5 text-xs">
                        {data.pendingReservations}
                      </span>
                    )}
                </a>
              ))}
            </nav>

            <p className="mb-3 mt-9 px-3 text-[10px] font-bold tracking-[0.2em] text-slate-500">
              PREFERENCES
            </p>

            <nav className="space-y-1">
              <a
                href="/settings"
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                <span className="w-5 text-center text-lg">⚙</span>
                Settings
              </a>
            </nav>
          </div>

          <div className="mt-auto p-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-medium text-emerald-300">
                  System operational
                </span>
              </div>

              <p className="text-xs leading-5 text-slate-400">
                Your workspace is ready. Manage resources and reservations
                from one place.
              </p>
            </div>

            <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500 font-semibold">
                AD
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold">Administrator</p>
                <p className="truncate text-xs text-slate-400">
                  admin@primewave.lab
                </p>
              </div>

              <span className="ml-auto text-slate-400">⋯</span>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          <header className="flex h-20 items-center justify-between border-b border-slate-200/80 bg-white px-5 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-xl text-violet-600 lg:hidden">
                P
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Workspace / Overview
                </p>

                <h2 className="text-lg font-bold text-slate-900">
                  Dashboard
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-5">
              {/* Notifications */}
              <div className="relative">
                <button
                  type="button"
                  aria-label="Notifications"
                  aria-expanded={notificationsOpen}
                  aria-haspopup="true"
                  onClick={() =>
                    setNotificationsOpen((open) => !open)
                  }
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-lg text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                    <path d="M10 21h4" />
                  </svg>

                  {data.pendingReservations > 0 && (
                    <>
                      <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                      <span className="sr-only">
                        {data.pendingReservations} pending reservations
                      </span>
                    </>
                  )}
                </button>

                {notificationsOpen && (
                  <div
                    role="region"
                    aria-label="Notifications panel"
                    className="absolute right-0 top-12 z-50 w-[min(340px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
                      <div>
                        <h3 className="font-bold text-slate-900">
                          Notifications
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          Reservation updates
                        </p>
                      </div>

                      <button
                        type="button"
                        aria-label="Close notifications"
                        onClick={() => setNotificationsOpen(false)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                      >
                        <span aria-hidden="true">✕</span>
                      </button>
                    </div>

                    {data.pendingReservations > 0 ? (
                      <div className="max-h-80 overflow-y-auto p-3">
                        <div className="mb-3 rounded-xl bg-amber-50 px-3 py-2.5">
                          <p className="text-sm font-semibold text-amber-800">
                            {data.pendingReservations} pending{" "}
                            {data.pendingReservations === 1
                              ? "reservation"
                              : "reservations"}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-amber-700">
                            These requests are waiting for approval.
                          </p>
                        </div>

                        {pendingReservations.map((reservation) => (
                          <div
                            key={reservation.id}
                            className="border-b border-slate-100 px-2 py-3 last:border-b-0"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                                <svg
                                  aria-hidden="true"
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="12" cy="12" r="9" />
                                  <path d="M12 7v5l3 2" />
                                </svg>
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-800">
                                  Reservation awaiting approval
                                </p>

                                <p className="mt-1 text-sm text-slate-600">
                                  {reservation.resource.name}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  Requested by{" "}
                                  {reservation.user.name}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {formatDate(reservation.startTime)} ·{" "}
                                  {formatTime(reservation.startTime)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-5 py-8 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                          <svg
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="23"
                            height="23"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m5 12 4 4L19 6" />
                          </svg>
                        </div>

                        <p className="mt-3 text-sm font-semibold text-slate-800">
                          You&apos;re all caught up!
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          There are no pending reservations to review.
                        </p>
                      </div>
                    )}

                    <div className="border-t border-slate-100 bg-slate-50 p-3">
                      <a
                        href="/reservations"
                        onClick={() => setNotificationsOpen(false)}
                        className="flex w-full items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
                      >
                        View reservations
                        <span className="ml-2" aria-hidden="true">
                          →
                        </span>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden h-9 border-l border-slate-200 sm:block" />

              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                  AD
                </div>

                <div className="hidden sm:block">
                  <p className="text-sm font-semibold">Administrator</p>
                  <p className="text-xs text-slate-500">Super Admin</p>
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1600px] p-5 sm:p-8">
            {/* Welcome */}
            <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <p className="mb-2 text-sm font-medium text-violet-600">
                  WORKSPACE OVERVIEW
                </p>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Welcome back, Administrator 👋
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Here&apos;s what&apos;s happening in your workspace today.
                </p>
              </div>

              <a
                href="/reservations"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
              >
                <span className="text-lg">+</span>
                New Reservation
              </a>
            </section>

            {/* Summary cards */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <article
                  key={stat.label}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium text-slate-500">
                      {stat.label}
                    </p>

                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${stat.color}`}
                    >
                      {stat.icon}
                    </div>
                  </div>

                  <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                    {stat.value}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    {stat.change}
                  </p>
                </article>
              ))}
            </section>

            {/* Reservations and availability */}
            <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm xl:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5 sm:p-6">
                  <div>
                    <h3 className="font-bold text-slate-900">
                      Recent Reservations
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Latest booking requests from the database
                    </p>
                  </div>

                  <a
                    href="/reservations"
                    className="text-sm font-semibold text-violet-600 hover:text-violet-800"
                  >
                    View all →
                  </a>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left">
                    <thead className="bg-slate-50/80">
                      <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        <th className="px-6 py-4">Resource</th>
                        <th className="px-4 py-4">Reserved by</th>
                        <th className="px-4 py-4">Date &amp; time</th>
                        <th className="px-4 py-4">Status</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {reservations.map((reservation, index) => (
                        <tr
                          key={reservation.id}
                          className="transition hover:bg-slate-50/70"
                        >
                          <td className="px-6 py-4">
                            <p className="whitespace-nowrap text-sm font-semibold text-slate-800">
                              {reservation.resource.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {reservation.resource.type}
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                  avatarColors[index % avatarColors.length]
                                }`}
                              >
                                {getInitials(reservation.user.name)}
                              </span>

                              <span className="whitespace-nowrap text-sm text-slate-600">
                                {reservation.user.name}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <p className="whitespace-nowrap text-sm text-slate-700">
                              {formatDate(reservation.startTime)}
                            </p>

                            <p className="mt-1 whitespace-nowrap text-xs text-slate-500">
                              {formatTime(reservation.startTime)} –{" "}
                              {formatTime(reservation.endTime)}
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                reservation.status === "APPROVED"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : reservation.status === "PENDING"
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-rose-50 text-rose-700"
                              }`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                              {reservation.status}
                            </span>
                          </td>
                        </tr>
                      ))}

                      {reservations.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-6 py-10 text-center text-sm text-slate-500"
                          >
                            No reservations found yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-slate-100 px-6 py-4">
                  <p className="text-xs text-slate-400">
                    Showing {reservations.length} recent reservations
                  </p>
                </div>
              </div>

              {/* Resource availability */}
              <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 p-5">
                  <div>
                    <h3 className="font-bold text-slate-900">
                      Resource Availability
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Resources registered in the database
                    </p>
                  </div>

                  <a
                    href="/resources"
                    className="text-sm font-semibold text-violet-600"
                  >
                    View all
                  </a>
                </div>

                <div className="space-y-1 p-3">
                  {resources.map((resource, index) => (
                    <div
                      key={resource.id}
                      className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-slate-50"
                    >
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${
                          resourceColors[index % resourceColors.length]
                        }`}
                      >
                        {resource.type.toLowerCase().includes("equipment")
                          ? "▣"
                          : "▤"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {resource.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {resource.type}
                          {resource.capacity !== null
                            ? ` · ${resource.capacity} seats`
                            : ""}
                        </p>

                        {resource.location && (
                          <p className="mt-1 text-xs text-slate-400">
                            {resource.location}
                          </p>
                        )}

                        <div className="mt-2 flex items-center gap-1.5">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              resource.isAvailable
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                            }`}
                          />

                          <span
                            className={`text-xs font-medium ${
                              resource.isAvailable
                                ? "text-emerald-700"
                                : "text-amber-700"
                            }`}
                          >
                            {resource.isAvailable
                              ? "Available"
                              : "Unavailable"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {resources.length === 0 && (
                    <p className="px-3 py-8 text-center text-sm text-slate-500">
                      No resources registered yet.
                    </p>
                  )}
                </div>

                <div className="mx-5 mb-5 rounded-xl bg-violet-50 p-4">
                  <p className="text-sm font-semibold text-violet-900">
                    Need another resource?
                  </p>

                  <p className="mt-1 text-xs leading-5 text-violet-700">
                    Explore the resource directory to find what you need.
                  </p>

                  <a
                    href="/resources"
                    className="mt-3 inline-flex text-xs font-bold text-violet-700 hover:text-violet-900"
                  >
                    Browse resources →
                  </a>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-slate-200 py-5 text-xs text-slate-400 sm:flex-row">
              <p>
                © {new Date().getFullYear()} PrimeWave Lab. Resource Reservation Management.
              </p>

              <p>Live data from your PostgreSQL database</p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}