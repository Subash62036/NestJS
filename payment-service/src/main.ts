import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';


async function bootstrap() {
const app = await NestFactory.create(AppModule);
app.setGlobalPrefix('api');
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
const port = process.env.PORT ? parseInt(process.env.PORT) : 3003;
await app.listen(port);
console.log(`Payment service running on http://localhost:${port}`);

}
bootstrap();