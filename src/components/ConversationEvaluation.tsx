"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useTranslations } from "next-intl";
import { MessageCircle, Plus, Send, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { v4 as uuidv4 } from "uuid";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  modelId?: string;
}

interface Conversation {
  id: string;
  modelId: string;
  messages: Message[];
}

interface ConversationResult extends Conversation {
  score?: number | undefined;
  feedback: string;
}

interface ConversationEvaluationProps {
  models: Array<{ id: string }>;
  apiEndpoint: string;
  onEvaluate?: (results: Record<string, any>) => void;
}

export default function ConversationEvaluation({ 
  models,
  apiEndpoint,
  onEvaluate 
}: ConversationEvaluationProps) {
  const t = useTranslations("ConversationEvaluation");
  const [isOpen, setIsOpen] = useState(false);
  const [activeModelIds, setActiveModelIds] = useState<string[]>([]);
  const [conversations, setConversations] = useState<ConversationResult[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState("setup");
  const [currentRound, setCurrentRound] = useState(1);
  const [openModelIds, setOpenModelIds] = useState<Set<string>>(new Set());
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // 初始化对话
  const initializeConversations = useCallback(() => {
    const newConversations = activeModelIds.map(modelId => ({
      id: uuidv4(),
      modelId,
      messages: [],
      score: undefined,
      feedback: ""
    }));
    setConversations(newConversations);
    setCurrentRound(1);
    // 重置折叠面板状态，默认全部折叠
    setOpenModelIds(new Set());
  }, [activeModelIds]);

  // 添加用户消息到所有对话
  const addUserMessage = async () => {
    if (!userInput.trim() || isLoading || !conversations.length) return;
    
    setIsLoading(true);
    
    // 添加用户消息到所有对话
    const messageId = uuidv4();
    const userMessage: Message = {
      id: messageId,
      role: 'user',
      content: userInput
    };
    
    const updatedConversations = conversations.map(conversation => ({
      ...conversation,
      messages: [...conversation.messages, userMessage]
    }));
    
    // 立即更新状态以显示用户消息
    setConversations(updatedConversations);
    setUserInput("");
    
    // 对每个对话获取模型回复
    try {
      console.log("正在发送API请求给模型:", updatedConversations.map(c => c.modelId));
      
      const responsePromises = updatedConversations.map(conversation => 
        getModelResponse(conversation.modelId, [
          ...conversation.messages,
          userMessage
        ])
      );
      
      const responses = await Promise.all(responsePromises);
      console.log("收到模型回复:", responses);
      
      // 更新对话添加模型回复
      const finalConversations = updatedConversations.map((conversation, index) => {
        const modelResponse = responses[index];
        return {
          ...conversation,
          messages: [
            ...conversation.messages,
            {
              id: uuidv4(),
              role: 'assistant' as const,
              content: modelResponse,
              modelId: conversation.modelId
            }
          ]
        };
      });
      
      setConversations(finalConversations);
      
      // 确保更新轮次
      setCurrentRound(prev => prev + 1);
      
      // 自动滚动到底部
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error("Error fetching model responses:", error);
      alert(`获取模型回复失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 从模型获取响应
  const getModelResponse = async (modelId: string, messages: Message[]): Promise<string> => {
    console.log(`向模型 ${modelId} 发送请求`);
    
    try {
      // 转换消息格式为API所需格式
      const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      console.log(`向模型 ${modelId} 发送请求，消息内容:`, formattedMessages);
      
      // 构建请求正文
      const requestBody = {
        model: modelId,
        question: messages[messages.length - 1].content, // 使用最后一条消息作为问题
        modelIndex: `model_conversation_${modelId.replace(/\//g, '_')}`,
        messages: formattedMessages,
        stream: false,
        id: uuidv4() // 添加唯一ID以避免缓存问题
      };
      
      console.log("发送的请求体:", requestBody);
      
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => "无法获取错误详情");
        console.error(`API错误状态: ${response.status}, 错误响应:`, errorText);
        throw new Error(`API returned status ${response.status}: ${errorText}`);
      }

      // 获取响应内容
      const textContent = await response.text();
      console.log(`模型 ${modelId} 的响应内容长度:`, textContent.length);
      
      return textContent;
    } catch (error) {
      console.error(`Error fetching response from ${modelId}:`, error);
      return t("errorFetchingResponse") + (error instanceof Error ? `: ${error.message}` : '');
    }
  };

  // 清除当前对话
  const clearConversations = () => {
    if (confirm(t("confirmClearConversation"))) {
      setConversations([]);
      setCurrentRound(1);
    }
  };

  // 生成评估提示
  const generateEvaluationPrompt = (conversations: ConversationResult[]) => {
    const defaultPrompt = "请评估以下多轮对话中各个模型的表现，给出得分（满分100分）和详细评价，包括各自的优缺点。";
    let evaluationPrompt = t("evaluationPrompt") && t("evaluationPrompt") !== "evaluationPrompt" ? t("evaluationPrompt") : defaultPrompt;
    evaluationPrompt += "\n\n";
    
    // 添加每个对话的内容
    conversations.forEach((conversation, index) => {
      evaluationPrompt += `### ${t("model")} ${index + 1}: ${conversation.modelId}\n`;
      conversation.messages.forEach(message => {
        const role = message.role === 'user' ? (t("user") || "用户") : (t("assistant") || "助手");
        evaluationPrompt += `**${role}**: ${message.content}\n\n`;
      });
      evaluationPrompt += "\n";
    });
    
    // 添加评估指令
    const defaultInstructions = "请针对每个模型给出得分（满分100分）和详细评价，包括各自的优缺点。请以表格形式总结各模型得分，并详细阐述评分依据。";
    const instructions = t("evaluationInstructions") && t("evaluationInstructions") !== "evaluationInstructions" ? t("evaluationInstructions") : defaultInstructions;
    evaluationPrompt += instructions;
    
    return evaluationPrompt;
  };

  // 评估对话
  const evaluateConversations = async () => {
    if (conversations.length === 0 || conversations[0]?.messages.length < 2) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 生成用于评估的提示
      const evaluationPrompt = generateEvaluationPrompt(conversations);
      console.log("评估提示:", evaluationPrompt); // 调试信息
      
      // 创建评估结果的副本，为每个对话添加评分和反馈字段
      const updatedConversations: ConversationResult[] = conversations.map(conversation => ({
        ...conversation,
        score: undefined,
        feedback: ""
      }));
      setConversations(updatedConversations);
      
      // 切换到结果标签以便用户看到流式输出
      setCurrentTab("results");
      
      console.log("发送评估请求到:", "/api/all-model"); // 调试 API 地址
      
      // 创建一个简单的非流式API请求，更可靠地获取完整响应
      const response = await fetch(`/api/all-model`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: evaluationPrompt,
          model: "gpt-4o",
          system: "你是一个专业的AI助手评估专家，擅长评估不同AI模型在对话中的表现。请公平、客观地给出评分和详细分析。",
          stream: false // 使用非流式请求
        }),
      });
      
      console.log("API响应状态:", response.status); // 调试响应状态
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => "无法获取错误详情");
        console.error("API错误详情:", errorText);
        throw new Error(`评估API返回状态码 ${response.status}: ${errorText}`);
      }
      
      // 获取响应内容
      const textContent = await response.text();
      console.log("获取的文本响应内容长度:", textContent.length);
      
      if (textContent && textContent.trim()) {
        // 更新所有模型的反馈内容
        const tempConvs: ConversationResult[] = JSON.parse(JSON.stringify(updatedConversations));
        
        // 提取评分
        const scoreRegex = /(?:模型|Model)\s*(\d+)[\s\S]*?(?:得分|分数|Score|评分|分|:|：)\s*(\d+)/gi;
        let match;
        while ((match = scoreRegex.exec(textContent)) !== null) {
          const modelIndex = parseInt(match[1]) - 1;
          const score = parseInt(match[2]);
          console.log(`提取到评分: 模型${modelIndex+1} = ${score}`);
          if (modelIndex >= 0 && modelIndex < tempConvs.length && !isNaN(score)) {
            tempConvs[modelIndex] = {
              ...tempConvs[modelIndex],
              score: score
            };
          }
        }
        
        // 为所有模型设置相同的反馈内容
        for (let i = 0; i < tempConvs.length; i++) {
          tempConvs[i] = {
            ...tempConvs[i],
            feedback: textContent
          };
        }
        
        // 更新状态
        setConversations([...tempConvs]);
        
        // 如果需要回调
        if (onEvaluate) {
          const results = {
            conversations: tempConvs,
            evaluationResult: textContent
          };
          onEvaluate(results);
        }
      } else {
        throw new Error("API返回的评估内容为空");
      }
      
    } catch (error) {
      console.error("评估过程中出错:", error);
      // 显示错误消息给用户
      alert(`评估失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 选择模型进行对话评估
  const handleSelectModels = () => {
    if (activeModelIds.length < 2) {
      alert(t("selectAtLeastTwoModels"));
      return;
    }
    
    initializeConversations();
    setCurrentTab("conversation");
  };

  // 切换模型选择
  const toggleModelSelection = (modelId: string) => {
    setActiveModelIds(prev => 
      prev.includes(modelId)
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  // Toggle function for collapsible panels
  const toggleModelPanel = (modelId: string) => {
    setOpenModelIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(modelId)) {
        newSet.delete(modelId);
      } else {
        newSet.add(modelId);
      }
      return newSet;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <MessageCircle className="mr-2 h-4 w-4" />
          {t("conversationEvaluation")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>{t("conversationEvaluation")}</DialogTitle>
          <DialogDescription>
            {t("conversationEvaluationDescription")}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex-1 flex flex-col">
          <div className="border-b px-6">
            <TabsList>
              <TabsTrigger value="setup">{t("setup")}</TabsTrigger>
              <TabsTrigger 
                value="conversation" 
                disabled={!conversations.length}
              >
                {t("conversation")}
              </TabsTrigger>
              <TabsTrigger 
                value="results" 
                disabled={!conversations.some(c => c.score !== undefined)}
              >
                {t("results")}
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="setup" className="flex-1 p-6 pt-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t("selectModels")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("selectModelsDescription")}
              </p>
              
              <ScrollArea className="h-[300px] pr-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {models.map(model => (
                    <Button
                      key={model.id}
                      variant={activeModelIds.includes(model.id) ? "default" : "outline"}
                      className="justify-start overflow-hidden"
                      onClick={() => toggleModelSelection(model.id)}
                    >
                      <span className="truncate">{model.id}</span>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="pt-4">
                <Button 
                  onClick={handleSelectModels}
                  disabled={activeModelIds.length < 2}
                >
                  {t("startConversation")}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="conversation" className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 pb-2 flex flex-wrap items-center justify-between border-b">
              <div className="mb-2 sm:mb-0">
                <h3 className="text-lg font-medium">
                  {t("conversationRound", { count: currentRound })}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("modelsInConversation", { count: conversations.length })}
                </p>
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearConversations}
                  disabled={isLoading || !conversations.length}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("clear")}
                </Button>
                <Button
                  size="sm"
                  onClick={evaluateConversations}
                  disabled={isLoading || conversations.length === 0 || conversations[0]?.messages.length < 2}
                >
                  {t("evaluate")}
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-[calc(100vh-260px)] w-full custom-scrollbar" ref={scrollAreaRef}>
                <div className="p-4 space-y-8">
                  {conversations.map((conversation, convIndex) => (
                    <Collapsible key={conversation.id} open={openModelIds.has(conversation.modelId)}>
                      <CollapsibleTrigger 
                        className="flex items-center justify-between w-full px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-100 mb-2 hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleModelPanel(conversation.modelId)}
                      >
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="px-2 py-1 bg-blue-50 text-blue-700 border-blue-200">
                            {t("model")} {convIndex + 1}
                          </Badge>
                          <span className="text-sm font-medium text-gray-700">{conversation.modelId}</span>
                        </div>
                        {openModelIds.has(conversation.modelId) ? (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                          <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                            {conversation.messages.map((message) => (
                              <div 
                                key={message.id}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                              >
                                <div 
                                  className={`max-w-[90%] md:max-w-[80%] rounded-lg p-3 ${
                                    message.role === 'user' 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'bg-gray-50 border border-gray-100'
                                  }`}
                                >
                                  <ReactMarkdown 
                                    className="prose prose-sm dark:prose-invert break-words whitespace-pre-wrap overflow-hidden"
                                    components={{
                                      // 覆盖默认元素以确保它们适应容器
                                      p: ({ children }) => <p className="my-1 max-w-full">{children}</p>,
                                      pre: ({ node, inline, className, children, ...props }: any) => {
                                        if (inline) {
                                          return <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs" {...props}>{children}</code>
                                        }
                                        return <code className={`${className} block overflow-x-auto text-xs max-w-full`} {...props}>{children}</code>
                                      },
                                      code: ({ node, inline, className, children, ...props }: any) => {
                                        if (inline) {
                                          return <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs" {...props}>{children}</code>
                                        }
                                        return <code className={`${className} block overflow-x-auto text-xs max-w-full`} {...props}>{children}</code>
                                      },
                                      ul: ({ children }) => <ul className="list-disc pl-4 my-1 max-w-full">{children}</ul>,
                                      ol: ({ children }) => <ol className="list-decimal pl-4 my-1 max-w-full">{children}</ol>,
                                      li: ({ children }) => <li className="my-0.5 max-w-full">{children}</li>,
                                      table: ({ children }) => <div className="overflow-x-auto my-2 max-w-full"><table className="min-w-[10rem] border border-gray-300 dark:border-gray-700 text-xs">{children}</table></div>,
                                      img: ({ src, alt }) => <img src={src} alt={alt} className="max-w-full h-auto my-2 rounded" style={{ maxHeight: '180px' }} />
                                    }}
                                  >
                                    {message.content}
                                  </ReactMarkdown>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </ScrollArea>
            </div>
            
            <div className="p-4 border-t bg-white">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Textarea
                  placeholder={t("typeMessage")}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="flex-1 resize-none min-h-[80px] border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    // 允许使用Enter键发送消息（除非同时按下Shift键）
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (userInput.trim() && !isLoading) {
                        addUserMessage();
                      }
                    }
                  }}
                />
                <div className="flex-shrink-0 flex justify-end sm:self-end">
                  <Button
                    disabled={!userInput.trim() || isLoading}
                    onClick={addUserMessage}
                    className="h-10 px-4"
                  >
                    {isLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    <span>{t("send")}</span>
                  </Button>
                </div>
              </div>
              {isLoading && (
                <div className="mt-2 text-xs text-center text-muted-foreground">
                  正在处理请求，请稍候...
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="flex-1 flex flex-col">
            <div className="p-4 pb-2 border-b">
              <h3 className="text-xl font-semibold">{t("evaluationResults")}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t("evaluationResultsDescription")}
              </p>
              
              {/* 调试按钮放在右上角 */}
              <div className="absolute top-4 right-4">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    console.log("当前评估状态:", {
                      conversations: conversations.map(c => ({
                        modelId: c.modelId,
                        feedbackLength: c.feedback?.length || 0,
                        score: c.score
                      })),
                      isLoading
                    });
                    alert(`当前评估状态:\n已加载: ${!isLoading}\n模型数量: ${conversations.length}\n首个模型反馈长度: ${conversations[0]?.feedback?.length || 0}`);
                  }}
                >
                  调试信息
                </Button>
              </div>
            </div>
            
            <ScrollArea className="flex-1 px-4 pt-4 pb-6 custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-40">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
                  <p className="text-muted-foreground">正在生成评估结果，请稍候...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* 评估总结卡片 */}
                  {conversations.length > 0 && (
                    <Card className="overflow-hidden shadow-sm">
                      <div className="bg-primary-50 dark:bg-primary-950/20 px-5 py-3 border-b flex justify-between items-center">
                        <h4 className="text-lg font-medium text-primary-700 dark:text-primary-300">评估总结</h4>
                        <Badge variant="outline" className="text-xs font-normal">
                          更新于 {new Date().toLocaleTimeString()}
                        </Badge>
                      </div>
                      
                      <div className="border-b">
                        <ScrollArea className="h-[400px]">
                          <div className="prose prose-sm dark:prose-invert max-w-none p-5">
                            {conversations[0]?.feedback ? (
                              <ReactMarkdown
                                components={{
                                  p: ({ children }) => <p className="my-2 max-w-full">{children}</p>,
                                  pre: ({ node, inline, className, children, ...props }: any) => {
                                    if (inline) {
                                      return <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs" {...props}>{children}</code>
                                    }
                                    return <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md my-3 overflow-x-auto text-xs max-w-full">{children}</pre>
                                  },
                                  code: ({ node, inline, className, children, ...props }: any) => {
                                    if (inline) {
                                      return <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs" {...props}>{children}</code>
                                    }
                                    return <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md my-3 overflow-x-auto text-xs max-w-full" {...props}>{children}</pre>
                                  },
                                  table: ({ children }) => (
                                    <div className="overflow-x-auto my-4 rounded-md border border-gray-200 dark:border-gray-700">
                                      <table className="border-collapse w-full text-sm">{children}</table>
                                    </div>
                                  ),
                                  th: ({ children }) => <th className="border-b border-r last:border-r-0 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2 text-left font-medium">{children}</th>,
                                  td: ({ children }) => <td className="border-b border-r last:border-r-0 border-gray-200 dark:border-gray-700 px-4 py-2">{children}</td>,
                                  ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 my-2">{children}</ul>,
                                  ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 my-2">{children}</ol>,
                                  li: ({ children }) => <li className="my-0.5">{children}</li>,
                                  h1: ({ children }) => <h1 className="text-xl font-bold mt-6 mb-2 pb-1 border-b border-gray-200 dark:border-gray-700">{children}</h1>,
                                  h2: ({ children }) => <h2 className="text-lg font-bold mt-5 mb-2">{children}</h2>,
                                  h3: ({ children }) => <h3 className="text-md font-bold mt-4 mb-2">{children}</h3>
                                }}
                              >
                                {conversations[0].feedback}
                              </ReactMarkdown>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-8 text-center">
                                <p className="text-muted-foreground mb-2">暂无评估结果</p>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="mt-2"
                                  onClick={() => evaluateConversations()}
                                  disabled={isLoading}
                                >
                                  重新评估
                                </Button>
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </div>
                      
                      {/* 底部操作区 */}
                      <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900 flex justify-between items-center text-sm">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <span className="text-muted-foreground mr-2">模型数量:</span>
                            <Badge variant="secondary">{conversations.length}</Badge>
                          </div>
                          <div className="flex items-center">
                            <span className="text-muted-foreground mr-2">总消息数:</span>
                            <Badge variant="secondary">
                              {conversations.reduce((total, conv) => total + conv.messages.length, 0)}
                            </Badge>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => evaluateConversations()}
                          disabled={isLoading || conversations.length === 0}
                        >
                          {isLoading ? (
                            <>
                              <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent mr-1" />
                              评估中...
                            </>
                          ) : "重新评估"}
                        </Button>
                      </div>
                    </Card>
                  )}

                  {/* 模型详细评估卡片 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {conversations.map((conversation, index) => (
                      <Card key={conversation.id} className="overflow-hidden shadow-sm">
                        <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-950/30 dark:to-primary-900/20 px-5 py-3 border-b">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium flex items-center">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-200 dark:bg-primary-800 text-primary-700 dark:text-primary-300 text-xs mr-2">
                                {index + 1}
                              </span>
                              {conversation.modelId}
                            </h4>
                            {conversation.score !== undefined && (
                              <Badge className={`${
                                conversation.score >= 85 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                                conversation.score >= 70 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              }`}>
                                得分: {conversation.score}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">消息数量: {conversation.messages.length}</span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 px-2 text-xs"
                                onClick={() => setCurrentTab("chat")}
                              >
                                查看对话
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
