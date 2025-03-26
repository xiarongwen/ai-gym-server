import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Training API')
    .setDescription('Training API description')
    .setVersion('1.0')
    .addTag('training')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  // 添加 CORS 支持
  app.enableCors();
  // 使用环境变量端口或默认 3000
  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
