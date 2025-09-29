import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as meta from "@/db/global/schema/meta";

const pool = new Pool({ connectionString: process.env.POSTGRES_URL! });

export const dbGlobal = drizzle(pool, {
  schema: { ...meta },
});
