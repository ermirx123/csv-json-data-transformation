import { Injectable, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
    private openAi: OpenAI;

    constructor() {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY is not set in the environment variables.');
        }

        this.openAi = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async enhanceDescription(name: string, category: string, description?: string): Promise<string> {
        const prompt = description
            ? `Enhance the following product description:\n\nProduct name: ${name}\nProduct description: ${description}\nCategory: ${category}`
            : `Generate a product description based on the following:\n\nProduct name: ${name}\nCategory: ${category}`;

        try {
            const response = await this.openAi.chat.completions.create({
                model: 'gpt-3.5-turbo', // Adjust the model as needed
                messages: [{ role: 'user', content: prompt }],
            });

            return response.choices[0].message.content.trim();
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException('Error enhancing description with OpenAI');
        }
    }
}
