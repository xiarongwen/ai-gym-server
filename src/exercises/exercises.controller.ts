import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExercisesService } from './exercises.service';

@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  /**
   * 获取所有健身动作列表接口
   * @param page 页码
   * @param limit 每页数量
   * @returns 健身动作列表和分页信息
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllExercises(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const result = await this.exercisesService.getAllExercises(page, limit);

    return {
      code: 200,
      message: '获取成功',
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  /**
   * 搜索健身动作接口
   * @param q 搜索关键词
   * @param page 页码
   * @param limit 每页数量
   * @returns 符合条件的健身动作列表和分页信息
   */
  @Get('search')
  @UseGuards(JwtAuthGuard)
  async searchExercises(
    @Query('q') keyword: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const result = await this.exercisesService.searchExercises(
      keyword,
      page,
      limit,
    );

    return {
      code: 200,
      message: '搜索成功',
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  /**
   * 获取健身动作详情接口
   * @param id 健身动作ID
   * @returns 健身动作详情信息
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getExerciseById(@Param('id') id: string) {
    const exercise = await this.exercisesService.getExerciseById(id);

    return {
      code: 200,
      message: '获取成功',
      data: exercise,
    };
  }
}
