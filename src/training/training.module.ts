import { Module } from '@nestjs/common';
import { TrainingController } from '../controllers/training.controller';
import { TrainingPlanService } from './training-plan.service';
import { ExercisesModule } from '../exercises/exercises.module';

@Module({
  imports: [ExercisesModule],
  controllers: [TrainingController],
  providers: [TrainingPlanService],
})
export class TrainingModule {}
