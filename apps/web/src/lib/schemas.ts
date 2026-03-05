import { z } from "zod";

export const platformSchema = z.enum(["tiktok", "instagram", "youtube"]);

export const analyzeInputSchema = z.object({
  platform: platformSchema,
  caption: z.string().min(1).max(2200),
  transcript: z.string().max(20000).optional().nullable(),
});

export const analysisSchema = z.object({
  id: z.number().int(),
  platform: platformSchema,
  caption: z.string(),
  transcript: z.string().nullable(),
  hook_strength_0_1: z.number(),
  topic_clarity_0_1: z.number(),
  niche_specificity_0_1: z.number(),
  cta_strength_0_1: z.number(),
  transcript_clarity_0_1: z.number(),
  predicted_score: z.number(),
  stage1_pass_prob: z.number(),
  stage2_pass_prob: z.number(),
  viral_prob: z.number(),
  top_recommendations: z.array(z.string()),
  rewritten_caption: z.string(),
  hook_options: z.array(z.string()).length(3),
  why_this_score: z.string(),
  created_at: z.string(),
});

export const analysesSchema = z.array(analysisSchema);

export type Platform = z.infer<typeof platformSchema>;
export type AnalyzeInput = z.infer<typeof analyzeInputSchema>;
export type Analysis = z.infer<typeof analysisSchema>;
