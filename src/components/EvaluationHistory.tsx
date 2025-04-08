"use client";

import { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
import { useTranslations } from "next-intl";
import { BarChart, Download, History, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";

export interface EvaluationResult {
  id: string;
  date: Date;
  question: string;
  models: {
    modelName: string;
    score: number;
    strengths?: string[];
    weaknesses?: string[];
  }[];
}

// 评估历史本地存储键名
const HISTORY_STORAGE_KEY = "modelJudge_evaluationHistory";

interface EvaluationHistoryProps {
  onSelectHistoryItem?: (item: EvaluationResult) => void;
}

// 创建一个全局存储，用于管理历史记录
let globalHistory: EvaluationResult[] = [];
let historyEventListeners: ((history: EvaluationResult[]) => void)[] = [];

const addToGlobalHistory = (result: Omit<EvaluationResult, "id" | "date">) => {
  const newItem: EvaluationResult = {
    id: uuidv4(),
    date: new Date(),
    ...result
  };
  
  globalHistory = [newItem, ...globalHistory].slice(0, 100); // 保留最近100条记录
  
  if (typeof window !== "undefined") {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(globalHistory));
  }
  
  // 通知所有监听器
  historyEventListeners.forEach(listener => listener(globalHistory));
  
  return newItem;
};

export default function EvaluationHistory({ onSelectHistoryItem }: EvaluationHistoryProps) {
  const t = useTranslations("EvaluationHistory");
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<EvaluationResult[]>([]);
  const [selectedItem, setSelectedItem] = useState<EvaluationResult | null>(null);

  useEffect(() => {
    // 初始加载历史记录
    if (typeof window !== "undefined") {
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        try {
          const parsedHistory = JSON.parse(storedHistory).map((item: any) => ({
            ...item,
            date: new Date(item.date)
          }));
          
          globalHistory = parsedHistory;
          setHistory(parsedHistory);
        } catch (error) {
          console.error("Failed to parse history:", error);
        }
      }
    }
    
    // 添加历史记录变化监听器
    const historyListener = (updatedHistory: EvaluationResult[]) => {
      setHistory([...updatedHistory]);
    };
    
    historyEventListeners.push(historyListener);
    
    return () => {
      // 组件卸载时移除监听器
      historyEventListeners = historyEventListeners.filter(
        listener => listener !== historyListener
      );
    };
  }, []);

  // 清除选定的历史记录
  const clearSelectedHistory = (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    globalHistory = updatedHistory;
    setHistory(updatedHistory);
    
    if (typeof window !== "undefined") {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
    }
    
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
    
    // 通知所有监听器
    historyEventListeners.forEach(listener => listener(updatedHistory));
  };

  // 清除所有历史记录
  const clearAllHistory = () => {
    if (confirm(t("confirmClearAll"))) {
      globalHistory = [];
      setHistory([]);
      setSelectedItem(null);
      
      if (typeof window !== "undefined") {
        localStorage.removeItem(HISTORY_STORAGE_KEY);
      }
      
      // 通知所有监听器
      historyEventListeners.forEach(listener => listener([]));
    }
  };

  // 导出历史记录为JSON文件
  const exportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `modelJudge_history_${format(new Date(), "yyyy-MM-dd")}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // 选择历史记录条目
  const handleSelectItem = (item: EvaluationResult) => {
    setSelectedItem(item);
    
    if (onSelectHistoryItem) {
      onSelectHistoryItem(item);
      setIsOpen(false);
    }
  };

  // 获取模型的最高分
  const getHighestScore = (item: EvaluationResult) => {
    if (!item.models.length) return 0;
    return Math.max(...item.models.map(m => m.score));
  };

  // 获取得分最高的模型名称
  const getWinningModel = (item: EvaluationResult) => {
    if (!item.models.length) return "-";
    const highestScore = getHighestScore(item);
    const winningModels = item.models.filter(m => m.score === highestScore);
    return winningModels.map(m => m.modelName).join(", ");
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <History className="mr-2 h-4 w-4" />
            {t("viewHistory")}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("evaluationHistory")}</DialogTitle>
            <DialogDescription>
              {t("evaluationHistoryDescription")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="my-4">
            {history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t("noHistoryRecords")}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">{t("date")}</TableHead>
                    <TableHead>{t("question")}</TableHead>
                    <TableHead className="w-[120px]">{t("models")}</TableHead>
                    <TableHead className="w-[180px]">{t("bestModel")}</TableHead>
                    <TableHead className="w-[100px] text-right">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item) => (
                    <TableRow 
                      key={item.id} 
                      className={`cursor-pointer ${selectedItem?.id === item.id ? 'bg-muted' : ''}`}
                      onClick={() => handleSelectItem(item)}
                    >
                      <TableCell>
                        {format(item.date, "yyyy-MM-dd HH:mm")}
                      </TableCell>
                      <TableCell className="font-medium truncate max-w-[200px]">
                        {item.question}
                      </TableCell>
                      <TableCell>{item.models.length}</TableCell>
                      <TableCell className="truncate max-w-[150px]">
                        {getWinningModel(item)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearSelectedHistory(item.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">{t("delete")}</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          
          <DialogFooter className="flex justify-between items-center">
            {history.length > 0 && (
              <Button
                variant="destructive"
                onClick={clearAllHistory}
                size="sm"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("clearAll")}
              </Button>
            )}
            <div>
              {history.length > 0 && (
                <Button 
                  variant="outline" 
                  onClick={exportHistory}
                  className="mr-2"
                  size="sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {t("export")}
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={() => setIsOpen(false)}
                size="sm"
              >
                {t("close")}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {selectedItem && (
        <Button 
          variant="link" 
          size="sm" 
          className="px-0 text-muted-foreground"
          onClick={() => setIsOpen(true)}
        >
          <BarChart className="mr-1 h-3 w-3" />
          {t("showingResultsFromHistory")}
        </Button>
      )}
    </>
  );
}

// 导出添加到历史记录的钩子函数
export function useEvaluationHistory() {
  // 添加评估结果到历史记录
  const addToHistory = (result: Omit<EvaluationResult, "id" | "date">) => {
    return addToGlobalHistory(result);
  };
  
  return { addToHistory };
}
