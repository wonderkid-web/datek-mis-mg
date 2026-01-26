"use server";

import { prisma } from "./prisma";
import { IspReport, BandwidthType } from "@prisma/client";

export const getIspReports = async () => {
  const ispReports = await prisma.ispReport.findMany({
    include: {
      isp: true, // Include ISP details
    },
    orderBy: {
      reportDate: "desc",
    },
  });
  return ispReports;
};

export const getIspReportById = async (id: number) => {
  const ispReport = await prisma.ispReport.findUnique({
    where: { id },
    include: {
      isp: true,
    },
  });
  return ispReport;
};

export const createIspReport = async (
  data: Omit<IspReport, "id" | "createdAt" | "updatedAt">
) => {
  const { ispId, reportDate, ...rest } = data; // Destructure ispId and reportDate

  const newIspReport = await prisma.ispReport.create({
    data: {
      ...rest,
      reportDate: new Date(reportDate), // Ensure reportDate is a Date object
      isp: {
        connect: {
          id: ispId,
        },
      },
    },
  });
  return newIspReport;
};

export const updateIspReport = async (
  id: number,
  data: Partial<Omit<IspReport, "id" | "createdAt" | "updatedAt">>
) => {
  const { ispId, reportDate, ...rest } = data; // Destructure ispId and reportDate

  const updatedIspReport = await prisma.ispReport.update({
    where: { id },
    data: {
      ...rest,
      ...(reportDate && { reportDate: new Date(reportDate) }),
      ...(ispId && {
        isp: {
          connect: {
            id: ispId,
          },
        },
      }),
    },
  });
  return updatedIspReport;
};

export const deleteIspReport = async (id: number) => {
  return await prisma.ispReport.delete({
    where: { id },
  });
};
