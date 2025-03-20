import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';

// 创建路由实例
const router: Router = Router();

// 导入控制器模块
import { TrainingController } from '../controllers/training.controller';
import { TrainingPlanService } from '../training/training-plan.service';
import { ExercisesService } from '../exercises/exercises.service';

// 获取已经注册在 NestJS container 中的控制器实例
// 注意：如果使用此方式，确保 main.ts 中已将 app 实例存储为全局变量
let trainingController;
try {
  // 首选尝试从 NestJS 容器中获取控制器
  if (global.nestApp) {
    trainingController = global.nestApp.get(TrainingController);
  } else {
    // 如果 global.nestApp 不存在，则尝试从 module 系统获取
    throw new Error('NestJS app instance not available globally');
  }
} catch (error) {
  console.warn('无法从 NestJS 容器中获取控制器，将使用手动实例化方式', error);
  // 手动实例化控制器（仅用于开发环境）
  const exerciseModel = global.mongoose?.model('Exercise') || null;
  const exercisesService = new ExercisesService(exerciseModel);
  const trainingPlanService = new TrainingPlanService(exercisesService);
  trainingController = new TrainingController(trainingPlanService);
}

// 所有路由都需要认证
router.use(authMiddleware as any);

// 生成训练计划
router.post('/generate-plan', trainingController.generatePlan as any);

// 获取用户的所有训练计划
router.get('/plans', trainingController.getUserPlans as any);

// 获取特定训练计划
router.get('/plans/:id', trainingController.getPlanById as any);

export default router;
