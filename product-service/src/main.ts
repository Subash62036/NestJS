// 

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';


async function bootstrap() {
const app = await NestFactory.create(AppModule);

app.enableCors();
app.useGlobalPipes(
    new ValidationPipe({
         whitelist: true,          // removes unknown fields
         forbidNonWhitelisted: true, // throws error for extra fields
         forbidUnknownValues: true,
         transform: true,     
    }));
await app.listen(3001);
console.log('Product service listening on http://localhost:3001');
}
bootstrap();