import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Your API Title') // 📘 Replace with your project name
    .setDescription('API documentation for your app')
    .setVersion('1.0')
    .addBearerAuth() // Optional: If using JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // 👈 Swagger available at /api-docs

  await app.listen(5000);
}
bootstrap();
