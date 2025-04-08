import { Suspense } from "react";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Brain,
  Clock,
  Zap,
  HelpCircle,
  Users,
  Target,
  Star,
  ChevronRight,
  BarChart2,
  LineChart,
  Sparkles,
  MessageSquare,
  Award,
  Shield,
  ChevronDown
} from "lucide-react";

import MermaidDiagram from "@/components/MermaidDiagram";
const INTL_NAMESPACE = "AllModel";

export const generateMetadata = async ({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> => {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: INTL_NAMESPACE });
  return {
    title: t("title"),
    description: t("description"),
  };
};

export default async function AllModel({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: INTL_NAMESPACE });

  return (
    <Suspense
      fallback={<div className="text-center py-10 text-xl">{t("loading")}</div>}
    >
      {/* 主容器 */}
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* 英雄区域 */}
        <section className="relative overflow-hidden py-20 sm:py-32">
          {/* 背景装饰 */}
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
          <div className="absolute w-96 h-96 blur-3xl opacity-30 bg-gradient-to-r from-blue-400 to-purple-500 -top-10 -left-10 rounded-full"></div>
          <div className="absolute w-96 h-96 blur-3xl opacity-20 bg-gradient-to-r from-pink-400 to-orange-500 -bottom-10 -right-10 rounded-full"></div>
          
          <div className="relative container mx-auto px-4 flex flex-col items-center text-center z-10">
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 mb-6 border border-blue-100">
              <Star className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">AI 模型评估新方式</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 tracking-tight mb-6 max-w-3xl leading-tight">
              {t("infoCard")}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600"> 智能评测</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
              {t("description")}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <Link href={`${locale}/model-judge`}>
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all">
                  {t("startNow")} 
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="group">
                <span>了解更多</span>
                <ChevronDown className="ml-2 h-4 w-4 transition-transform group-hover:translate-y-1" />
              </Button>
            </div>
          </div>
        </section>
        
        {/* 特性部分 */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-4">核心特性</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("whyUseModelJudge")}</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">使用ModelJudge获得前所未有的AI模型评估体验</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<BarChart2 className="h-12 w-12 text-blue-500" />}
                title={t("reduceTrialCost")}
                description={t("reduceTrialCostDesc")}
                color="blue"
              />
              <FeatureCard
                icon={<LineChart className="h-12 w-12 text-green-500" />}
                title={t("saveTime")}
                description={t("saveTimeDesc")}
                color="green"
              />
              <FeatureCard
                icon={<Sparkles className="h-12 w-12 text-purple-500" />}
                title={t("improveEfficiency")}
                description={t("improveEfficiencyDesc")}
                color="purple"
              />
            </div>
          </div>
        </section>
        
        {/* 介绍部分 */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-16 items-center">
                <div className="md:w-1/2">
                  <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium mb-4">了解ModelJudge</div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">{t("whatIsModelJudge")}</h2>
                  <p className="text-gray-700 mb-6 text-lg">
                    {t("whatIsModelJudgeDesc")}
                  </p>
                  <Link href={`${locale}/model-judge`}>
                    <Button className="group">
                      立即体验
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
                <div className="md:w-1/2 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <MermaidDiagram />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* 使用步骤 */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-block px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium mb-4">简单易用</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("howToUseModelJudge")}</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">只需几个简单步骤，即可开始您的AI模型评估之旅</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <StepCard 
                number="01" 
                title={t("howToUseModelJudgeDesc1")} 
                description="选择您想要比较的AI模型，最多可以同时比较6个不同的模型。" 
              />
              <StepCard 
                number="02" 
                title={t("howToUseModelJudgeDesc2")} 
                description="输入您的问题或任务，让所有选中的模型生成答案。" 
              />
              <StepCard 
                number="03" 
                title={t("howToUseModelJudgeDesc3")} 
                description="设置您的评估标准，针对不同维度对模型表现进行评价。" 
              />
              <StepCard 
                number="04" 
                title={t("howToUseModelJudgeDesc4")} 
                description="查看评估结果，比较各个模型的优缺点和整体表现。" 
              />
              <StepCard 
                number="05" 
                title={t("howToUseModelJudgeDesc5")} 
                description="保存评估历史，随时查看和比较不同模型在各种任务中的表现。" 
              />
              <StepCard 
                number="06" 
                title={t("howToUseModelJudgeDesc6")} 
                description="进行多轮对话评估，测试模型在持续交互中的表现。" 
              />
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100 max-w-4xl mx-auto">
              <div className="flex items-start">
                <div className="mr-4 mt-1 p-2 bg-blue-100 rounded-lg">
                  <HelpCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("tip")}</h3>
                  <p className="text-gray-700">{t("tipDesc")}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* 评估标准 */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-block px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium mb-4">评估标准</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("modelJudgeStandard")}</h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t("modelJudgeStandardDesc")}</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                <StandardCard
                  icon={<Award className="h-8 w-8 text-amber-500" />}
                  title={t("modelJudgeStandardDesc1")}
                  description="评估生成内容的准确性和正确性，确保信息无误。"
                />
                <StandardCard
                  icon={<Zap className="h-8 w-8 text-orange-500" />}
                  title={t("modelJudgeStandardDesc2")}
                  description="衡量回答与问题的相关程度，确保回答针对问题提供直接价值。"
                />
                <StandardCard
                  icon={<Brain className="h-8 w-8 text-blue-500" />}
                  title={t("modelJudgeStandardDesc3")}
                  description="评估逻辑推理和思维清晰度，确保论述连贯且有说服力。"
                />
                <StandardCard
                  icon={<Sparkles className="h-8 w-8 text-purple-500" />}
                  title={t("modelJudgeStandardDesc4")}
                  description="衡量生成内容的创新性和独特视角，评估解决问题的创造力。"
                />
                <StandardCard
                  icon={<Shield className="h-8 w-8 text-green-500" />}
                  title={t("modelJudgeStandardDesc5")}
                  description="评估回答的全面性和深度，确保覆盖问题的各个方面。"
                />
                <StandardCard
                  icon={<MessageSquare className="h-8 w-8 text-red-500" />}
                  title={t("modelJudgeStandardDesc6")}
                  description="衡量解决方案的实用性和可执行性，评估在现实世界中的应用价值。"
                />
              </div>
              
              <p className="text-center text-gray-700 italic">{t("modelJudgeStandardDesc7")}</p>
            </div>
          </div>
        </section>
        
        {/* 行动号召 */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">准备好开始您的AI模型评估之旅了吗？</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">立即体验ModelJudge，发现最适合您需求的AI模型</p>
            <Link href={`${locale}/model-judge`}>
              <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100">
                {t("startNow")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </Suspense>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode; title: string; description: string; color: 'blue' | 'green' | 'purple' }) {
  const bgColor = {
    blue: "bg-blue-50",
    green: "bg-green-50",
    purple: "bg-purple-50"
  }[color];
  
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-8 flex flex-col h-full border border-gray-100">
      <div className={`${bgColor} p-3 rounded-xl mb-6 w-fit`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 flex-grow">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border border-gray-100 flex flex-col h-full">
      <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
        {number}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

function StandardCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border border-gray-100 flex items-start">
      <div className="mr-4 mt-1">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  );
}
