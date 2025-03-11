import { DeepSeekService } from './deepseek';
import { UserFitnessInfo, TrainingPlan } from '../interfaces/training';
import { TrainingPlanModel } from '../models/training-plan.model';

export class TrainingPlanService {
  private deepseek: DeepSeekService;

  constructor() {
    this.deepseek = new DeepSeekService({
      apiKey: process.env.DEEPSEEK_API_KEY || '',
    });
  }

  private generatePrompt(userInfo: UserFitnessInfo): string {
    return `作为一位专业的健身教练，请根据以下用户信息制定一份详细的训练计划：

基本信息：
- 年龄：${userInfo.age}岁
- 性别：${userInfo.gender === 'male' ? '男' : '女'}
- 体重：${userInfo.weight}kg
- 身高：${userInfo.height}cm
- 健身水平：${userInfo.fitnessLevel}
- 训练目标：${userInfo.goal}
- 每周训练频率：${userInfo.daysPerWeek}天
${userInfo.healthIssues?.length ? `- 健康问题：${userInfo.healthIssues.join(', ')}` : ''}
${userInfo.preferredExercises?.length ? `- 偏好运动：${userInfo.preferredExercises.join(', ')}` : ''}

请提供：
1. 整体训练计划概述
2. 详细的每周训练安排，包括具体动作、组数、次数和休息时间
3. 营养建议，包括每日卡路里和宏量素分配
4. 注意事项和建议

请以JSON格式返回，包含以下字段：
{
  "overview": "整体计划概述",
  "weeklySchedule": [具体训练安排],
  "nutrition": {营养建议},
  "tips": [注意事项]
}`;
  }

  private convertToMarkdown(plan: TrainingPlan): string {
    let markdown = `# 个性化训练计划\n\n`;
    // 添加概述
    markdown += `## 整体计划概述\n\n${plan.overview}\n\n`;
    // 添加每周训练安排
    markdown += `## 每周训练安排\n\n`;
    plan.weeklySchedule.forEach((day) => {
      markdown += `### ${day.day}\n\n`;
      day.exercises.forEach((exercise) => {
        markdown += `#### ${exercise.name}\n`;
        markdown += `- 组数：${exercise.sets}\n`;
        markdown += `- 次数：${exercise.reps}\n`;
        markdown += `- 休息时间：${exercise.rest}\n`;
        if (exercise.notes) {
          markdown += `- 注意事项：${exercise.notes}\n`;
        }
        markdown += '\n';
      });
    });

    // 添加营养建议
    markdown += `## 营养建议\n\n`;
    markdown += `### 每日摄入量\n`;
    markdown += `- 总热量：${plan.nutrition.dailyCalories} 卡路里\n\n`;
    markdown += `### 宏量素分配\n`;
    markdown += `- 蛋白质：${plan.nutrition.macros.protein}g\n`;
    markdown += `- 碳水化合物：${plan.nutrition.macros.carbs}g\n`;
    markdown += `- 脂肪：${plan.nutrition.macros.fats}g\n\n`;
    markdown += `### 营养建议\n`;
    plan.nutrition.recommendations.forEach((rec) => {
      markdown += `- ${rec}\n`;
    });
    markdown += '\n';

    // 添加注意事项
    markdown += `## 注意事项\n\n`;
    plan.tips.forEach((tip) => {
      markdown += `- ${tip}\n`;
    });

    return markdown;
  }

  async generateTrainingPlan(
    userId: string,
    userInfo: UserFitnessInfo,
  ): Promise<{
    planJson: TrainingPlan;
    planMarkdown: string;
  }> {
    try {
      const response = await this.deepseek.chatCompletion([
        {
          role: 'system',
          content: '你是一位专业的健身教练，擅长制定个性化训练计划。请直接返回JSON格式的训练计划，不要使用markdown代码块包装。',
        },
        {
          role: 'user',
          content: this.generatePrompt(userInfo),
        },
      ]);

      if (!('choices' in response)) {
        throw new Error('Unexpected response format');
      }

      let planString = response.choices[0].message.content;
      // 清理可能存在的markdown代码块标记
      planString = this.cleanJsonString(planString);
      try {
        const planJson = JSON.parse(planString) as TrainingPlan;
        const planMarkdown = this.convertToMarkdown(planJson);

        // 保存到数据库
        const trainingPlan = new TrainingPlanModel({
          userId,
          userInfo,
          planJson,
          planMarkdown,
        });
        await trainingPlan.save();

        return {
          planJson,
          planMarkdown,
        };
      } catch (jsonError) {
        console.error('JSON解析失败:', jsonError, '原始内容:', planString);
        throw new Error('训练计划格式无效');
      }
    } catch (error) {
      console.error('生成训练计划失败:', error);
      throw new Error('生成训练计划失败');
    }
  }

  // 新增方法：清理JSON字符串
  private cleanJsonString(input: string): string {
    // 移除markdown代码块标记
    let cleaned = input.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
    // 移除其他可能的markdown格式
    cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
    // 尝试找到JSON对象的开始和结束
    const startIndex = cleaned.indexOf('{');
    const endIndex = cleaned.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      cleaned = cleaned.substring(startIndex, endIndex + 1);
    }
    return cleaned.trim();
  }

  async getUserPlans(userId: string) {
    return TrainingPlanModel.find({ userId }).sort({ createdAt: -1 });
  }

  async getPlanById(planId: string) {
    return TrainingPlanModel.findById(planId);
  }
}
