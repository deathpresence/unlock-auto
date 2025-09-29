import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin, organization } from "better-auth/plugins";
import * as schema from "@/db/global/schema/index";
import { dbGlobal } from "@/lib/postgres";
import { ensureTenantDb } from "@/lib/tenant/registry";

export const auth = betterAuth({
  database: drizzleAdapter(dbGlobal, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    database: {
      generateId: false,
    },
  },
  plugins: [
    admin(),
    organization({
      organizationHooks: {
        async afterCreateOrganization({ organization }) {
          await ensureTenantDb(organization.id, organization.slug);
        },
      },
    }),
    nextCookies(),
  ],
});
