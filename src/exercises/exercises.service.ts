import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Exercise, ExerciseDocument } from './schemas/exercise.schema';

@Injectable()
export class ExercisesService {
  constructor(
    @InjectModel(Exercise.name)
    private exerciseModel: Model<ExerciseDocument>,
  ) {}

  /**ß
   * 模糊搜索健身动作
   * @param keyword 搜索关键词
   * @param page 页码
   * @param limit 每页数量
   * @returns 符合条件的健身动作列表
   */
  async searchExercises(
    keyword: string,
    page = 1,
    limit = 20,
  ): Promise<{
    data: Exercise[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    // 构建模糊搜索条件 - 支持多字段搜索
    const searchCondition = keyword
      ? {
          $or: [
            { name: { $regex: keyword, $options: 'i' } },
            { bodyPart: { $regex: keyword, $options: 'i' } },
            { equipment: { $regex: keyword, $options: 'i' } },
            { target: { $regex: keyword, $options: 'i' } },
            { secondaryMuscles: { $regex: keyword, $options: 'i' } },
          ],
        }
      : {};

    // 执行查询并统计总数
    const [data, total] = await Promise.all([
      this.exerciseModel.find(searchCondition).skip(skip).limit(limit).exec(),
      this.exerciseModel.countDocuments(searchCondition),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * 根据ID获取健身动作详情
   * @param id 健身动作ID
   * @returns 健身动作详情
   */
  async getExerciseById(id: string): Promise<Exercise> {
    return this.exerciseModel.findById(id).exec();
  }

  /**
   * 获取所有健身动作列表
   * @param page 页码
   * @param limit 每页数量
   * @returns 健身动作列表和分页信息
   */
  async getAllExercises(
    page = 1,
    limit = 20,
  ): Promise<{
    data: Exercise[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    // 执行查询并统计总数
    const [data, total] = await Promise.all([
      this.exerciseModel.find().skip(skip).limit(limit).exec(),
      this.exerciseModel.countDocuments(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }
}
