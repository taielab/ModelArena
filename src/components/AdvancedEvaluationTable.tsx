"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Copy, Info } from "lucide-react";

// 简化版Tooltip组件，避免依赖
const Tooltip = ({ children, content }: { children: React.ReactNode; content: string }) => {
  const [show, setShow] = useState(false);
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute z-50 p-2 bg-black text-white text-xs rounded shadow-lg bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-max max-w-xs">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
        </div>
      )}
    </div>
  );
};

// 定义评估结果接口
export interface EvaluationDetailScore {
  // 内容质量 (0-11分)
  relevance: number; // 相关性 (4分)
  accuracy: number; // 准确性 (4分)
  information: number; // 信息量 (3分)
  
  // 内容规范性 (0-6分)
  fluency: number; // 流畅性 (2分)
  grammar: number; // 语法正确性 (2分)
  style: number; // 风格适配性 (2分)
  
  // 创意能力 (0-7分)
  innovation: number; // 创新性 (4分)
  appeal: number; // 吸引力 (3分)
  
  // 伦理与安全 (0-6分)
  fairness: number; // 偏见与公平性 (2分)
  safety: number; // 内容安全 (2分)
  compliance: number; // 合规性 (2分)
}

export interface EvaluationResult {
  id: string; // 用例ID
  category: string; // 场景分类
  promptDescription: string; // 提示词描述
  promptTokenCount: number; // 提示词Token数
  scores: EvaluationDetailScore; // 各项评分
  totalScore: number; // 总评分
  optimizationSuggestions: string; // 优化建议
  originalContent: string; // 被评估文案原文
}

interface AdvancedEvaluationTableProps {
  results: EvaluationResult[];
  allowEditing?: boolean;
  onResultsChange?: (results: EvaluationResult[]) => void;
}

const AdvancedEvaluationTable: React.FC<AdvancedEvaluationTableProps> = ({
  results,
  allowEditing = false,
  onResultsChange,
}) => {
  const [editableResults, setEditableResults] = useState<EvaluationResult[]>(results);
  
  // 处理单元格值变化
  const handleCellChange = (index: number, field: string, value: any) => {
    if (!allowEditing) return;
    
    const newResults = [...editableResults];
    
    // 处理嵌套字段 (例如 scores.relevance)
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      newResults[index] = {
        ...newResults[index],
        [parent]: {
          ...newResults[index][parent as keyof EvaluationResult] as object,
          [child]: value
        }
      };
    } else {
      // 直接字段
      newResults[index] = {
        ...newResults[index],
        [field]: value
      };
    }
    
    // 重新计算总分
    if (field.startsWith('scores.')) {
      const scores = newResults[index].scores;
      const totalScore = 
        scores.relevance + scores.accuracy + scores.information +
        scores.fluency + scores.grammar + scores.style +
        scores.innovation + scores.appeal +
        scores.fairness + scores.safety + scores.compliance;
      
      newResults[index].totalScore = totalScore;
    }
    
    setEditableResults(newResults);
    if (onResultsChange) {
      onResultsChange(newResults);
    }
  };
  
  // 导出为Excel (简化版，仅复制CSV格式)
  const exportToExcel = () => {
    // 创建表格标题行
    let csvContent = "用例ID,场景分类,提示词描述,提示词Token数,相关性(4),准确性(4),信息量(3),流畅性(2),语法正确性(2),风格适配性(2),创新性(4),吸引力(3),偏见与公平性(2),内容安全(2),合规性(2),合计(30),优化建议,被评估文案原文\n";
    
    // 添加每行数据
    editableResults.forEach(result => {
      const rowData = [
        result.id,
        result.category,
        `"${result.promptDescription.replace(/"/g, '""')}"`,
        result.promptTokenCount,
        result.scores.relevance,
        result.scores.accuracy,
        result.scores.information,
        result.scores.fluency,
        result.scores.grammar,
        result.scores.style,
        result.scores.innovation,
        result.scores.appeal,
        result.scores.fairness,
        result.scores.safety,
        result.scores.compliance,
        result.totalScore,
        `"${result.optimizationSuggestions.replace(/"/g, '""')}"`,
        `"${result.originalContent.substring(0, 100).replace(/"/g, '""')}..."`
      ];
      
      csvContent += rowData.join(',') + '\n';
    });
    
    // 创建下载链接
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `文案评估结果_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // 复制为Markdown表格
  const copyAsMarkdown = () => {
    let markdown = '| 用例ID | 场景分类 | 提示词描述 | 提示词Token数 | 内容质量(0-11) | 内容规范性(0-6) | 创意能力(0-7) | 伦理与安全(0-6) | 合计 | 优化建议 | 被评估文案原文 |\n';
    markdown += '|--------|----------|------------|---------------|--------------|----------------|--------------|----------------|------|----------|----------------|\n';
    
    editableResults.forEach(result => {
      const contentQuality = result.scores.relevance + result.scores.accuracy + result.scores.information;
      const contentNorms = result.scores.fluency + result.scores.grammar + result.scores.style;
      const creativity = result.scores.innovation + result.scores.appeal;
      const ethics = result.scores.fairness + result.scores.safety + result.scores.compliance;
      
      markdown += `| ${result.id} | ${result.category} | ${result.promptDescription} | ${result.promptTokenCount} | ${contentQuality} | ${contentNorms} | ${creativity} | ${ethics} | ${result.totalScore} | ${result.optimizationSuggestions} | ${result.originalContent.substring(0, 50)}... |\n`;
    });
    
    navigator.clipboard.writeText(markdown);
    alert("表格已复制为Markdown格式");
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="text-xl">文案生成评估结果</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={exportToExcel} className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>导出CSV</span>
            </Button>
            <Button size="sm" variant="outline" onClick={copyAsMarkdown} className="flex items-center gap-1">
              <Copy className="h-4 w-4" />
              <span>复制表格</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] max-h-[70vh] w-full rounded-md border">
          <div className="p-4">
            <Table className="min-w-[1200px]">
              <TableHeader className="bg-muted/50 sticky top-0">
                <TableRow>
                  <TableHead rowSpan={2} className="w-[80px]">用例ID</TableHead>
                  <TableHead rowSpan={2} className="w-[120px]">场景分类</TableHead>
                  <TableHead rowSpan={2} className="w-[200px]">提示词描述</TableHead>
                  <TableHead rowSpan={2} className="w-[100px] text-center">提示词Token数</TableHead>
                  
                  {/* 内容质量 - 3个子项 */}
                  <TableHead colSpan={3} className="text-center border">内容质量 (0-11)</TableHead>
                  
                  {/* 内容规范性 - 3个子项 */}
                  <TableHead colSpan={3} className="text-center border">内容规范性 (0-6)</TableHead>
                  
                  {/* 创意能力 - 2个子项 */}
                  <TableHead colSpan={2} className="text-center border">创意能力 (0-7)</TableHead>
                  
                  {/* 伦理与安全 - 3个子项 */}
                  <TableHead colSpan={3} className="text-center border">伦理与安全 (0-6)</TableHead>
                  
                  <TableHead rowSpan={2} className="w-[80px] text-center">合计</TableHead>
                  <TableHead rowSpan={2} className="w-[200px]">优化建议</TableHead>
                  <TableHead rowSpan={2} className="w-[200px]">被评估文案原文</TableHead>
                </TableRow>
                
                <TableRow className="bg-muted/30">
                  {/* 内容质量子项 */}
                  <TableHead className="text-center w-[70px] p-1 border">相关性<br/>(4)</TableHead>
                  <TableHead className="text-center w-[70px] p-1 border">准确性<br/>(4)</TableHead>
                  <TableHead className="text-center w-[70px] p-1 border">信息量<br/>(3)</TableHead>
                  
                  {/* 内容规范性子项 */}
                  <TableHead className="text-center w-[70px] p-1 border">流畅性<br/>(2)</TableHead>
                  <TableHead className="text-center w-[70px] p-1 border">语法正确性<br/>(2)</TableHead>
                  <TableHead className="text-center w-[70px] p-1 border">风格适配性<br/>(2)</TableHead>
                  
                  {/* 创意能力子项 */}
                  <TableHead className="text-center w-[70px] p-1 border">创新性<br/>(4)</TableHead>
                  <TableHead className="text-center w-[70px] p-1 border">吸引力<br/>(3)</TableHead>
                  
                  {/* 伦理与安全子项 */}
                  <TableHead className="text-center w-[70px] p-1 border">偏见与公平性<br/>(2)</TableHead>
                  <TableHead className="text-center w-[70px] p-1 border">内容安全<br/>(2)</TableHead>
                  <TableHead className="text-center w-[70px] p-1 border">合规性<br/>(2)</TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {editableResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={17} className="text-center text-muted-foreground py-6">
                      暂无评估结果数据
                    </TableCell>
                  </TableRow>
                ) : (
                  editableResults.map((result, index) => (
                    <TableRow key={result.id || index}>
                      {/* 基本信息 */}
                      <TableCell className="align-top">
                        {allowEditing ? (
                          <Input 
                            value={result.id} 
                            onChange={e => handleCellChange(index, 'id', e.target.value)}
                            className="text-sm h-8"
                          />
                        ) : (
                          result.id
                        )}
                      </TableCell>
                      
                      <TableCell className="align-top">
                        {allowEditing ? (
                          <Input 
                            value={result.category} 
                            onChange={e => handleCellChange(index, 'category', e.target.value)}
                            className="text-sm h-8"
                          />
                        ) : (
                          result.category
                        )}
                      </TableCell>
                      
                      <TableCell className="align-top">
                        {allowEditing ? (
                          <Textarea 
                            value={result.promptDescription} 
                            onChange={e => handleCellChange(index, 'promptDescription', e.target.value)}
                            className="text-sm"
                            rows={3}
                          />
                        ) : (
                          result.promptDescription
                        )}
                      </TableCell>
                      
                      <TableCell className="text-center align-top">
                        {allowEditing ? (
                          <Input 
                            type="number"
                            value={result.promptTokenCount} 
                            onChange={e => handleCellChange(index, 'promptTokenCount', parseInt(e.target.value))}
                            className="text-sm h-8 text-center"
                          />
                        ) : (
                          result.promptTokenCount
                        )}
                      </TableCell>
                      
                      {/* 内容质量分数 */}
                      <TableCell className="text-center p-1 align-top">
                        {allowEditing ? (
                          <Input 
                            type="number"
                            min="0"
                            max="4"
                            value={result.scores.relevance} 
                            onChange={e => handleCellChange(index, 'scores.relevance', parseInt(e.target.value) || 0)}
                            className="text-sm h-8 text-center"
                          />
                        ) : (
                          result.scores.relevance
                        )}
                      </TableCell>
                      
                      <TableCell className="text-center p-1 align-top">
                        {allowEditing ? (
                          <Input 
                            type="number"
                            min="0"
                            max="4"
                            value={result.scores.accuracy} 
                            onChange={e => handleCellChange(index, 'scores.accuracy', parseInt(e.target.value) || 0)}
                            className="text-sm h-8 text-center"
                          />
                        ) : (
                          result.scores.accuracy
                        )}
                      </TableCell>
                      
                      <TableCell className="text-center p-1 align-top">
                        {allowEditing ? (
                          <Input 
                            type="number"
                            min="0"
                            max="3"
                            value={result.scores.information} 
                            onChange={e => handleCellChange(index, 'scores.information', parseInt(e.target.value) || 0)}
                            className="text-sm h-8 text-center"
                          />
                        ) : (
                          result.scores.information
                        )}
                      </TableCell>
                      
                      {/* 内容规范性分数 */}
                      <TableCell className="text-center p-1 align-top">
                        {allowEditing ? (
                          <Input 
                            type="number"
                            min="0"
                            max="2"
                            value={result.scores.fluency} 
                            onChange={e => handleCellChange(index, 'scores.fluency', parseInt(e.target.value) || 0)}
                            className="text-sm h-8 text-center"
                          />
                        ) : (
                          result.scores.fluency
                        )}
                      </TableCell>
                      
                      <TableCell className="text-center p-1 align-top">
                        {allowEditing ? (
                          <Input 
                            type="number"
                            min="0"
                            max="2"
                            value={result.scores.grammar} 
                            onChange={e => handleCellChange(index, 'scores.grammar', parseInt(e.target.value) || 0)}
                            className="text-sm h-8 text-center"
                          />
                        ) : (
                          result.scores.grammar
                        )}
                      </TableCell>
                      
                      <TableCell className="text-center p-1 align-top">
                        {allowEditing ? (
                          <Input 
                            type="number"
                            min="0"
                            max="2"
                            value={result.scores.style} 
                            onChange={e => handleCellChange(index, 'scores.style', parseInt(e.target.value) || 0)}
                            className="text-sm h-8 text-center"
                          />
                        ) : (
                          result.scores.style
                        )}
                      </TableCell>
                      
                      {/* 创意能力分数 */}
                      <TableCell className="text-center p-1 align-top">
                        {allowEditing ? (
                          <Input 
                            type="number"
                            min="0"
                            max="4"
                            value={result.scores.innovation} 
                            onChange={e => handleCellChange(index, 'scores.innovation', parseInt(e.target.value) || 0)}
                            className="text-sm h-8 text-center"
                          />
                        ) : (
                          result.scores.innovation
                        )}
                      </TableCell>
                      
                      <TableCell className="text-center p-1 align-top">
                        {allowEditing ? (
                          <Input 
                            type="number"
                            min="0"
                            max="3"
                            value={result.scores.appeal} 
                            onChange={e => handleCellChange(index, 'scores.appeal', parseInt(e.target.value) || 0)}
                            className="text-sm h-8 text-center"
                          />
                        ) : (
                          result.scores.appeal
                        )}
                      </TableCell>
                      
                      {/* 伦理与安全分数 */}
                      <TableCell className="text-center p-1 align-top">
                        {allowEditing ? (
                          <Input 
                            type="number"
                            min="0"
                            max="2"
                            value={result.scores.fairness} 
                            onChange={e => handleCellChange(index, 'scores.fairness', parseInt(e.target.value) || 0)}
                            className="text-sm h-8 text-center"
                          />
                        ) : (
                          result.scores.fairness
                        )}
                      </TableCell>
                      
                      <TableCell className="text-center p-1 align-top">
                        {allowEditing ? (
                          <Input 
                            type="number"
                            min="0"
                            max="2"
                            value={result.scores.safety} 
                            onChange={e => handleCellChange(index, 'scores.safety', parseInt(e.target.value) || 0)}
                            className="text-sm h-8 text-center"
                          />
                        ) : (
                          result.scores.safety
                        )}
                      </TableCell>
                      
                      <TableCell className="text-center p-1 align-top">
                        {allowEditing ? (
                          <Input 
                            type="number"
                            min="0"
                            max="2"
                            value={result.scores.compliance} 
                            onChange={e => handleCellChange(index, 'scores.compliance', parseInt(e.target.value) || 0)}
                            className="text-sm h-8 text-center"
                          />
                        ) : (
                          result.scores.compliance
                        )}
                      </TableCell>
                      
                      {/* 总计 */}
                      <TableCell className="text-center font-bold bg-muted/20 align-top">
                        {result.totalScore}
                      </TableCell>
                      
                      {/* 优化建议 */}
                      <TableCell className="align-top">
                        {allowEditing ? (
                          <Textarea 
                            value={result.optimizationSuggestions} 
                            onChange={e => handleCellChange(index, 'optimizationSuggestions', e.target.value)}
                            className="text-sm"
                            rows={3}
                          />
                        ) : (
                          result.optimizationSuggestions
                        )}
                      </TableCell>
                      
                      {/* 被评估文案原文 */}
                      <TableCell className="align-top">
                        {allowEditing ? (
                          <Textarea 
                            value={result.originalContent} 
                            onChange={e => handleCellChange(index, 'originalContent', e.target.value)}
                            className="text-sm"
                            rows={4}
                          />
                        ) : (
                          <div className="max-h-[120px] overflow-y-auto text-sm">
                            {result.originalContent}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AdvancedEvaluationTable;
