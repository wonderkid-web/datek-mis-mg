"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type UploadReleaseFormProps = {
  canUpload: boolean;
};

function formatBytes(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  let size = value;
  let index = 0;

  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }

  return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

export function UploadReleaseForm({ canUpload }: UploadReleaseFormProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [version, setVersion] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [releaseNotes, setReleaseNotes] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelection = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!file.name.toLowerCase().endsWith(".exe")) {
      toast.error("Hanya file .exe yang diperbolehkan.");
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canUpload) {
      toast.error("Hanya administrator yang boleh upload release.");
      return;
    }

    if (!version.trim()) {
      toast.error("Versi release wajib diisi.");
      return;
    }

    if (!selectedFile) {
      toast.error("Pilih file .exe terlebih dulu.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.set("version", version.trim());
      formData.set("file", selectedFile);
      formData.set("release_notes", releaseNotes.trim());

      const response = await fetch("/api/agent/releases/upload", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as {
        success: boolean;
        error?: string;
        message?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Upload release gagal.");
      }

      toast.success(result.message || "Release observer agent berhasil diupload.");
      setSelectedFile(null);
      setVersion("");
      setReleaseNotes("");
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Upload release gagal diproses."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Release</CardTitle>
        <CardDescription>
          Upload file `.exe` observer agent terbaru ke server untuk disimpan di folder release.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="observer-agent-version">Version</Label>
            <Input
              id="observer-agent-version"
              placeholder="Contoh: 0.1.4"
              value={version}
              onChange={(event) => setVersion(event.target.value)}
              disabled={!canUpload || isUploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observer-agent-release-notes">Release Notes</Label>
            <Textarea
              id="observer-agent-release-notes"
              placeholder="Opsional: catatan perubahan release"
              value={releaseNotes}
              onChange={(event) => setReleaseNotes(event.target.value)}
              disabled={!canUpload || isUploading}
            />
          </div>

          <div className="space-y-2">
            <Label>File Release</Label>
            <div
              className={`rounded-lg border border-dashed p-6 text-center transition ${
                isDragging ? "border-emerald-500 bg-emerald-50" : "border-slate-300"
              }`}
              onDragOver={(event) => {
                event.preventDefault();
                if (!canUpload || isUploading) return;
                setIsDragging(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setIsDragging(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                if (!canUpload || isUploading) return;

                const file = event.dataTransfer.files?.[0] ?? null;
                handleFileSelection(file);
              }}
            >
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Drag & drop file `.exe` di sini
                </p>
                <p className="text-xs text-muted-foreground">
                  atau klik tombol di bawah untuk memilih file release terbaru
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".exe"
                  className="hidden"
                  onChange={(event) =>
                    handleFileSelection(event.target.files?.[0] ?? null)
                  }
                  disabled={!canUpload || isUploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => inputRef.current?.click()}
                  disabled={!canUpload || isUploading}
                >
                  Pilih File
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-md border bg-slate-50 p-3 text-sm">
            {selectedFile ? (
              <div className="space-y-1">
                <div className="font-medium">{selectedFile.name}</div>
                <div className="text-muted-foreground">
                  {formatBytes(selectedFile.size)}
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">
                Belum ada file release yang dipilih.
              </div>
            )}
          </div>

          {!canUpload && (
            <p className="text-sm text-red-600">
              Hanya user dengan role administrator yang bisa upload release.
            </p>
          )}

          <Button type="submit" disabled={!canUpload || isUploading}>
            {isUploading ? "Uploading..." : "Upload Release"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
