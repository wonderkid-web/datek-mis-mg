import "server-only";

import sql, { type config as SqlConfig, type ConnectionPool } from "mssql";

const globalForAscend = globalThis as typeof globalThis & {
  ascendSqlPoolPromise?: Promise<ConnectionPool>;
};

function requiredEnvironmentVariable(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Environment variable ${name} belum dikonfigurasi.`);
  }

  return value;
}

function environmentBoolean(name: string, defaultValue: boolean) {
  const value = process.env[name]?.trim().toLowerCase();
  if (value === undefined || value === "") return defaultValue;
  return value === "true" || value === "1" || value === "yes";
}

function getAscendSqlConfig(): SqlConfig {
  const configuredPort = Number(process.env.ASCEND_DB_PORT ?? "1433");

  if (!Number.isInteger(configuredPort) || configuredPort <= 0) {
    throw new Error("ASCEND_DB_PORT harus berupa nomor port yang valid.");
  }

  return {
    server: requiredEnvironmentVariable("ASCEND_DB_SERVER"),
    port: configuredPort,
    database: requiredEnvironmentVariable("ASCEND_DB_DATABASE"),
    user: requiredEnvironmentVariable("ASCEND_DB_USER"),
    password: requiredEnvironmentVariable("ASCEND_DB_PASSWORD"),
    connectionTimeout: 10_000,
    requestTimeout: 30_000,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30_000,
    },
    options: {
      encrypt: environmentBoolean("ASCEND_DB_ENCRYPT", false),
      trustServerCertificate: environmentBoolean(
        "ASCEND_DB_TRUST_SERVER_CERTIFICATE",
        true
      ),
      enableArithAbort: true,
    },
  };
}

export async function getAscendPool() {
  if (!globalForAscend.ascendSqlPoolPromise) {
    const pool = new sql.ConnectionPool(getAscendSqlConfig());

    pool.on("error", () => {
      globalForAscend.ascendSqlPoolPromise = undefined;
    });

    globalForAscend.ascendSqlPoolPromise = pool.connect().catch((error) => {
      globalForAscend.ascendSqlPoolPromise = undefined;
      throw error;
    });
  }

  return globalForAscend.ascendSqlPoolPromise;
}

export { sql as ascendSql };
