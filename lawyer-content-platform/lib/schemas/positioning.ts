import { z } from 'zod';

/**
 * 定位 Agent 输入验证
 */
export const positioningInputSchema = z.object({
  name: z.string().min(1, '律师姓名不能为空'),
  experience: z.string().min(1, '执业经验不能为空'),
  expertise: z.array(z.string()).min(1, '至少需要一个专业领域'),
  targetAudience: z.string().optional(),
  goals: z.string().optional(),
});

/**
 * 定位 Agent 输出验证
 */
export const positioningOutputSchema = z.object({
  professionalFields: z.array(z.string()).min(1),
  targetAudience: z.array(z.string()).min(1),
  contentDirection: z.array(z.string()).min(1),
  uniqueAdvantages: z.array(z.string()).min(1),
  recommendedTopics: z.array(z.string()).min(1),
});

export type PositioningInputSchema = z.infer<typeof positioningInputSchema>;
export type PositioningOutputSchema = z.infer<typeof positioningOutputSchema>;
