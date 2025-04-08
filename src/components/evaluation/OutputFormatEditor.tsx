"use client"

import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OutputFormatEditorProps {
  initialValue: string;
  onChange: (value: string) => void;
}

/**
 * 输出格式编辑器组件
 * 允许用户自定义评估输出的格式
 */
export default function OutputFormatEditor({ initialValue, onChange }: OutputFormatEditorProps) {
  const [format, setFormat] = useState<string>(initialValue);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setFormat(newValue);
    onChange(newValue);
  };

  const resetToDefault = () => {
    const defaultFormat = `# 评估报告

## 评估标准

| 评估项目 | ${"{model_name_1}"} | ${"{model_name_2}"} |
|---------|------|------|
| 相关性 | {score} | {score} |
| 准确性 | {score} | {score} |
| 信息量 | {score} | {score} |
| 流畅性 | {score} | {score} |
| 语法正确性 | {score} | {score} |
| 风格适配性 | {score} | {score} |
| 创新性 | {score} | {score} |
| 吸引力 | {score} | {score} |
| 偏见与公平性 | {score} | {score} |
| 内容安全 | {score} | {score} |
| 合规性 | {score} | {score} |
| 总分 | {total_score} | {total_score} |

## 详细分析

### ${"{model_name_1}"}
{analysis}

### ${"{model_name_2}"}
{analysis}

## 改进建议

### ${"{model_name_1}"}
{suggestions}

### ${"{model_name_2}"}
{suggestions}

## 对比结论
{conclusion}`;
    
    setFormat(defaultFormat);
    onChange(defaultFormat);
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>输出格式编辑器</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={format}
          onChange={handleChange}
          className="min-h-[300px] font-mono text-sm"
          placeholder="输入评估输出格式模板..."
        />
        <div className="flex justify-end mt-2">
          <Button variant="outline" onClick={resetToDefault} className="ml-2">
            重置为默认格式
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
