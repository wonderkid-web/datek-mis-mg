"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ReleaseRowActionsProps = {
  version: string;
  canManage: boolean;
  isLatest: boolean;
};

type ApiResult = {
  success: boolean;
  message?: string;
  error?: string;
};

async function readApiResult(response: Response): Promise<ApiResult> {
  try {
    return (await response.json()) as ApiResult;
  } catch {
    return {
      success: false,
      error: "Invalid API response",
    };
  }
}

export function ReleaseRowActions({
  version,
  canManage,
  isLatest,
}: ReleaseRowActionsProps) {
  const router = useRouter();
  const [isRenaming, setIsRenaming] = useState(false);
  const [isSetLatest, setIsSetLatest] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [nextVersion, setNextVersion] = useState(version);

  const endpoint = `/api/agent/releases/${encodeURIComponent(version)}`;
  const disabled = !canManage || isRenaming || isSetLatest || isDeleting;

  const handleSetLatest = async () => {
    if (!canManage) {
      toast.error("Hanya administrator yang boleh mengubah release.");
      return;
    }

    if (isLatest) {
      toast(`Versi ${version} sudah menjadi latest release.`);
      return;
    }

    setIsSetLatest(true);
    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_latest" }),
      });
      const result = await readApiResult(response);
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Gagal set latest release.");
      }

      toast.success(result.message || "Latest release berhasil diubah.");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal set latest release."
      );
    } finally {
      setIsSetLatest(false);
    }
  };

  const handleRenameSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canManage) {
      toast.error("Hanya administrator yang boleh mengubah release.");
      return;
    }

    if (!nextVersion.trim()) {
      toast.error("Versi baru wajib diisi.");
      return;
    }

    setIsRenaming(true);
    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "rename",
          version: nextVersion.trim(),
        }),
      });
      const result = await readApiResult(response);
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Gagal rename release.");
      }

      toast.success(result.message || "Release berhasil diubah.");
      setRenameOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal rename release.");
    } finally {
      setIsRenaming(false);
    }
  };

  const deleteRelease = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(endpoint, {
        method: "DELETE",
      });
      const result = await readApiResult(response);
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Gagal menghapus release.");
      }

      toast.success(result.message || "Release berhasil dihapus.");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menghapus release."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = () => {
    if (!canManage) {
      toast.error("Hanya administrator yang boleh menghapus release.");
      return;
    }

    toast("Hapus release ini?", {
      description: `Versi ${version} akan dihapus dari server.`,
      action: {
        label: "Hapus",
        onClick: () => {
          void deleteRelease();
        },
      },
      cancel: {
        label: "Batal",
        onClick: () => {
          return;
        },
      },
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={disabled || isLatest}
        onClick={() => {
          void handleSetLatest();
        }}
      >
        {isSetLatest ? "Saving..." : "Set Latest"}
      </Button>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled}
            onClick={() => setNextVersion(version)}
          >
            Rename
          </Button>
        </DialogTrigger>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Rename Release</DialogTitle>
            <DialogDescription>
              Ubah versi release dari `{version}` ke versi baru.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleRenameSubmit}>
            <div className="space-y-2">
              <Label htmlFor={`release-version-${version}`}>Version baru</Label>
              <Input
                id={`release-version-${version}`}
                value={nextVersion}
                onChange={(event) => setNextVersion(event.target.value)}
                disabled={isRenaming}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setRenameOpen(false)}
                disabled={isRenaming}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isRenaming}>
                {isRenaming ? "Saving..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Button
        type="button"
        size="sm"
        variant="destructive"
        disabled={disabled}
        onClick={handleDelete}
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </Button>
    </div>
  );
}
