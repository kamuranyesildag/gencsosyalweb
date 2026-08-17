import { z } from "zod";
const urlSchema = z.string().url();
console.log(urlSchema.safeParse("/uploads/test.jpg").success);
