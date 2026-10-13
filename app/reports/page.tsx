"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Reservation = {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  purpose?: string | null;
  user?: { name: string; email?: string };
  resource?: { name: string; type?: string };
};

type Resource = {
  id: string;
  name: string;
  type: string;
  isAvailable: boolean;
};

type User = {
  id: string;
  name: string;
  email: string;
};

type ApiResult<T> = {
  success?: boolean;
  data?: T;
  error?: string;
};

function extractData<T>(result: ApiResult<T> | T[]): T[] {
  if (Array.isArray(result)) {
    return result;
  }

  if (result && typeof result === "object" && "data" in result) {
    const data = (result as ApiResult<T>).data;
    return Array.isArray(data) ? data : [];
  }

  return [];
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ReportsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Initial data loading. State updates happen after asynchronous requests.
  useEffect(() => {
    let active = true;

    async function fetchReports() {
      try {
        const [reservationResponse, resourceResponse, userResponse] =
          await Promise.all([
            fetch("/api/reservations", { cache: "no-store" }),
            fetch("/api/resources", { cache: "no-store" }),
            fetch("/api/users", { cache: "no-store" }),
          ]);

        const results = await Promise.all([
          reservationResponse.json(),
          resourceResponse.json(),
          userResponse.json(),
        ]);

        const responses = [
          reservationResponse,
          resourceResponse,
          userResponse,
        ];

        for (let i = 0; i < responses.length; i++) {
          if (!responses[i].ok || results[i].success === false) {
            throw new Error(
              results[i].error || "Could not load report data."
            );
          }
        }

        if (!active) return;

        setReservations(extractData<Reservation>(results[0]));
        setResources(extractData<Resource>(results[1]));
        setUsers(extractData<User>(results[2]));
        setError("");
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load reports."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchReports();

    return () => {
      active = false;
    };
  }, []);

  // Refresh button: reload the latest data from the APIs.
  const loadReports = useCallback(async () => {
    setRefreshing(true);
    setError("");

    try {
      const [reservationResponse, resourceResponse, userResponse] =
        await Promise.all([
          fetch("/api/reservations", { cache: "no-store" }),
          fetch("/api/resources", { cache: "no-store" }),
          fetch("/api/users", { cache: "no-store" }),
        ]);

      const results = await Promise.all([
        reservationResponse.json(),
        resourceResponse.json(),
        userResponse.json(),
      ]);

      const responses = [
        reservationResponse,
        resourceResponse,
        userResponse,
      ];

      for (let i = 0; i < responses.length; i++) {
        if (!responses[i].ok || results[i].success === false) {
          throw new Error(
            results[i].error || "Could not refresh report data."
          );
        }
      }

      setReservations(extractData<Reservation>(results[0]));
      setResources(extractData<Resource>(results[1]));
      setUsers(extractData<User>(results[2]));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to refresh reports."
      );
    } finally {
      setRefreshing(false);
    }
  }, []);

  const pending = reservations.filter(
    (item) => item.status === "PENDING"
  ).length;

  const approved = reservations.filter(
    (item) => item.status === "APPROVED"
  ).length;

  const rejected = reservations.filter(
    (item) => item.status === "REJECTED"
  ).length;

  const available = resources.filter(
    (item) => item.isAvailable
  ).length;

  const stats = [
    {
      label: "Total Reservations",
      value: reservations.length,
      color: "bg-violet-50 text-violet-700",
    },
    {
      label: "Approved",
      value: approved,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Pending",
      value: pending,
      color: "bg-amber-50 text-amber-700",
    },
    {
      label: "Rejected",
      value: rejected,
      color: "bg-rose-50 text-rose-700",
    },
  ];

  const breakdown = [
    {
      label: "Approved",
      count: approved,
      color: "bg-emerald-500",
    },
    {
      label: "Pending",
      count: pending,
      color: "bg-amber-500",
    },
    {
      label: "Rejected",
      count: rejected,
      color: "bg-rose-500",
    },
  ];

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

          <div className="px-4 py-7">
            <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.2em] text-slate-500">
              WORKSPACE
            </p>

            <nav className="space-y-1">
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
                  className={`block rounded-xl px-3 py-3 text-sm font-medium transition ${
                    href === "/reports"
                      ? "bg-violet-500 text-white shadow-lg shadow-violet-950/30"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            <p className="mb-3 mt-9 px-3 text-[10px] font-bold tracking-[0.2em] text-slate-500">
              PREFERENCES
            </p>

            <nav className="space-y-1">
              <Link
                href="/settings"
                className="block rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                Settings
              </Link>
            </nav>
          </div>

          <div className="mt-auto p-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-medium text-emerald-300">
                  Reports available
                </span>
              </div>

              <p className="text-xs leading-5 text-slate-400">
                View reservation status, user totals and resource availability.
              </p>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          <header className="flex min-h-20 items-center justify-between gap-3 border-b border-slate-200/80 bg-white px-5 sm:px-8">
            <div>
              <p className="text-xs text-slate-500">
                Workspace / Reports
              </p>
              <h2 className="text-lg font-bold text-slate-900">
                Reports &amp; Analytics
              </h2>
            </div>

            <button
              type="button"
              onClick={() => void loadReports()}
              disabled={refreshing}
              className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {refreshing ? "Refreshing..." : "Refresh Data"}
            </button>
          </header>

          <div className="mx-auto max-w-[1600px] p-5 sm:p-8">
            {/* Page heading */}
            <section className="mb-8">
              <p className="mb-2 text-sm font-medium text-violet-600">
                WORKSPACE INSIGHTS
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Reports Overview
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Monitor reservation activity, users and resource availability.
              </p>
            </section>

            {/* Error message */}
            {error && (
              <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4">
                <p className="font-semibold text-rose-700">
                  Could not load reports
                </p>

                <p className="mt-1 text-sm text-rose-600">{error}</p>

                <button
                  type="button"
                  onClick={() => void loadReports()}
                  className="mt-3 text-sm font-bold text-rose-700 underline"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Loading indicator */}
            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
                Loading report data from the database...
              </div>
            ) : (
              <>
                {/* Summary cards */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {stats.map((stat) => (
                    <article
                      key={stat.label}
                      className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <p className="text-sm font-medium text-slate-500">
                        {stat.label}
                      </p>

                      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                        {stat.value}
                      </p>

                      <span
                        className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${stat.color}`}
                      >
                        Database records
                      </span>
                    </article>
                  ))}
                </section>

                {/* Breakdown and summary */}
                <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <h3 className="font-bold text-slate-900">
                      Reservation Status Breakdown
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Distribution of recorded reservations
                    </p>

                    <div className="mt-6 space-y-5">
                      {breakdown.map((item) => {
                        const percentage =
                          reservations.length > 0
                            ? (item.count / reservations.length) * 100
                            : 0;

                        return (
                          <div key={item.label}>
                            <div className="mb-2 flex justify-between text-sm">
                              <span className="font-medium text-slate-600">
                                {item.label}
                              </span>

                              <span className="font-bold text-slate-800">
                                {item.count} ({percentage.toFixed(0)}%)
                              </span>
                            </div>

                            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className={`h-full rounded-full transition-all ${item.color}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <h3 className="font-bold text-slate-900">
                      Workspace Summary
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Current application data
                    </p>

                    <div className="mt-5 divide-y divide-slate-100">
                      {[
                        ["Registered Users", users.length],
                        ["Registered Resources", resources.length],
                        ["Available Resources", available],
                        [
                          "Unavailable Resources",
                          resources.length - available,
                        ],
                        ["Total Reservations", reservations.length],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="flex items-center justify-between gap-4 py-4"
                        >
                          <span className="text-sm text-slate-600">
                            {label}
                          </span>

                          <span className="text-lg font-bold text-slate-900">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Reservation report table */}
                <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5 sm:p-6">
                    <div>
                      <h3 className="font-bold text-slate-900">
                        Reservation Report
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {reservations.length} reservation records
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Print Report
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left">
                      <thead className="bg-slate-50">
                        <tr className="text-xs uppercase tracking-wide text-slate-500">
                          <th className="px-5 py-4">Resource</th>
                          <th className="px-5 py-4">Reserved By</th>
                          <th className="px-5 py-4">Date</th>
                          <th className="px-5 py-4">Time</th>
                          <th className="px-5 py-4">Status</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {reservations.map((reservation) => (
                          <tr
                            key={reservation.id}
                            className="transition hover:bg-slate-50"
                          >
                            <td className="px-5 py-4">
                              <p className="text-sm font-semibold text-slate-800">
                                {reservation.resource?.name ?? "Unknown resource"}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {reservation.resource?.type ?? "—"}
                              </p>
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-600">
                              {reservation.user?.name ?? "Unknown user"}
                            </td>

                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                              {formatDate(reservation.startTime)}
                            </td>

                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                              {new Date(reservation.startTime).toLocaleTimeString(
                                "en-US",
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                              {" – "}
                              {new Date(reservation.endTime).toLocaleTimeString(
                                "en-US",
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  reservation.status === "APPROVED"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : reservation.status === "PENDING"
                                      ? "bg-amber-50 text-amber-700"
                                      : "bg-rose-50 text-rose-700"
                                }`}
                              >
                                {reservation.status}
                              </span>
                            </td>
                          </tr>
                        ))}

                        {reservations.length === 0 && (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-5 py-10 text-center text-sm text-slate-500"
                            >
                              No reservation records found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}

            {/* Footer */}
            <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-slate-200 py-5 text-xs text-slate-400 sm:flex-row">
              <p>
                 © 2026 PrimeWave Lab
              </p>

              <p>Reports based on application API data</p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
