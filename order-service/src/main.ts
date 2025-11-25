import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  
  app.useGlobalPipes(
    new ValidationPipe({ 
       whitelist: true,          // removes unknown fields
      forbidNonWhitelisted: true, // throws error for extra fields
      forbidUnknownValues: true,
      transform: true,     // auto-transform payloads to DTO instances
    })
  );  

  const config = new DocumentBuilder()
    .setTitle('Order Service')
    .setDescription('Order microservice API')
    .setVersion('1.0')
    .build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, doc);

  await app.listen(3002);
  console.log('Order service running on http://localhost:3002');
}
bootstrap();
