import { z } from 'zod';

/**
 * 选题 Agent 输入验证
 */
export const topicInputSchema = z.object({
  positioning: z.object({
    professionalFields: z.array(z.string()),
    targetAudience: z.array(z.string()),
    contentDirection: z.array(z.string()),
    uniqueAdvantages: z.array(z.string()),
    recommendedTopics: z.array(z.string()),
  }),
  count: z.number().min(1).max(10).optional().default(3),
});

/**
 * 选题 Agent 输出验证
 */
export const topicOutputSchema = z.object({
  topics: z.array(
    z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      targetAudience: z.string().min(1),
      keywords: z.array(z.string()).min(1),
      difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
      estimatedLength: z.number().min(100),
    })
  ).min(1),
});

export type TopicInputSchema = z.infer<typeof topicInputSchema>;
export type TopicOutputSchema = z.infer<typeof topicOutputSchema>;
