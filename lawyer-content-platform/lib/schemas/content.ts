import { z } from 'zod';

/**
 * 文案 Agent 输入验证
 */
export const contentInputSchema = z.object({
  topic: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    targetAudience: z.string().min(1),
    keywords: z.array(z.string()).min(1),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    estimatedLength: z.number().min(100),
  }),
  positioning: z.object({
    professionalFields: z.array(z.string()),
    targetAudience: z.array(z.string()),
    contentDirection: z.array(z.string()),
    uniqueAdvantages: z.array(z.string()),
    recommendedTopics: z.array(z.string()),
  }),
  style: z.enum(['professional', 'casual', 'educational']).optional().default('professional'),
  length: z.enum(['short', 'medium', 'long']).optional().default('medium'),
});

/**
 * 文案 Agent 输出验证
 */
export const contentOutputSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(100),
  summary: z.string().min(1),
  keywords: z.array(z.string()).min(1),
  sections: z.array(
    z.object({
      heading: z.string().min(1),
      content: z.string().min(1),
    })
  ).min(1),
});

export type ContentInputSchema = z.infer<typeof contentInputSchema>;
export type ContentOutputSchema = z.infer<typeof contentOutputSchema>;
