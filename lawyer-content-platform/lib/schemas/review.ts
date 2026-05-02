import { z } from 'zod';

/**
 * 审查 Agent 输入验证
 */
export const reviewInputSchema = z.object({
  content: z.object({
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
  }),
  positioning: z.object({
    professionalFields: z.array(z.string()),
    targetAudience: z.array(z.string()),
    contentDirection: z.array(z.string()),
    uniqueAdvantages: z.array(z.string()),
    recommendedTopics: z.array(z.string()),
  }),
});

/**
 * 审查 Agent 输出验证
 */
export const reviewOutputSchema = z.object({
  approved: z.boolean(),
  score: z.number().min(0).max(100),
  issues: z.array(
    z.object({
      type: z.enum(['compliance', 'risk', 'quality', 'accuracy']),
      severity: z.enum(['low', 'medium', 'high']),
      description: z.string().min(1),
      suggestion: z.string().min(1),
    })
  ),
  suggestions: z.array(z.string()),
  needsRewrite: z.boolean(),
});

/**
 * 改写 Agent 输入验证
 */
export const rewriteInputSchema = z.object({
  content: z.object({
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
  }),
  reviewFeedback: z.object({
    approved: z.boolean(),
    score: z.number().min(0).max(100),
    issues: z.array(
      z.object({
        type: z.enum(['compliance', 'risk', 'quality', 'accuracy']),
        severity: z.enum(['low', 'medium', 'high']),
        description: z.string().min(1),
        suggestion: z.string().min(1),
      })
    ),
    suggestions: z.array(z.string()),
    needsRewrite: z.boolean(),
  }),
  positioning: z.object({
    professionalFields: z.array(z.string()),
    targetAudience: z.array(z.string()),
    contentDirection: z.array(z.string()),
    uniqueAdvantages: z.array(z.string()),
    recommendedTopics: z.array(z.string()),
  }),
});

/**
 * 改写 Agent 输出验证
 */
export const rewriteOutputSchema = z.object({
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
  changes: z.array(
    z.object({
      type: z.string().min(1),
      description: z.string().min(1),
    })
  ),
});

export type ReviewInputSchema = z.infer<typeof reviewInputSchema>;
export type ReviewOutputSchema = z.infer<typeof reviewOutputSchema>;
export type RewriteInputSchema = z.infer<typeof rewriteInputSchema>;
export type RewriteOutputSchema = z.infer<typeof rewriteOutputSchema>;
