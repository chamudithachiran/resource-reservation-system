
"use client";

import { useCallback, useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
};

type Resource = {
  id: string;
  name: string;
  type: string;
  location: string | null;
  isAvailable: boolean;
};

type Reservation = {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  purpose: string | null;
  user: { id: string; name: string; email: string };
  resource: { id: string; name: string; type: string };
};

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400";

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function ReservationsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [userId, setUserId] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [usersRes, resourcesRes, reservationsRes] =
        await Promise.all([
          fetch("/api/users"),
          fetch("/api/resources"),
          fetch("/api/reservations"),
        ]);

      const [usersJson, resourcesJson, reservationsJson] =
        await Promise.all([
          usersRes.json(),
          resourcesRes.json(),
          reservationsRes.json(),
        ]);

      if (!usersRes.ok || !usersJson.success) {
        throw new Error(usersJson.error || "Could not load users.");
      }

      if (!resourcesRes.ok || !resourcesJson.success) {
        throw new Error(resourcesJson.error || "Could not load resources.");
      }

      if (!reservationsRes.ok || !reservationsJson.success) {
        throw new Error(
          reservationsJson.error || "Could not load reservations.",
        );
      }

      setUsers(usersJson.data);
      setResources(resourcesJson.data);
      setReservations(reservationsJson.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial data without calling a state-updating function
  // directly from the effect body.
  useEffect(() => {
    let active = true;

    async function fetchInitialData() {
      setError("");

      try {
        const [usersRes, resourcesRes, reservationsRes] =
          await Promise.all([
            fetch("/api/users"),
            fetch("/api/resources"),
            fetch("/api/reservations"),
          ]);

        const [usersJson, resourcesJson, reservationsJson] =
          await Promise.all([
            usersRes.json(),
            resourcesRes.json(),
            reservationsRes.json(),
          ]);

        if (!usersRes.ok || !usersJson.success) {
          throw new Error(usersJson.error || "Could not load users.");
        }

        if (!resourcesRes.ok || !resourcesJson.success) {
          throw new Error(
            resourcesJson.error || "Could not load resources.",
          );
        }

        if (!reservationsRes.ok || !reservationsJson.success) {
          throw new Error(
            reservationsJson.error || "Could not load reservations.",
          );
        }

        if (active) {
          setUsers(usersJson.data);
          setResources(resourcesJson.data);
          setReservations(reservationsJson.data);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchInitialData();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!userId || !resourceId || !startTime || !endTime) {
      setError("Please complete all required fields.");
      return;
    }

    if (new Date(startTime) <= new Date()) {
      setError("Start time must be in the future.");
      return;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      setError("End time must be later than start time.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          resourceId,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          purpose: purpose.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ||
            result.message ||
            "Could not create reservation.",
        );
      }

      setSuccess("Reservation created successfully!");
      setResourceId("");
      setStartTime("");
      setEndTime("");
      setPurpose("");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not create reservation.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(
    reservationId: string,
    status: "APPROVED" | "REJECTED",
  ) {
    const action = status === "APPROVED" ? "approve" : "reject";

    if (
      !window.confirm(
        `Are you sure you want to ${action} this reservation?`,
      )
    ) {
      return;
    }

    setUpdatingId(reservationId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/reservations/${reservationId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || `Could not ${action} reservation.`,
        );
      }

      setSuccess(
        result.message || `Reservation ${action}d successfully.`,
      );
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Could not ${action} reservation.`,
      );
    } finally {
      setUpdatingId("");
    }
  }

  const availableResources = resources.filter(
    (resource) => resource.isAvailable,
  );

  const pendingCount = reservations.filter(
    (reservation) => reservation.status === "PENDING",
  ).length;

  const approvedCount = reservations.filter(
    (reservation) => reservation.status === "APPROVED",
  ).length;

  const rejectedCount = reservations.filter(
    (reservation) => reservation.status === "REJECTED",
  ).length;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-medium text-cyan-400">
              PRIMEWAVE LAB
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Reservations
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Create, review, approve, and reject reservations.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading}
            className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium transition hover:border-cyan-400 hover:text-cyan-300 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
          >
            {success}
          </div>
        )}

        <section className="mb-8 grid gap-6 lg:grid-cols-[380px_1fr]">
          <div className="h-fit rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="mb-1 text-xl font-semibold">
              Create Reservation
            </h2>
            <p className="mb-6 text-sm text-slate-400">
              Choose a user, resource, and booking time.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  User *
                </label>
                <select
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                  className={inputClass}
                >
                  <option value="">Select a user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} — {user.email}
                    </option>
                  ))}
                </select>
                {users.length === 0 && (
                  <p className="mt-2 text-xs text-amber-300">
                    Add a user from the Users page first.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Resource *
                </label>
                <select
                  value={resourceId}
                  onChange={(e) => setResourceId(e.target.value)}
                  required
                  className={inputClass}
                >
                  <option value="">Select a resource</option>
                  {availableResources.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.name} — {resource.type}
                    </option>
                  ))}
                </select>
                {availableResources.length === 0 && (
                  <p className="mt-2 text-xs text-amber-300">
                    Add an available resource first.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Start Date &amp; Time *
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  End Date &amp; Time *
                </label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  min={startTime || undefined}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Purpose
                </label>
                <textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Why do you need this resource?"
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={
                  saving ||
                  loading ||
                  users.length === 0 ||
                  availableResources.length === 0
                }
                className="w-full rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Creating..." : "Create Reservation"}
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-xl font-semibold">Booking Overview</h2>
            <p className="mt-1 text-sm text-slate-400">
              Current reservation status summary.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Total",
                  count: reservations.length,
                  color: "text-white",
                },
                {
                  label: "Pending",
                  count: pendingCount,
                  color: "text-amber-300",
                },
                {
                  label: "Approved",
                  count: approvedCount,
                  color: "text-emerald-300",
                },
                {
                  label: "Rejected",
                  count: rejectedCount,
                  color: "text-red-300",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                >
                  <p className="text-sm text-slate-400">{item.label}</p>
                  <p className={`mt-2 text-3xl font-bold ${item.color}`}>
                    {item.count}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/60 p-5 text-sm leading-6 text-slate-400">
              Reservations start as{" "}
              <strong className="text-amber-300">PENDING</strong>.
              Approving checks whether another approved reservation overlaps
              with the same resource and time.
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
          <div className="border-b border-slate-800 p-6">
            <h2 className="text-xl font-semibold">All Reservations</h2>
            <p className="mt-1 text-sm text-slate-400">
              Approve or reject bookings that are still pending.
            </p>
          </div>

          {loading ? (
            <p className="p-8 text-sm text-slate-400">
              Loading reservations...
            </p>
          ) : reservations.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-medium">No reservations yet</p>
              <p className="mt-2 text-sm text-slate-400">
                Create your first reservation using the form above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-950/70 text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">User</th>
                    <th className="px-6 py-4 font-medium">Resource</th>
                    <th className="px-6 py-4 font-medium">Start</th>
                    <th className="px-6 py-4 font-medium">End</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {reservations.map((reservation) => (
                    <tr
                      key={reservation.id}
                      className="transition hover:bg-slate-800/40"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium">
                          {reservation.user?.name ?? "Unknown user"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {reservation.user?.email ?? ""}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium">
                          {reservation.resource?.name ?? "Unknown resource"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {reservation.resource?.type ?? ""}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {formatDate(reservation.startTime)}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {formatDate(reservation.endTime)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            reservation.status === "APPROVED"
                              ? "bg-emerald-400/10 text-emerald-300"
                              : reservation.status === "REJECTED"
                                ? "bg-red-400/10 text-red-300"
                                : reservation.status === "CANCELLED"
                                  ? "bg-slate-700 text-slate-300"
                                  : "bg-amber-400/10 text-amber-300"
                          }`}
                        >
                          {reservation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {reservation.status === "PENDING" ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                void updateStatus(
                                  reservation.id,
                                  "APPROVED",
                                )
                              }
                              disabled={updatingId !== ""}
                              className="rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50"
                            >
                              {updatingId === reservation.id
                                ? "Updating..."
                                : "Approve"}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                void updateStatus(
                                  reservation.id,
                                  "REJECTED",
                                )
                              }
                              disabled={updatingId !== ""}
                              className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">
                            No actions available
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
