import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TrainingModule } from './training/training.module';
import { ExercisesModule } from './exercises/exercises.module';
import { ExerciseScraperModule } from './exercise-scraper/exercise-scraper.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          uri: configService.get<string>('MONGODB_URI'),
        } as MongooseModuleOptions;
      },
    }),
    UsersModule,
    AuthModule,
    TrainingModule,
    ExercisesModule,
    ExerciseScraperModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your_jwt_secret',
      signOptions: { expiresIn: '60m' },
    }),
  ],
  providers: [],
  exports: [],
})
export class AppModule {}
