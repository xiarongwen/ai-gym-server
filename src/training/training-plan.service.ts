import { DeepSeekService } from '../ds/deepseek';
import { UserFitnessInfo, TrainingPlan } from '../interfaces/training';
import { UserFitnessModel } from '../models/training-plan.model';
import mongoose from 'mongoose';

export class TrainingPlanService {
  private deepseek: DeepSeekService;

  constructor() {
    this.deepseek = new DeepSeekService({
      apiKey: process.env.DEEPSEEK_API_KEY || '',
    });
  }

  private generatePrompt(userInfo: UserFitnessInfo): string {
    return `作为一位专业的健身教练，所有的计划都要用中文回答，请根据以下用户信息制定一份详细的训练计划：

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
      markdown += `### ${day.day} - ${day.focus}\n\n`;
      day.exercises.forEach((exercise) => {
        markdown += `#### ${exercise.name}\n`;
        if (exercise.sets && exercise.reps) {
          markdown += `- 组数：${exercise.sets}\n`;
          markdown += `- 次数：${exercise.reps}\n`;
        }
        if (exercise.rest) {
          markdown += `- 休息时间：${exercise.rest}\n`;
        }
        if (exercise.duration) {
          markdown += `- 时长：${exercise.duration}\n`;
        }
        if (exercise.intensity) {
          markdown += `- 强度：${exercise.intensity}\n`;
        }
        markdown += '\n';
      });
    });

    // 添加营养建议
    markdown += `## 营养建议\n\n`;
    markdown += `### 每日摄入量\n`;
    markdown += `- 总热量：${plan.nutrition.dailyCalories}\n`;
    markdown += `- 饮水量：${plan.nutrition.hydration}\n\n`;
    markdown += `### 宏量素分配\n`;
    markdown += `- 蛋白质：${plan.nutrition.macronutrients.protein}\n`;
    markdown += `- 碳水化合物：${plan.nutrition.macronutrients.carbohydrates}\n`;
    markdown += `- 脂肪：${plan.nutrition.macronutrients.fats}\n\n`;

    // 添加注意事项
    markdown += `## 注意事项\n\n`;
    plan.tips.forEach((tip) => {
      markdown += `- ${tip}\n`;
    });

    return markdown;
  }

  private cleanJsonString(input: string): string {
    if (!input) return '{}';
    try {
      // 首先尝试直接解析，可能已经是有效的 JSON
      JSON.parse(input);
      return input;
    } catch (e: any) {
      let cleaned = input.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
      const startIndex = cleaned.indexOf('{');
      const endIndex = cleaned.lastIndexOf('}');
      if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        cleaned = cleaned.substring(startIndex, endIndex + 1);
        try {
          JSON.parse(cleaned);
          return cleaned.trim();
        } catch (jsonError) {
          console.error('清理后的 JSON 仍然无效:', jsonError);
        }
      }
      console.error('无法提取有效的 JSON 对象', e);
      throw new Error('无法解析 AI 返回的训练计划格式');
    }
  }

  async generateTrainingPlan(
    userId: string,
    userInfo: UserFitnessInfo,
  ): Promise<{
    planJson: TrainingPlan;
  }> {
    try {
      const response = await this.deepseek.chatCompletion([
        {
          role: 'system',
          content:
            '你是一位专业的健身教练，擅长制定个性化训练计划。请直接返回JSON格式的训练计划，不要使用markdown代码块包装。确保返回的是有效的JSON格式。',
        },
        {
          role: 'user',
          content: this.generatePrompt(userInfo),
        },
      ]);

      if (
        !('choices' in response) ||
        !response.choices ||
        !response.choices[0]?.message?.content
      ) {
        console.error('API 响应格式异常:', response);
        throw new Error('API 返回了意外的响应格式');
      }

      let planString = response.choices[0].message.content;
      console.log('原始响应:', planString);

      try {
        // 清理可能存在的 markdown 代码块标记
        planString = this.cleanJsonString(planString);
        console.log('清理后的 JSON:', planString);

        const planJson = JSON.parse(planString) as TrainingPlan;

        // 验证必要的字段是否存在
        if (
          !planJson.overview ||
          !planJson.weeklySchedule ||
          !planJson.nutrition ||
          !planJson.tips
        ) {
          console.error('训练计划缺少必要字段:', planJson);
          throw new Error('训练计划数据不完整');
        }

        try {
          // 保存到 userfitnesses 集合
          const userFitness = new UserFitnessModel({
            userId,
            userInfo,
            planJson,
          });
          mongoose.connect(
            process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-app',
          );
          await userFitness.save();
          console.log('训练计划已保存到 userfitnesses 集合');
        } catch (dbError) {
          console.error('数据库保存失败:', dbError);
          // 即使数据库保存失败，也返回生成的计划
        }

        return {
          planJson,
        };
      } catch (jsonError) {
        console.error('JSON 解析失败:', jsonError, '原始内容:', planString);
        throw new Error('训练计划格式无效');
      }
    } catch (error) {
      console.error('生成训练计划失败:', error);
      throw new Error('生成训练计划失败');
    }
  }

  async getUserPlans(userId: string) {
    return UserFitnessModel.find({ userId }).sort({ createdAt: -1 });
  }

  async getPlanById(planId: string) {
    return UserFitnessModel.findById(planId);
  }
}
