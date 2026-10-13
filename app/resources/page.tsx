
"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Resource = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  location: string | null;
  capacity: number | null;
  isAvailable: boolean;
  createdAt: string;
};

type ResourceForm = {
  name: string;
  type: string;
  location: string;
  capacity: string;
  description: string;
};

const initialForm: ResourceForm = {
  name: "",
  type: "Meeting Room",
  location: "",
  capacity: "",
  description: "",
};

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [form, setForm] = useState<ResourceForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchInitialResources() {
      try {
        const response = await fetch("/api/resources", {
          cache: "no-store",
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load resources.");
        }

        if (active) {
          setResources(result.data);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load resources. Please try again.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchInitialResources();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const capacity =
      form.capacity.trim() === "" ? null : Number(form.capacity);

    if (
      capacity !== null &&
      (!Number.isInteger(capacity) || capacity < 1)
    ) {
      setError("Capacity must be a positive whole number.");
      setSaving(false);
      return;
    }

    if (!form.name.trim()) {
      setError("Please enter a resource name.");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          type: form.type,
          location: form.location.trim(),
          description: form.description.trim(),
          capacity,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to save resource.");
      }

      setResources((current) => [result.data, ...current]);
      setForm(initialForm);
      setShowForm(false);
      setMessage("Resource added successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save resource. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  const filteredResources = resources.filter((resource) => {
    const query = search.toLowerCase().trim();

    return (
      resource.name.toLowerCase().includes(query) ||
      resource.type.toLowerCase().includes(query) ||
      (resource.location ?? "").toLowerCase().includes(query)
    );
  });

  return (
    <main className="min-h-screen bg-[#f7f8fc] px-4 py-6 text-slate-800 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-800"
        >
          <span aria-hidden="true">←</span>
          Back to Dashboard
        </Link>

        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-violet-600">
              Resource Management
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Resources
            </h1>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Manage rooms and other resources available for reservations.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowForm((current) => !current);
              setMessage("");
              setError("");
            }}
            className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
          >
            {showForm ? "Cancel" : "+ Add Resource"}
          </button>
        </header>

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Resources
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {resources.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Available Resources
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {resources.filter((resource) => resource.isAvailable).length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Resource Types
            </p>
            <p className="mt-2 text-3xl font-bold text-violet-600">
              {new Set(resources.map((resource) => resource.type)).size}
            </p>
          </div>
        </section>

        {message && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {showForm && (
          <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="mb-6 text-xl font-bold text-slate-900">
              Add New Resource
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="resource-name"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Resource Name *
                  </label>
                  <input
                    id="resource-name"
                    name="name"
                    required
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    placeholder="e.g. Meeting Room A"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="resource-type"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Resource Type *
                  </label>
                  <select
                    id="resource-type"
                    name="type"
                    required
                    value={form.type}
                    onChange={(event) =>
                      setForm({ ...form, type: event.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  >
                    <option value="Meeting Room">Meeting Room</option>
                    <option value="Conference Room">Conference Room</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Workspace">Workspace</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="resource-location"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Location
                  </label>
                  <input
                    id="resource-location"
                    name="location"
                    value={form.location}
                    onChange={(event) =>
                      setForm({ ...form, location: event.target.value })
                    }
                    placeholder="e.g. Floor 2, Room 201"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="resource-capacity"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Capacity
                  </label>
                  <input
                    id="resource-capacity"
                    name="capacity"
                    type="number"
                    min="1"
                    step="1"
                    value={form.capacity}
                    onChange={(event) =>
                      setForm({ ...form, capacity: event.target.value })
                    }
                    placeholder="e.g. 10"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="resource-description"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Description
                  </label>
                  <textarea
                    id="resource-description"
                    name="description"
                    rows={3}
                    value={form.description}
                    onChange={(event) =>
                      setForm({ ...form, description: event.target.value })
                    }
                    placeholder="Add details about this resource..."
                    className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Resource"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setForm(initialForm);
                    setError("");
                  }}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                All Resources
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredResources.length} resource
                {filteredResources.length === 1 ? "" : "s"} found
              </p>
            </div>

            <div className="w-full sm:max-w-sm">
              <label htmlFor="resource-search" className="sr-only">
                Search resources
              </label>
              <input
                id="resource-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, type, or location..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
            </div>
          </div>

          {loading ? (
            <div className="px-5 py-16 text-center text-sm text-slate-500">
              Loading resources...
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 text-xl text-violet-600">
                ◇
              </div>
              <h3 className="font-semibold text-slate-900">
                {search ? "No matching resources" : "No resources yet"}
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                {search
                  ? "Try a different search term."
                  : "Add your first resource to get started."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Resource</th>
                    <th className="px-5 py-4 font-semibold">Type</th>
                    <th className="px-5 py-4 font-semibold">Location</th>
                    <th className="px-5 py-4 font-semibold">Capacity</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredResources.map((resource) => (
                    <tr
                      key={resource.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">
                          {resource.name}
                        </p>
                        {resource.description && (
                          <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                            {resource.description}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {resource.type}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {resource.location || "—"}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {resource.capacity ?? "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            resource.isAvailable
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {resource.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="mt-6 text-center text-xs text-slate-400">
          PrimeWave Lab Resource Reservation Management System
        </footer>
      </div>
    </main>
  );
}
