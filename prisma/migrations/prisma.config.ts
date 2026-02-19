// Source - https://stackoverflow.com/a/79805716
// Posted by Amrita Pathak, modified by community. See post 'Timeline' for change history
// Retrieved 2026-02-18, License - CC BY-SA 4.0
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"), // mysql://user:pass@host:3306/db
  },
});