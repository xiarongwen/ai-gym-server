import { DeepSeekService } from '../ds/deepseek';
import { Stream } from 'openai/streaming';

async function main() {
  const deepseek = new DeepSeekService({
    apiKey: process.env.DEEPSEEK_API_KEY || '',
  });

  try {
    const response = await deepseek.chatCompletion([
      { role: 'system', content: '你是一个有帮助的助手。' },
      { role: 'user', content: '你好！' },
    ]);

    if (!('choices' in response)) {
      throw new Error('Unexpected response format');
    }

    console.log('助手回复:', response.choices[0].message.content);
  } catch (error) {
    console.error('错误:', error);
  }
}

// 使用流式输出的例子
async function streamExample() {
  const deepseek = new DeepSeekService({
    apiKey: process.env.DEEPSEEK_API_KEY || '',
  });

  try {
    const stream = await deepseek.chatCompletion(
      [
        { role: 'system', content: '你是一个有帮助的助手。' },
        { role: 'user', content: '你好！' },
      ],
      { stream: true },
    );

    if (stream instanceof Stream) {
      for await (const chunk of stream) {
        process.stdout.write(chunk.choices[0]?.delta?.content || '');
      }
    }
  } catch (error) {
    console.error('错误:', error);
  }
}

// 导出函数以供使用
export { main, streamExample };
