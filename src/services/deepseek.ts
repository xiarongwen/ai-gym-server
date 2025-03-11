import { OpenAI } from 'openai';
import {
  ChatCompletion,
  ChatCompletionChunk,
} from 'openai/resources/chat/completions';
import { Stream } from 'openai/streaming';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekConfig {
  apiKey: string;
  baseURL?: string;
}

export class DeepSeekService {
  private client: OpenAI;

  constructor(config: DeepSeekConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL || 'https://api.deepseek.com',
    });
  }

  async chatCompletion(
    messages: ChatMessage[],
    options?: {
      model?: string;
      stream?: boolean;
      temperature?: number;
    },
  ): Promise<ChatCompletion | Stream<ChatCompletionChunk>> {
    try {
      const completion = await this.client.chat.completions.create({
        model: options?.model || 'deepseek-chat',
        messages,
        stream: options?.stream || false,
        temperature: options?.temperature,
      });

      return completion;
    } catch (error) {
      console.error('DeepSeek API 调用失败:', error);
      throw error;
    }
  }
}
