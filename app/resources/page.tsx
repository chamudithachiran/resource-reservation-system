
"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

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

  const loadResources = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/resources", {
        cache: "no-store",
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load resources.");
      }

      setResources(result.data);
    } catch {
      setError("Resources load කරන්න බැරි වුණා. නැවත උත්සාහ කරන්න.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadResources();
  }, [loadResources]);

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
      setError("Capacity එක 1 හෝ ඊට වැඩි පූර්ණ සංඛ්‍යාවක් විය යුතුයි.");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          type: form.type,
          location: form.location,
          description: form.description,
          capacity,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Resource එක save කරන්න බැරි වුණා.");
      }

      setResources((current) => [result.data, ...current]);
      setForm(initialForm);
      setShowForm(false);
      setMessage("Resource එක සාර්ථකව එකතු කළා!");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Resource එක save කරන්න බැරි වුණා.",
      );
    } finally {
      setSaving(false);
    }
  }

  const filteredResources = resources.filter((resource) => {
    const query = search.toLowerCase();

    return (
      resource.name.toLowerCase().includes(query) ||
      resource.type.toLowerCase().includes(query) ||
      (resource.location ?? "").toLowerCase().includes(query)
    );
  });

  return (
    <main className="min-h-screen bg-[#f7f8fc] px-4 py-6 text-slate-800 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <a
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-800"
        >
          ← Back to Dashboard
        </a>

        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-xs font-bold tracking-[0.18em] text-violet-600">
              WORKSPACE / MANAGEMENT
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Resources
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage rooms, equipment and other reservable resources.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setMessage("");
              setError("");
              setShowForm((current) => !current);
            }}
            className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
          >
            {showForm ? "Cancel" : "+ Add Resource"}
          </button>
        </header>

        {message && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
          >
            {error}
          </div>
        )}

        {showForm && (
          <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="mb-1 text-lg font-bold text-slate-900">
              Add a new resource
            </h2>
            <p className="mb-6 text-sm text-slate-500">
              Enter the details of the resource you want to register.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Resource name *
                  <input
                    required
                    maxLength={120}
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    placeholder="e.g. Conference Room A"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Resource type *
                  <select
                    required
                    value={form.type}
                    onChange={(event) =>
                      setForm({ ...form, type: event.target.value })
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  >
                    <option>Meeting Room</option>
                    <option>Equipment</option>
                    <option>Laboratory</option>
                    <option>Vehicle</option>
                    <option>Workspace</option>
                    <option>Other</option>
                  </select>
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Location
                  <input
                    maxLength={200}
                    value={form.location}
                    onChange={(event) =>
                      setForm({ ...form, location: event.target.value })
                    }
                    placeholder="e.g. Floor 2, Building A"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Capacity
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.capacity}
                    onChange={(event) =>
                      setForm({ ...form, capacity: event.target.value })
                    }
                    placeholder="e.g. 12"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  />
                </label>
              </div>

              <label className="block text-sm font-medium text-slate-700">
                Description
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Describe the resource and its facilities..."
                  className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
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
                  className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Resources</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {resources.length}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Available</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {resources.filter((resource) => resource.isAvailable).length}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Currently Unavailable</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">
              {resources.filter((resource) => !resource.isAvailable).length}
            </p>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6">
            <div>
              <h2 className="font-bold text-slate-900">Resource Directory</h2>
              <p className="mt-1 text-sm text-slate-500">
                {resources.length} registered resource
                {resources.length === 1 ? "" : "s"}
              </p>
            </div>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search resources..."
              aria-label="Search resources"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100 sm:max-w-xs"
            />
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-slate-500">
              Loading resources...
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-2xl text-violet-600">
                ▦
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">
                {search ? "No matching resources" : "No resources yet"}
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                {search
                  ? "Try another search term."
                  : "Add your first resource to start managing your lab rooms and equipment."}
              </p>
              {!search && (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="mt-5 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700"
                >
                  + Add your first resource
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead className="bg-slate-50">
                  <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4">Resource</th>
                    <th className="px-4 py-4">Type</th>
                    <th className="px-4 py-4">Location</th>
                    <th className="px-4 py-4">Capacity</th>
                    <th className="px-4 py-4">Availability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredResources.map((resource) => (
                    <tr key={resource.id} className="hover:bg-slate-50/70">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">
                          {resource.name}
                        </p>
                        {resource.description && (
                          <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                            {resource.description}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {resource.type}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {resource.location || "—"}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {resource.capacity ?? "—"}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                            resource.isAvailable
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
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

        <p className="mt-6 text-center text-xs text-slate-400">
          PrimeWave Lab · Resource Management
        </p>
      </div>
    </main>
  );
}
