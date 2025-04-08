import { Suspense } from "react";
import ClientComponent from "@/components/ClientComponent";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { Metadata } from "next";
import InputApiKey from "./InputApiKey";
import { cookies } from "next/headers";
import { ShieldCheck, Zap, Brain } from "lucide-react";
const INTL_NAMESPACE = "AllModel";

const fetchAllModel = async () => {
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_KEY}`,
    },
  };

  const baseUrl = process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1";
  const data = await fetch(
    `${baseUrl}/models?type=text&sub_type=chat`,
    options
  )
    .then((response) => response.json())
    .catch((error) => {
      console.log(error);
    });
  // console.log("所有模型", data);

  return data;
};

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
  const data = await fetchAllModel();

  console.log("api data--", data);
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* 页面顶部装饰 */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 overflow-hidden">
        <div className="absolute w-full h-full bg-[url('/grid-pattern.svg')] bg-center opacity-30"></div>
        <div className="absolute -bottom-8 w-full h-16 bg-gradient-to-b from-transparent to-slate-50"></div>
      </div>
      
      {/* 内容容器 */}
      <div className="relative container mx-auto px-4 pt-16 pb-10 z-10 flex flex-col max-w-7xl">
        <header className="mb-8 text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-700 mr-3">
              <Brain className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{t("infoCard")}</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4">{t("description")}</p>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 max-w-3xl mx-auto text-center">
            <div className="flex items-start text-left">
              <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0 mr-2" />
              <p className="text-sm text-gray-600">
                由于访问量激增，如遇到评分服务无法访问，请稍后再试。我们强烈推荐您输入自己的密钥以获得稳定体验（您的密钥不会被记录）。
                要获取API密钥，我们推荐使用 **云雾 AI 中转** 平台，它聚合了**超过270种**主流及特定领域模型，提供稳定高效的API服务。
                点击免费注册：
                <a
                  href="https://yunwu.ai/register?aff=PBpy"
                  className="text-blue-600 hover:underline font-medium inline-flex items-center"
                >
                  云雾 AI 中转 (270+ Models)
                  <Zap className="w-3 h-3 ml-1" />
                </a>
              </p>
            </div>
            <div className="mt-2">
              <InputApiKey cookies={cookies()} />
            </div>
          </div>
        </header>
        
        <Suspense fallback={<div className="flex justify-center items-center h-40"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div></div>}>
          <ClientComponent models={data.data} />
        </Suspense>
      </div>
    </div>
  );
}
