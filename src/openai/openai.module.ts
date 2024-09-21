import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OpenAIService } from './openai.service';

@Module({
    imports: [],
    providers: [OpenAIService],
    exports: [OpenAIService],  
})

export class OpenAIModule { }
