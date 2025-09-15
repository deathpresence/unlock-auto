"use server";

import z from "zod";

const authFormSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});
