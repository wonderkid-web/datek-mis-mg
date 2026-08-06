"use client";

import { Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function DeleteScreenshotButton(props: {
  action: (formData: FormData) => void | Promise<void>;
  dateKey: string;
  fileName: string;
  title: string;
  company: string;
  group: string;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive" size="sm">
          <Trash2 data-icon="inline-start" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete screenshot?</AlertDialogTitle>
          <AlertDialogDescription>
            Screenshot {props.title} akan dihapus permanen dari storage server.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={props.action}>
            <input type="hidden" name="date_key" value={props.dateKey} />
            <input type="hidden" name="file_name" value={props.fileName} />
            <input type="hidden" name="company" value={props.company} />
            <input type="hidden" name="group" value={props.group} />
            <AlertDialogAction type="submit">Delete</AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
