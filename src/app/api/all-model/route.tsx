// 如果有数据库需求，请打开注释
import { OpenAIStream } from "@/lib/AIStream";
// import { createClient } from "@/lib/supabase";
import config from "@/config";

export const runtime = "edge";
export async function POST(req: Request) {
  try {
    const {
      question,
      model,
      modelIndex,
      system,
      id: deviceId,
    } = await req.json();
    // let supabase = null;
    // if (!config.database.supabaseUrl || !config.database.supabaseServiceKey) {
    //   // throw new Error("Missing Supabase URL or service key in configuration");
    // } else {
    //   supabase = createClient();
    // }

    // 如果没有提供问题，返回错误
    if (!question || question.trim() === "") {
      return new Response(
        JSON.stringify({
          error: "问题不能为空",
          choices: [{ message: { content: "错误：提交的问题不能为空" } }]
        }),
        { status: 400 }
      );
    }

    const messages = [
      {
        role: "user",
        content: question,
      },
    ];
    if (system) {
      messages.unshift({
        role: "system",
        content: system,
      });
    }
    // 从请求的cookie中读取API密钥
    const cookies = req.headers.get("cookie");
    let apiKey = "";
    if (cookies) {
      const apiKeyCookie = cookies
        .split(";")
        .find((cookie) => cookie.trim().startsWith("api_key="));
      if (apiKeyCookie) {
        apiKey = apiKeyCookie.split("=")[1].trim();
      }
    }

    // 如果cookie中没有API密钥，则使用环境变量中的密钥
    if (!apiKey) {
      apiKey = process.env.DEEPSEEK_KEY || "";
    }

    // 确保我们有一个有效的API密钥
    if (!apiKey) {
      console.error("未找到有效的API密钥");
      return new Response(
        JSON.stringify({
          error: "未找到有效的API密钥",
          choices: [{ message: { content: "错误：未找到有效的API密钥，请确保已配置DEEPSEEK_KEY环境变量或在Cookie中设置api_key" } }]
        }),
        { status: 401 }
      );
    }
    console.log("使用模型: ", model);
    console.log("发送问题: ", question.substring(0, 50) + (question.length > 50 ? "..." : ""));
    
    // 确保baseUrl没有尾部斜杠，然后添加/chat/completions路径
    const baseUrl = process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1";
    const aiUrl = `${baseUrl}/chat/completions`;

    // 尝试使用非流式响应作为备选（如果流式响应不可用）
    try {
      // 尝试流式处理
      const streamOptions = {
        model,
        url: aiUrl,
        messages,
        apiKey,
        callback: async (text: string) => {
          if (text) {
            // 这里可以实现数据持久化的逻辑
            console.log(`收到模型 ${model} 的回复，长度: ${text.length}字符`);
          }
        },
      };
      
      // 记录请求开始时间，用于统计请求时长
      const startTime = Date.now();
      
      const stream = await OpenAIStream(streamOptions);
      
      // 记录请求完成时间和总耗时
      const endTime = Date.now();
      console.log(`模型 ${model} 请求耗时: ${(endTime - startTime) / 1000}秒`);
      
      return new Response(stream);
    } catch (streamError) {
      console.error("流式处理失败，尝试非流式响应:", streamError);
      
      // 如果流式处理失败，尝试非流式请求
      try {
        console.log(`尝试使用非流式请求模型 ${model}`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000); // 120秒超时
        
        const nonStreamResponse = await fetch(aiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({ model, messages, stream: false }),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!nonStreamResponse.ok) {
          const errorText = await nonStreamResponse.text();
          console.error("非流式响应错误:", errorText);
          throw new Error(`API错误: ${nonStreamResponse.status} - ${errorText}`);
        }
        
        const data = await nonStreamResponse.json();
        return new Response(JSON.stringify(data));
      } catch (nonStreamError) {
        console.error("非流式处理也失败:", nonStreamError);
        throw nonStreamError; // 重新抛出错误，由外层catch处理
      }
    }
  } catch (error) {
    console.error("API路由处理错误:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "未知错误",
        choices: [{ message: { content: `处理请求时出错: ${error instanceof Error ? error.message : "未知错误"}` } }]
      }),
      { status: 500 }
    );
  }
}
