import { Router } from 'express';
import { TrainingController } from '../controllers/training.controller';
import { authMiddleware } from '../middlewares/auth';
import { TrainingPlanService } from '../training/training-plan.service';

// 明确指定 Router 类型
const router: Router = Router();
const trainingController = new TrainingController(new TrainingPlanService());

// 所有路由都需要认证
router.use(authMiddleware as any);

// 生成训练计划
router.post('/generate-plan', trainingController.generatePlan as any);

// 获取用户的所有训练计划
router.get('/plans', trainingController.getUserPlans as any);

// 获取特定训练计划
router.get('/plans/:id', trainingController.getPlanById as any);

export default router; // 导出路由
