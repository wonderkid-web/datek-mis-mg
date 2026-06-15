import { Isp, IspSlaRecord } from "@prisma/client";

export type IspSlaRecordWithIsp = IspSlaRecord & { isp: Isp };
