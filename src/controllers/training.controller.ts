import { Request, Response } from 'express';
import { TrainingPlanService } from '../services/training-plan.service';
import { UserFitnessInfo } from '../interfaces/training';

export class TrainingController {
  private trainingService: TrainingPlanService;

  constructor() {
    this.trainingService = new TrainingPlanService();
  }

  public generatePlan = async (req: Request, res: Response) => {
    try {
      const userInfo: UserFitnessInfo = req.body;
      const userId = req.user?._id; // 使用 _id 而不是 id

      if (!userId) {
        return res.status(401).json({ error: '未授权' });
      }

      // 输入验证
      if (!this.validateUserInfo(userInfo)) {
        return res.status(400).json({
          error: '无效的用户信息',
        });
      }

      const plan = await this.trainingService.generateTrainingPlan(
        userId,
        userInfo,
      );
      res.json(plan);
    } catch (error) {
      console.error('生成训练计划失败:', error);
      res.status(500).json({
        error: '生成训练计划失败',
      });
    }
  };

  public getUserPlans = async (req: Request, res: Response) => {
    try {
      const userId = req.user?._id; // 使用 _id 而不是 id
      if (!userId) {
        return res.status(401).json({ error: '未授权' });
      }

      const plans = await this.trainingService.getUserPlans(userId);
      res.json(plans);
    } catch (error) {
      console.error('获取训练计划失败:', error);
      res.status(500).json({ error: '获取训练计划失败' });
    }
  };

  public getPlanById = async (req: Request, res: Response) => {
    try {
      const userId = req.user?._id; // 使用 _id 而不是 id
      if (!userId) {
        return res.status(401).json({ error: '未授权' });
      }

      const planId = req.params.id;
      if (!planId) {
        return res.status(400).json({ error: '未提供计划ID' });
      }

      const plan = await this.trainingService.getPlanById(planId);
      if (!plan) {
        return res.status(404).json({ error: '训练计划不存在' });
      }

      // 确保用户只能访问自己的训练计划
      if (plan.userId !== userId) {
        return res.status(403).json({ error: '无权访问此训练计划' });
      }

      res.json(plan);
    } catch (error) {
      console.error('获取训练计划失败:', error);
      res.status(500).json({ error: '获取训练计划失败' });
    }
  };

  private validateUserInfo(info: UserFitnessInfo): boolean {
    return (
      typeof info.age === 'number' &&
      info.age > 0 &&
      ['male', 'female'].includes(info.gender) &&
      typeof info.weight === 'number' &&
      info.weight > 0 &&
      typeof info.height === 'number' &&
      info.height > 0 &&
      ['beginner', 'intermediate', 'advanced'].includes(info.fitnessLevel) &&
      ['weight_loss', 'muscle_gain', 'strength', 'endurance'].includes(
        info.goal as string,
      ) &&
      typeof info.daysPerWeek === 'number' &&
      info.daysPerWeek > 0 &&
      info.daysPerWeek <= 7
    );
  }
}
