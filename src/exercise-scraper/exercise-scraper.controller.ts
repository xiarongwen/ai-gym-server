import { Controller, Get, Post, UseGuards, Query, Param } from '@nestjs/common';
import { ExerciseScraperService } from './exercise-scraper.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('exercise-scraper')
export class ExerciseScraperController {
  constructor(
    private readonly exerciseScraperService: ExerciseScraperService,
  ) {}

  @Post('scrape')
  @UseGuards(JwtAuthGuard) // Protect this endpoint with authentication
  async scrapeExercises() {
    return this.exerciseScraperService.scrapeAndSaveExercises();
  }

  @Get()
  async getAllScrapedExercises(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return {
      code: 200,
      message: 'Scraped exercises fetched successfully',
      data: await this.exerciseScraperService.getAllScrapedExercises(
        page,
        limit,
      ),
    };
  }

  @Get(':id')
  async getScrapedExerciseById(@Param('id') id: string) {
    const exercise =
      await this.exerciseScraperService.getScrapedExerciseById(id);
    return {
      code: 200,
      message: exercise
        ? 'Scraped exercise found'
        : 'Scraped exercise not found',
      data: exercise,
    };
  }
}
