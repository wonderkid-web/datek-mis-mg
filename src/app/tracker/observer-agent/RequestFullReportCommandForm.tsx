"use client";

import { Button } from "@/components/ui/button";

export function RequestFullReportCommandForm(props: {
  action: (formData: FormData) => void | Promise<void>;
  label: string;
  confirmMessage: string;
  disabled?: boolean;
}) {
  return (
    <form
      action={props.action}
      onSubmit={(event) => {
        if (!window.confirm(props.confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      <Button type="submit" size="sm" disabled={props.disabled}>
        {props.label}
      </Button>
    </form>
  );
}
