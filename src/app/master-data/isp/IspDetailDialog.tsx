"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IspClient } from "./page";
import Link from "next/link";

interface IspDetailDialogProps {
  isp: IspClient | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function IspDetailDialog({
  isp,
  isOpen,
  onOpenChange,
}: IspDetailDialogProps) {
  if (!isp) return null;

  const detailRows = [
    { label: "ISP Name", value: isp.isp },
    { label: "AS Number", value: isp.asNumber },
    { label: "Product / Service", value: isp.productService },
    { label: "IP Public", value: isp.ipPublic },
    { label: "Address", value: isp.address },
    {
      label: "Maps",
      value: isp.maps ? (
        <Link href={isp.maps} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          Link Maps
        </Link>
      ) : (
        "N/A"
      ),
    },
    { label: "POP", value: isp.pop },
    { label: "Transmisi", value: isp.transmisi },
    { label: "SLA", value: isp.sla },
    { label: "PIC NOC", value: isp.picNoc },
    { label: "HP NOC", value: isp.hpNoc },
    { label: "PRTG", value: isp.prtg },
    { label: "Username", value: isp.username },
    { label: "Password", value: isp.password ? "********" : "N/A" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ISP Details</DialogTitle>
        </DialogHeader>
        <div className="border rounded-lg">
          <table className="w-full text-sm">
            <tbody>
              {detailRows.map((row) => (
                <tr key={row.label} className="border-b last:border-b-0">
                  <td className="w-1/3 px-4 py-3 font-semibold align-top">{row.label}</td>
                  <td className="px-4 py-3 whitespace-pre-line">
                    {row.value || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
