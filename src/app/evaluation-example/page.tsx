"use client";

import React, { useState } from "react";
import AdvancedEvaluationTable, { EvaluationResult } from "@/components/AdvancedEvaluationTable";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function EvaluationExamplePage() {
  // 示例数据
  const initialResults: EvaluationResult[] = [
    {
      id: "001",
      category: "广告文案",
      promptDescription: "创作一段手机促销文案，强调其相机功能和长续航",
      promptTokenCount: 28,
      scores: {
        relevance: 3,
        accuracy: 4,
        information: 3,
        fluency: 2,
        grammar: 2,
        style: 2,
        innovation: 3,
        appeal: 2,
        fairness: 2,
        safety: 2,
        compliance: 2
      },
      totalScore: 27,
      optimizationSuggestions: "可以更加突出产品的独特卖点，增加一些数据支持论点",
      originalContent: "全新升级的超感光镜头，捕捉每一个精彩瞬间。120Hz高刷新率屏幕，畅享流畅体验。5000mAh超大电池，告别续航焦虑。现在购买，享12期免息，再送豪华配件礼包。限时优惠，先到先得！"
    },
    {
      id: "002",
      category: "产品描述",
      promptDescription: "编写一段智能手表的产品介绍，突出其健康监测功能",
      promptTokenCount: 24,
      scores: {
        relevance: 4,
        accuracy: 3,
        information: 2,
        fluency: 2,
        grammar: 2,
        style: 1,
        innovation: 2,
        appeal: 2,
        fairness: 2,
        safety: 2,
        compliance: 1
      },
      totalScore: 23,
      optimizationSuggestions: "健康功能描述可以更加具体，避免使用'最佳'等极限词",
      originalContent: "这款智能手表配备了全天候健康监测系统，24小时实时监测心率、血氧、压力指数，并提供专业睡眠分析报告。内置GPS和十余种运动模式，是您健身的最佳伴侣。超长续航可达14天，IP68防水，支持来电、短信提醒和音乐控制。"
    },
  ];

  const [results, setResults] = useState<EvaluationResult[]>(initialResults);
  const [allowEditing, setAllowEditing] = useState(false);

  // 处理结果变化
  const handleResultsChange = (newResults: EvaluationResult[]) => {
    setResults(newResults);
  };

  // 添加新评估结果
  const addEmptyResult = () => {
    const emptyScores = {
      relevance: 0,
      accuracy: 0,
      information: 0,
      fluency: 0,
      grammar: 0,
      style: 0,
      innovation: 0,
      appeal: 0,
      fairness: 0,
      safety: 0,
      compliance: 0
    };
    
    const newResult: EvaluationResult = {
      id: `00${results.length + 1}`,
      category: "",
      promptDescription: "",
      promptTokenCount: 0,
      scores: emptyScores,
      totalScore: 0,
      optimizationSuggestions: "",
      originalContent: ""
    };
    
    setResults([...results, newResult]);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">文案评估结果示例</h1>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="editing-mode"
                checked={allowEditing}
                onCheckedChange={setAllowEditing}
              />
              <Label htmlFor="editing-mode">编辑模式</Label>
            </div>
            
            <Button onClick={addEmptyResult} disabled={!allowEditing}>
              添加评估
            </Button>
          </div>
        </div>
        
        <AdvancedEvaluationTable
          results={results}
          allowEditing={allowEditing}
          onResultsChange={handleResultsChange}
        />
        
        <div className="bg-muted p-4 rounded-md">
          <h3 className="font-medium mb-2">使用说明</h3>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>开启"编辑模式"可以修改表格内容和添加新的评估记录</li>
            <li>"导出Excel"按钮将表格数据导出为Excel文件</li>
            <li>"复制表格"按钮将表格内容复制为Markdown格式</li>
            <li>表格可以水平和垂直滚动查看所有内容</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
