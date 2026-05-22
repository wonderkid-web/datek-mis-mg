"use client";

import { Button } from "@/components/ui/button";

export function DeleteDeviceForm(props: {
  hostname: string;
  action: (...args: unknown[]) => Promise<void>;
}) {
  return (
    <form
      action={props.action}
      onSubmit={(event) => {
        const ok = window.confirm(
          `Hapus device "${props.hostname}"? Semua data monitoring device ini akan ikut terhapus.`
        );
        if (!ok) event.preventDefault();
      }}
    >
      <Button type="submit" variant="destructive" size="sm">
        Delete Device
      </Button>
    </form>
  );
}
