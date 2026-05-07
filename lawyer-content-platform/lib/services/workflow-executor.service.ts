/**
 * WorkflowExecutor - 工作流执行服务
 * 负责执行完整的 AI 内容生成工作流
 */

import { DataAgent } from '../agents/dataAgent';
import { ProfileAgent } from '../agents/profileAgent';
import { TopicAgent } from '../agents/topicAgent';
import { ScriptAgent } from '../agents/scriptAgent';
import { ReadabilityReviewAgent } from '../agents/readabilityReviewAgent';
import { RiskReviewAgent } from '../agents/riskReviewAgent';
import { RewriteAgent } from '../agents/rewriteAgent';
import { SupervisorAgent } from '../agents/supervisorAgent';
import { WorkflowService } from './workflow.service';
import type { AgentState } from '../schemas/agentStateSchema';
import type { WorkflowStep } from '../agents/supervisorAgent';

export interface WorkflowExecutionResult {
  success: boolean;
  agentRunId: string;
  finalState: AgentState;
  error?: string;
  scriptData?: {
    title: string;
    body: string;
    hook: string;
    cta: string;
  };
}

export interface WorkflowExecutionInput {
  clientId: string;
  industryId?: string;
  topicId?: string;
  customDirection?: string;
}

/**
 * 工作流执行器类
 */
export class WorkflowExecutor {
  private workflowService: WorkflowService;
  private dataAgent: DataAgent;
  private profileAgent: ProfileAgent;
  private topicAgent: TopicAgent;
  private scriptAgent: ScriptAgent;
  private readabilityAgent: ReadabilityReviewAgent;
  private riskAgent: RiskReviewAgent;
  private rewriteAgent: RewriteAgent;
  private supervisor: SupervisorAgent;

  constructor() {
    this.workflowService = new WorkflowService();
    this.dataAgent = new DataAgent();
    this.profileAgent = new ProfileAgent();
    this.topicAgent = new TopicAgent();
    this.scriptAgent = new ScriptAgent();
    this.readabilityAgent = new ReadabilityReviewAgent();
    this.riskAgent = new RiskReviewAgent();
    this.rewriteAgent = new RewriteAgent();
    this.supervisor = new SupervisorAgent();
  }

  /**
   * 执行完整的工作流
   */
  async execute(input: WorkflowExecutionInput): Promise<WorkflowExecutionResult> {
    const startTime = Date.now();

    // 创建 Agent Run 记录
    const agentRunId = await this.workflowService.createAgentRun({
      clientId: input.clientId,
      industryId: input.industryId,
      taskType: 'content_generation',
      inputSummary: input.customDirection || `Topic ID: ${input.topicId}`,
      internalOnly: false,
    });

    console.log(`[WorkflowExecutor] 开始执行工作流, Agent Run ID: ${agentRunId}`);

    try {
      // 更新状态为 running
      await this.workflowService.updateAgentRunStatus(agentRunId, 'running');

      // 初始化状态
      let state: AgentState = {
        clientId: input.clientId,
        industryId: input.industryId || '',
        status: 'running',
        logs: [],
        reviews: [],
        rewriteCount: 0,
        maxRewriteCount: 3,
      };

      // 将自定义方向和选题 ID 存储在 logs 中，供 Agent 使用
      if (input.customDirection) {
        state.logs.push(`[Input] Custom Direction: ${input.customDirection}`);
      }
      if (input.topicId) {
        state.logs.push(`[Input] Topic ID: ${input.topicId}`);
      }

      let currentStep: WorkflowStep = 'data_collection';
      let stepCount = 0;

      // 工作流循环
      while (currentStep !== 'completed' && currentStep !== 'failed') {
        stepCount++;
        console.log(`[WorkflowExecutor] 步骤 ${stepCount}: ${currentStep}`);

        const stepStartTime = Date.now();

        try {
          // 创建步骤记录
          const stepId = await this.workflowService.createAgentRunStep({
            agentRunId,
            agentName: currentStep,
            role: this.getStepRole(currentStep),
            inputPayload: this.getStepInput(state, currentStep),
          });

          // 更新步骤状态为 running
          await this.workflowService.updateAgentRunStepStatus(stepId, 'running');

          // 执行步骤
          const stepResult = await this.executeStep(currentStep, state);
          state = { ...state, ...stepResult };

          const stepDuration = Date.now() - stepStartTime;
          console.log(`[WorkflowExecutor] 步骤完成，耗时: ${(stepDuration / 1000).toFixed(2)}s`);

          // 更新步骤状态为 completed
          await this.workflowService.updateAgentRunStepOutput(
            stepId,
            this.getStepOutput(state, currentStep),
            'completed'
          );

          // 使用 Supervisor 决定下一步
          const decision = await this.supervisor.execute(state);
          currentStep = decision.nextAgent;
          console.log(`[WorkflowExecutor] 下一步: ${currentStep} - ${decision.reason}`);

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '未知错误';
          console.error(`[WorkflowExecutor] 步骤执行失败: ${errorMessage}`);
          state.error = errorMessage;
          currentStep = 'failed';
        }
      }

      // 工作流完成
      const totalDuration = Date.now() - startTime;
      console.log(`[WorkflowExecutor] 工作流完成，总耗时: ${(totalDuration / 1000).toFixed(2)}s`);

      if (currentStep === 'completed' && state.draftScript) {
        // 成功完成 - 保存脚本到数据库
        await this.workflowService.updateAgentRunOutput(
          agentRunId,
          `成功生成文案: ${state.draftScript.title}`,
          'completed'
        );

        // 保存生成的脚本到 scripts 表
        try {
          // 注意：selectedTopic.id 是临时生成的字符串（如 "topic-1"），不是数据库中的 UUID
          // 因为选题目前不持久化，所以 topicId 设置为 undefined（数据库中存储为 null）
          const scriptId = await this.workflowService.createScript({
            clientId: input.clientId,
            topicId: undefined, // 选题不持久化，不保存 topic_id
            title: state.draftScript.title,
            hook: state.draftScript.hook,
            body: state.draftScript.body,
            cta: state.draftScript.cta,
            visibleToClient: true,
          });
          console.log(`[WorkflowExecutor] 脚本已保存到数据库，ID: ${scriptId}`);
        } catch (scriptError) {
          console.error(`[WorkflowExecutor] 保存脚本失败:`, scriptError);
          // 不阻止工作流完成，只记录错误
        }

        return {
          success: true,
          agentRunId,
          finalState: state,
          scriptData: {
            title: state.draftScript.title,
            body: state.draftScript.body || '',
            hook: state.draftScript.hook || '',
            cta: state.draftScript.cta || '',
          },
        };
      } else {
        // 失败
        const errorMessage = state.error || '工作流未能完成';
        await this.workflowService.updateAgentRunStatus(
          agentRunId,
          'failed',
          errorMessage
        );

        return {
          success: false,
          agentRunId,
          finalState: state,
          error: errorMessage,
        };
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      console.error(`[WorkflowExecutor] 工作流执行失败: ${errorMessage}`);

      // 更新 Agent Run 状态为 failed
      await this.workflowService.updateAgentRunStatus(
        agentRunId,
        'failed',
        errorMessage
      );

      return {
        success: false,
        agentRunId,
        finalState: {} as AgentState,
        error: errorMessage,
      };
    }
  }

  /**
   * 执行单个步骤
   */
  private async executeStep(
    step: WorkflowStep,
    state: AgentState
  ): Promise<Partial<AgentState>> {
    switch (step) {
      case 'data_collection':
        return await this.dataAgent.execute(state);

      case 'profile_generation':
        return await this.profileAgent.execute(state);

      case 'topic_generation':
        return await this.topicAgent.execute(state);

      case 'script_generation':
        return await this.scriptAgent.execute(state);

      case 'readability_review':
        return await this.readabilityAgent.execute(state);

      case 'risk_review':
        return await this.riskAgent.execute(state);

      case 'rewrite':
        const result = await this.rewriteAgent.execute(state);
        // 重写后清空审查结果，需要重新审查
        return { ...result, reviews: [] };

      default:
        throw new Error(`未知步骤: ${step}`);
    }
  }

  /**
   * 获取步骤角色
   */
  private getStepRole(step: WorkflowStep): string {
    const roleMap: Record<WorkflowStep, string> = {
      data_collection: 'data_collector',
      profile_generation: 'profile_generator',
      topic_generation: 'topic_generator',
      script_generation: 'script_generator',
      readability_review: 'readability_reviewer',
      risk_review: 'risk_reviewer',
      rewrite: 'rewriter',
      completed: 'completed',
      failed: 'failed',
    };
    return roleMap[step] || 'unknown';
  }

  /**
   * 获取步骤输入
   */
  private getStepInput(state: AgentState, step: WorkflowStep): Record<string, unknown> {
    return {
      step,
      clientId: state.clientId,
      industryId: state.industryId,
      hasIndustryTemplate: !!state.industryTemplate,
      hasClientProfile: !!state.clientProfile,
      hasContentPosition: !!state.contentPosition,
      hasSelectedTopic: !!state.selectedTopic,
      hasDraftScript: !!state.draftScript,
      reviewCount: state.reviews.length,
      rewriteCount: state.rewriteCount,
    };
  }

  /**
   * 获取步骤输出
   */
  private getStepOutput(state: AgentState, step: WorkflowStep): Record<string, unknown> {
    const output: Record<string, unknown> = {
      step,
      status: state.status,
    };

    switch (step) {
      case 'data_collection':
        output.hasIndustryTemplate = !!state.industryTemplate;
        output.hasClientProfile = !!state.clientProfile;
        break;

      case 'profile_generation':
        output.hasContentPosition = !!state.contentPosition;
        if (state.contentPosition) {
          output.expertiseAreas = (state.contentPosition as any).expertise_areas;
          output.targetAudience = (state.contentPosition as any).target_audience;
        }
        break;

      case 'topic_generation':
        output.hasSelectedTopic = !!state.selectedTopic;
        if (state.selectedTopic) {
          output.topicTitle = (state.selectedTopic as any).title;
          output.topicScore = (state.selectedTopic as any).scores?.total;
        }
        break;

      case 'script_generation':
        output.hasDraftScript = !!state.draftScript;
        if (state.draftScript) {
          output.scriptTitle = state.draftScript.title;
          output.scriptLength = state.draftScript.body?.length || 0;
        }
        break;

      case 'readability_review':
      case 'risk_review':
        const review = state.reviews[state.reviews.length - 1];
        if (review) {
          output.reviewType = review.review_type;
          output.passed = review.passed;
          output.score = review.score;
          output.issueCount = (review.issues as any)?.length || 0;
        }
        break;

      case 'rewrite':
        output.rewriteCount = state.rewriteCount;
        if (state.draftScript) {
          output.newTitle = state.draftScript.title;
        }
        break;
    }

    return output;
  }
}

/**
 * 创建工作流执行器实例
 */
export function createWorkflowExecutor(): WorkflowExecutor {
  return new WorkflowExecutor();
}
