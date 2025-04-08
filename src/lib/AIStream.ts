import { createParser } from "eventsource-parser";
import { OpenAIError } from "./errors";

export const OpenAIStream = async ({
  addModelNameInResult,
  model,
  url,
  messages,
  apiKey,
  callback,
}: {
  addModelNameInResult?: boolean;
  model: string;
  url: string;
  messages: any[];
  apiKey?: string;
  callback?: (allText: string) => void | Promise<void>;
}) => {
  try {
    console.log(`OpenAIStream: 正在请求 ${url} 以使用模型 ${model}`);
    console.log(`OpenAIStream: 发送消息:`, JSON.stringify(messages));
    
    // 添加超时处理，增加到120秒
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120秒超时
    
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey || process.env.DEEPSEEK_KEY}`,
      },
      method: "POST",
      body: JSON.stringify({ model, messages, stream: true }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!res.ok) {
      await handleErrorResponse(res);
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const textChunks: string[] = [];

    // 如果响应不是流，则直接处理为单一响应
    if (!res.body) {
      const text = await res.text();
      console.log("响应不是流，直接处理:", text);
      try {
        const jsonResponse = JSON.parse(text);
        const responseText = jsonResponse.choices?.[0]?.message?.content || text;
        if (callback) {
          await Promise.resolve(callback(responseText));
        }
        return new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(responseText));
            controller.close();
          },
        });
      } catch (e) {
        console.error("解析非流响应时出错:", e);
        throw e;
      }
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const onParse = createParseHandler(controller, encoder, textChunks);
          const parser = createParser(onParse);

          for await (const chunk of res.body as any) {
            parser.feed(decoder.decode(chunk));
          }

          // 流结束时，执行回调函数
          const allText = textChunks.join("");
          console.log("流处理完成，总文本长度:", allText.length);
          
          try {
            if (callback) {
              await Promise.resolve(callback(allText));
            }
          } catch (error) {
            console.error("Error in stream end callback:", error);
          }

          controller.close();
        } catch (error) {
          console.error("流处理过程中出错:", error);
          controller.error(error);
        }
      },
    });

    return stream;
  } catch (error) {
    console.error("OpenAIStream处理中发生错误:", error);
    
    // 创建一个携带错误信息的流
    const errorMessage = `错误: ${error instanceof Error ? error.message : '未知错误'}`;
    const encoder = new TextEncoder();
    
    if (callback) {
      try {
        await Promise.resolve(callback(errorMessage));
      } catch (e) {
        console.error("错误回调中发生异常:", e);
      }
    }
    
    return new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(errorMessage));
        controller.close();
      },
    });
  }
};

const createParseHandler =
  (
    controller: ReadableStreamDefaultController,
    encoder: TextEncoder,
    textChunks: string[]
  ) =>
  (event: any) => {
    if (event.type === "event") {
      const data = event.data;
      if (data === "[DONE]") return;

      try {
        const json = JSON.parse(data);
        // console.log("aiStream json", json);
        if (json.choices[0].finish_reason != null) return;

        const text = json.choices[0].delta.content;
        textChunks.push(text);
        controller.enqueue(encoder.encode(text));
      } catch (e) {
        controller.error(e);
      }
    }
  };

const handleErrorResponse = async (res: Response) => {
  const result = await res.json();
  if (result.error) {
    throw new OpenAIError(
      result.error.message,
      result.error.type,
      result.error.param,
      result.error.code
    );
  } else {
    throw new Error(`API returned an error: ${result.statusText}`);
  }
};
