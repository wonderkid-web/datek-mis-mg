"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";

type DeviceSearchFormProps = {
  query: string;
  groupBy: "none" | "version" | "location" | "status";
};

export function DeviceSearchForm({ query, groupBy }: DeviceSearchFormProps) {
  const router = useRouter();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const search = new URLSearchParams();
    const nextQuery = String(formData.get("q") ?? "").trim();
    const nextGroupBy = String(formData.get("groupBy") ?? "none");

    if (nextQuery) search.set("q", nextQuery);
    if (nextGroupBy !== "none") search.set("groupBy", nextGroupBy);

    const queryString = search.toString();
    router.push(
      queryString ? `/tracker/observer-agent?${queryString}` : "/tracker/observer-agent",
      { scroll: false }
    );
  }

  function resetSearch() {
    router.push("/tracker/observer-agent", { scroll: false });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end justify-end gap-2">
      <input
        type="search"
        name="q"
        defaultValue={query}
        placeholder="Cari hostname, user, IP, MAC, versi…"
        className="h-9 w-full rounded-md border bg-transparent px-3 text-sm sm:w-72"
      />
      <div className="grid gap-1">
        <label htmlFor="device-group-by" className="text-xs text-muted-foreground">
          Grouping
        </label>
        <select
          id="device-group-by"
          name="groupBy"
          defaultValue={groupBy}
          className="h-9 rounded-md border bg-transparent px-3 text-sm"
        >
          <option value="none">Tanpa grouping</option>
          <option value="version">Version</option>
          <option value="location">Location</option>
          <option value="status">Status</option>
        </select>
      </div>
      <Button type="submit" size="sm" variant="outline">
        <Search data-icon="inline-start" />
        Cari
      </Button>
      {query ? (
        <Button type="button" size="sm" variant="ghost" onClick={resetSearch}>
          Reset
        </Button>
      ) : null}
    </form>
  );
}
