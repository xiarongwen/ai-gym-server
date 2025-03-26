import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ScrapedExercise } from './schemas/scraped-exercise.schema';
import axios from 'axios';

@Injectable()
export class ExerciseScraperService {
  private readonly logger = new Logger(ExerciseScraperService.name);
  private readonly apiBaseUrl = 'https://exercisedb-api.vercel.app';

  constructor(
    @InjectModel(ScrapedExercise.name)
    private scrapedExerciseModel: Model<ScrapedExercise>,
  ) {}

  async scrapeAndSaveExercises(): Promise<{
    success: boolean;
    message: string;
    count?: number;
  }> {
    try {
      this.logger.log('Starting exercise data scraping...');
      // Make API request to get all exercises
      const response = await axios.get(`${this.apiBaseUrl}/api/v1/exercises`, {
        headers: {
          'X-RapidAPI-Key': process.env.RAPID_API_KEY,
          'X-RapidAPI-Host': 'exercisedb-api.vercel.app',
        },
      });

      this.logger.debug('API response:', {
        status: response.status,
        dataLength: response.data?.length,
      });

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid API response format');
      }

      const exercises = response.data.map((exercise) => ({
        exerciseId: exercise.id,
        name: exercise.name,
        bodyParts: [exercise.bodyPart],
        equipments: [exercise.equipment],
        gifUrl: exercise.gifUrl,
        targetMuscles: [exercise.target],
        secondaryMuscles: exercise.secondaryMuscles || [],
        instructions: exercise.instructions || [],
      }));

      // Delete all existing scraped exercises
      await this.scrapedExerciseModel.deleteMany({});
      // Insert all exercises
      const result = await this.scrapedExerciseModel.insertMany(exercises);
      return {
        success: true,
        message: `Successfully scraped and saved ${result.length} exercises`,
        count: result.length,
      };
    } catch (error) {
      this.logger.error(
        `Error scraping exercises: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: `Failed to scrape exercises: ${error.message}`,
      };
    }
  }

  async getAllScrapedExercises(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const total = await this.scrapedExerciseModel.countDocuments();
    const exercises = await this.scrapedExerciseModel
      .find()
      .skip(skip)
      .limit(limit)
      .exec();
    return {
      data: exercises,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getScrapedExerciseById(id: string) {
    return this.scrapedExerciseModel.findOne({ exerciseId: id }).exec();
  }
}
