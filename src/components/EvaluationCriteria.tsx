"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import { Plus, X } from "lucide-react";

export interface Criterion {
  id: string;
  name: string;
  weight: number;
  enabled: boolean;
  description?: string;
}

const DEFAULT_CRITERIA: Criterion[] = [
  { id: "relevance", name: "relevance", weight: 20, enabled: true },
  { id: "accuracy", name: "accuracy", weight: 20, enabled: true },
  { id: "information", name: "information", weight: 10, enabled: true },
  { id: "fluency", name: "fluency", weight: 10, enabled: true },
  { id: "grammar", name: "grammar", weight: 10, enabled: true },
  { id: "style", name: "style", weight: 5, enabled: true },
  { id: "innovation", name: "innovation", weight: 5, enabled: true },
  { id: "appeal", name: "appeal", weight: 5, enabled: true },
  { id: "fairness", name: "fairness", weight: 5, enabled: true },
  { id: "safety", name: "safety", weight: 5, enabled: true },
  { id: "compliance", name: "compliance", weight: 5, enabled: true }
];

interface EvaluationCriteriaProps {
  criteria: Criterion[];
  onCriteriaChange: (criteria: Criterion[]) => void;
}

export default function EvaluationCriteria({ 
  criteria: initialCriteria = DEFAULT_CRITERIA,
  onCriteriaChange 
}: EvaluationCriteriaProps) {
  const t = useTranslations("EvaluationCriteria");
  const [criteria, setCriteria] = useState<Criterion[]>(initialCriteria);
  const [newCriterionName, setNewCriterionName] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // 获取标准的本地化名称
  const getLocalizedName = (criterion: Criterion): string => {
    // 处理正常ID情况
    if (t.has(criterion.id)) {
      return t(criterion.id);
    }
    
    // 处理包含命名空间的情况 (EvaluationCriteria.相关性)
    if (criterion.name.includes('.')) {
      const parts = criterion.name.split('.');
      const key = parts[parts.length - 1];
      if (t.has(key)) {
        return t(key);
      }
      return key; // 如果没有找到翻译，返回键名最后一部分
    }
    
    // 尝试使用name作为翻译键
    if (t.has(criterion.name)) {
      return t(criterion.name);
    }
    
    // 默认返回原始名称
    return criterion.name;
  };

  // 计算总权重
  const totalWeight = criteria
    .filter(c => c.enabled)
    .reduce((acc, curr) => acc + curr.weight, 0);

  const handleWeightChange = (id: string, value: number[]) => {
    setCriteria(prev => 
      prev.map(criterion => 
        criterion.id === id 
          ? { ...criterion, weight: value[0] } 
          : criterion
      )
    );
  };

  const handleEnableChange = (id: string, checked: boolean) => {
    setCriteria(prev => 
      prev.map(criterion => 
        criterion.id === id 
          ? { ...criterion, enabled: checked } 
          : criterion
      )
    );
  };

  const handleAddCriterion = () => {
    if (!newCriterionName.trim()) return;
    
    const newCriterion: Criterion = {
      id: `custom-${Date.now()}`,
      name: newCriterionName.trim(),
      weight: 10,
      enabled: true
    };
    
    const updatedCriteria = [...criteria, newCriterion];
    setCriteria(updatedCriteria);
    setNewCriterionName("");
  };

  const handleDeleteCriterion = (id: string) => {
    setCriteria(prev => prev.filter(criterion => criterion.id !== id));
  };

  const handleSave = () => {
    // Normalize weights to ensure total is 100
    if (totalWeight > 0) {
      const enabledCriteria = criteria.filter(c => c.enabled);
      const normalizedCriteria = criteria.map(criterion => {
        if (!criterion.enabled) return criterion;
        
        const normalizedWeight = Math.round((criterion.weight / totalWeight) * 100);
        return { ...criterion, weight: normalizedWeight };
      });
      
      onCriteriaChange(normalizedCriteria);
    } else {
      onCriteriaChange(criteria);
    }
    
    setIsOpen(false);
  };

  const handleReset = () => {
    setCriteria(DEFAULT_CRITERIA);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="mb-4">
          {t("customizeCriteria")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("customizeCriteriaTitle")}</DialogTitle>
          <DialogDescription>
            {t("customizeCriteriaDescription")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">{t("currentCriteria")}</h3>
            <div className="text-sm text-muted-foreground">
              {t("totalWeight")}: {totalWeight}%
              {totalWeight !== 100 && totalWeight > 0 && (
                <span className="text-amber-500 ml-2">
                  ({t("willBeNormalized")})
                </span>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            {criteria.map((criterion) => (
              <div key={criterion.id} className="flex items-center space-x-4">
                <Checkbox
                  id={`enable-${criterion.id}`}
                  checked={criterion.enabled}
                  onCheckedChange={(checked) => 
                    handleEnableChange(criterion.id, checked as boolean)
                  }
                />
                <div className="grid flex-1 gap-2">
                  <div className="flex items-center justify-between">
                    <Label 
                      htmlFor={`slider-${criterion.id}`}
                      className={`flex-1 ${!criterion.enabled ? 'text-muted-foreground' : ''}`}
                    >
                      {getLocalizedName(criterion)}
                    </Label>
                    <span className="w-12 text-right">{criterion.weight}%</span>
                  </div>
                  <Slider
                    id={`slider-${criterion.id}`}
                    disabled={!criterion.enabled}
                    min={5}
                    max={50}
                    step={5}
                    value={[criterion.weight]}
                    onValueChange={(value) => handleWeightChange(criterion.id, value)}
                  />
                </div>
                {!DEFAULT_CRITERIA.some(c => c.id === criterion.id) && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteCriterion(criterion.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="text-lg font-medium mb-2">{t("addNewCriterion")}</h3>
            <div className="flex items-center gap-2">
              <Input
                placeholder={t("newCriterionPlaceholder")}
                value={newCriterionName}
                onChange={(e) => setNewCriterionName(e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="secondary" 
                onClick={handleAddCriterion}
                disabled={!newCriterionName.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("add")}
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handleReset}
            type="button"
          >
            {t("resetToDefault")}
          </Button>
          <div>
            <Button variant="ghost" onClick={() => setIsOpen(false)} className="mr-2">
              {t("cancel")}
            </Button>
            <Button onClick={handleSave}>
              {t("save")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
