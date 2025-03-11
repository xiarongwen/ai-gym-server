import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TrainingPlanService } from '../services/training-plan.service';
import { UserFitnessInfo } from '../interfaces/training';
import { Request } from 'express';

@Controller('training')
export class TrainingController {
  constructor(private trainingService: TrainingPlanService) {}

  @UseGuards(JwtAuthGuard)
  @Post('generate-plan')
  async generatePlan(@Body() userInfo: UserFitnessInfo, @Req() req: Request) {
    try {
      console.log('用户请求生成训练计划:', req.user);
      const userId = req.user?._id;
      if (!userId) {
        return { error: '无法识别用户' };
      }
    //   if (!this.validateUserInfo(userInfo)) {
    //     return { error: '无效的用户信息' };
    //   }

      return this.trainingService.generateTrainingPlan(userId, userInfo);
    } catch (error) {
      console.error('生成训练计划失败:', error);
      throw new HttpException(
        '生成训练计划失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('plans')
  async getUserPlans(@Req() req: Request) {
    const userId = req.user._id;
    return this.trainingService.getUserPlans(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('plans/:id')
  async getPlanById(@Param('id') planId: string, @Req() req: Request) {
    const userId = req.user._id;
    const plan = await this.trainingService.getPlanById(planId);
    if (!plan) {
      return { error: '训练计划不存在' };
    }

    if (plan.userId !== userId) {
      return { error: '无权访问此训练计划' };
    }

    return plan;
  }

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
