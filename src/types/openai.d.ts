declare module 'openai' {
  export interface OpenAIApi {
    createChatCompletion: (options: any) => Promise<any>;
    createCompletion: (options: any) => Promise<any>;
  }

  export interface Configuration {
    apiKey: string;
    baseURL?: string;
  }

  export class OpenAI {
    constructor(config: { apiKey: string, baseURL?: string });
    chat: {
      completions: {
        create: (options: any) => Promise<any>;
      };
    };
    completions: {
      create: (options: any) => Promise<any>;
    };
  }
}
