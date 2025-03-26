import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExerciseScraperController } from './exercise-scraper.controller';
import { ExerciseScraperService } from './exercise-scraper.service';
import {
  ScrapedExercise,
  ScrapedExerciseSchema,
} from './schemas/scraped-exercise.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ScrapedExercise.name, schema: ScrapedExerciseSchema },
    ]),
  ],
  controllers: [ExerciseScraperController],
  providers: [ExerciseScraperService],
  exports: [ExerciseScraperService],
})
export class ExerciseScraperModule {}
