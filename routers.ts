import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "../shared/const";
import { generateChatResponse } from "./services/chat";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

const chatTurnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(2000),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  ai: router({
    chat: publicProcedure
      .input(z.object({ messages: z.array(chatTurnSchema).min(1).max(20) }))
      .mutation(async ({ input }) => {
        try {
          const content = await generateChatResponse(input.messages);
          return { content };
        } catch (error) {
          console.error("[AI chat] Generation failed", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "The assistant is temporarily unavailable. Please try again shortly.",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
