import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Mongoose } from 'mongoose';

async function bootstrap() {
  console.log('Application is starting 1...');
  const app = await NestFactory.create(AppModule);
  console.log('Application is starting...');

  // Test MongoDB connection
  // try {
  //   const connection = app.get(Mongoose);
  //   console.log('Mongoose instance obtained.');

  //   await connection.connection.db.admin().ping(); // Ping the database
  //   console.log('MongoDB connection successful!');
  // } catch (error) {
  //   console.error('MongoDB connection error:', error);
  // }

  await app.listen(3000);
  console.log('Application is listening on port 3000');
}
bootstrap();
