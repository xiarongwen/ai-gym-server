import { Module } from '@nestjs/common';
import { TrainingController } from '../controllers/training.controller';
import { TrainingPlanService } from '../services/training-plan.service';

@Module({
  controllers: [TrainingController],
  providers: [TrainingPlanService],
})
export class TrainingModule {}
