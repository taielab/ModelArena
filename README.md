# 模型竞技场 (Model Arena) 🏆

欢迎来到模型竞技场项目! 这是一个基于 [ModelJudge](https://github.com/flashclub/ModelJudge/tree/main) 二次开发的增强版 AI 模型评估平台，使用 Next.js 15 和 App Router 构建。
输入一个问题，选择多个模型，平台将实时生成各模型的回答，并由评判模型给出专业评分和详细分析!


## 项目特色

1. **多模型实时对比**: 同时对比多个 AI 模型的回答，直观展示各模型的优劣 🤖🆚🤖
2. **专业多维度评分系统**: 基于11个维度进行专业评分，包括相关性、准确性、流畅性、创新性等 📊
3. **流式响应技术**: 实时展示各模型回答过程，感受思考过程差异 ⚡
4. **国际化支持**: 完整支持中文和英文界面，轻松切换 🌍
5. **高度可定制的评估标准**: 自定义评估维度和权重，满足不同场景需求 🎛️
6. **详细的评估报告**: 全面解析各模型表现，提供深入洞察 📝
7. **评估历史追踪系统**: 保存历史评估结果，方便后续查看和比较 📜
8. **全面的响应式设计**: 在各种设备上都能完美展示，从手机到桌面设备 📱💻
9. **结果导出功能**: 支持将评估结果导出为CSV或复制为Markdown表格 📋

## 目录

- [快速开始](#快速开始)
- [使用指南](#使用指南)
  - [基本使用流程](#基本使用流程)
  - [云雾API集成](#云雾api集成)
  - [自定义评估标准](#自定义评估标准)
  - [查看和导出结果](#查看和导出结果)
  - [API密钥配置](#api密钥配置)
- [开发指南](#开发指南)
  - [环境准备](#环境准备)
  - [项目结构](#项目结构)
  - [关键组件](#关键组件)
  - [国际化开发](#国际化开发)
  - [添加新模型](#添加新模型)
  - [自定义UI组件](#自定义ui组件)
- [技术栈](#技术栈)
- [贡献指南](#贡献指南)
- [常见问题](#常见问题)
- [许可证](#许可证)

## 快速开始

1. 克隆项目：

   ```bash
   git clone https://github.com/taielab/ModelArena.git
   cd ModelArena
   ```

2. 安装依赖：

   ```bash
   # 推荐使用 pnpm
   pnpm install
   # 或使用 npm
   npm install
   # 或使用 yarn
   yarn
   ```

3. 创建 `.env.local` 文件，配置必要的环境变量：

   ```bash
   # 复制示例环境变量文件
   cp .env.example .env.local
   
   # 然后编辑 .env.local 文件，添加以下配置
   # API密钥 (建议使用云雾API：https://yunwu.ai/register?aff=PBpy 访问免费注册)
   # 云雾 API Key
   DEEPSEEK_KEY=
   
   # 云雾 API URL (完整的基础URL，不包含endpoint路径)
   DEEPSEEK_API_URL=https://yunwu.ai/v1
   
   # 服务配置
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret  # 可选，用于用户认证
   ```

4. 运行开发服务器：

   ```bash
   pnpm dev
   # 或使用 npm
   npm run dev
   # 或使用 yarn
   yarn dev
   ```

5. 打开浏览器访问 [http://localhost:3000](http://localhost:3000) 即可使用模型竞技场！

## 使用指南

### 基本使用流程

1. **输入问题**: 在主界面输入您想要测试的问题或任务描述。问题越具体，评估结果越准确。

2. **选择模型**: 从模型列表中选择2-4个您想要比较的AI模型。平台支持多种主流大语言模型。

3. **开始评估**: 点击"开始"按钮后，平台将同时向所选模型发送您的问题，并实时展示各模型的回答过程。

4. **查看评估结果**: 所有模型完成回答后，平台会自动调用评判模型进行综合评估，并展示详细的评分和分析结果。

5. **分析对比**: 您可以查看各模型在不同维度的得分对比，以及评判模型提供的详细分析和改进建议。

### 云雾API集成

模型竞技场推荐使用**云雾AI中转**平台作为API服务提供商，它提供了超过270种主流AI模型的统一接入：

1. **注册账号**: 访问[云雾AI官网](https://yunwu.ai/register?aff=PBpy)进行免费注册

2. **获取API密钥**: 登录后在个人中心或API管理页面获取您的API密钥

3. **配置密钥**: 在模型竞技场的API设置区域，粘贴您的云雾API密钥

4. **使用优势**:
   - 270+种主流AI模型统一接口
   - 稳定可靠的服务架构
   - 费用透明，按量付费
   - 专业的技术支持

### 自定义评估标准

模型竞技场提供了强大的评估标准自定义功能，支持以下四大类共11个评估维度：

自定义方法：

1. 点击界面上的"自定义评估标准"按钮
2. 调整各评估维度的权重，或启用/禁用特定维度
3. 您还可以添加自定义评估维度
4. 完成后点击"保存"，新的评估标准将应用于后续的评估

### 查看和导出结果

评估完成后，您可以：

- 查看详细的评分表格和分析报告
- 导出评估结果为CSV格式
- 复制评估结果为Markdown表格
- 保存评估结果到历史记录中
- 通过分享链接与他人分享评估结果

### API密钥配置

模型竞技场支持多种方式配置API密钥：

1. **环境变量方式**: 在服务器端配置环境变量（推荐用于生产环境）
2. **浏览器存储方式**: 在用户界面输入API密钥，将存储在浏览器中（便于个人使用）
3. **用户账户关联**: 登录后绑定API密钥到用户账户（需启用用户认证功能）

## 开发指南

### 环境准备

开发模型竞技场项目需要以下环境：

- Node.js 18.x 或更高版本
- npm、yarn 或 pnpm 包管理器（推荐使用pnpm）
- 支持现代 JavaScript 的代码编辑器（如 VS Code）
- Git 版本控制工具

### 项目结构

```plaintext
src/
│
├── app/                     # Next.js 15 应用目录
│   ├── [locale]/            # 国际化路由
│   │   ├── model-judge/     # 主功能页面
│   │   └── page.tsx         # 首页
│   ├── api/                 # API 路由
│   └── layout.tsx           # 根布局
│
├── components/              # React 组件
│   ├── ui/                  # UI 基础组件
│   ├── ClientComponent.tsx  # 核心评估组件
│   ├── AdvancedEvaluationTable.tsx  # 评估结果表格
│   └── ...                  # 其他组件
│
├── config/                  # 配置文件
│   └── index.ts             # 全局配置
│
├── context/                 # React Context
│   └── ...                  # 上下文管理
│
├── hooks/                   # 自定义 React Hooks
│   └── use-toast.ts         # Toast 通知钩子
│
├── lib/                     # 工具函数库
│   ├── AIStream.ts          # AI流式处理
│   └── utils.ts             # 通用工具函数
│
└── messages/                # 国际化文本
    ├── en.json              # 英文翻译
    └── zh.json              # 中文翻译
```

### 关键组件

开发过程中需要了解的几个核心组件：

- **ClientComponent.tsx**: 该组件是模型竞技场的核心，负责模型选择、问题提交、响应处理和结果展示。

- **AIProviders.tsx**: 提供与各AI服务提供商的连接适配器，处理API认证和请求转发。

- **AdvancedEvaluationTable.tsx**: 复杂的评估结果表格组件，展示各维度评分和分析报告。

- **ResponsiveTabs.tsx**: 响应式标签组件，在不同设备尺寸下提供最佳的导航体验。

- **SettingsDialog.tsx**: 应用设置弹窗，包括API密钥配置、语言切换等功能。

### 国际化开发

模型竞技场使用next-intl进行国际化支持：

1. 所有UI文本应存放在`messages/`目录下的语言文件中
2. 添加新文本时，务必同时更新所有语言文件
3. 使用`useTranslations`钩子获取翻译文本
4. 动态内容使用带参数的翻译

示例：

```tsx
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('model-judge');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description', { modelCount: 4 })}</p>
    </div>
  );
}
```

### 添加新模型

要添加新的AI模型支持，需要修改以下文件：

1. `src/config/index.ts`: 更新模型配置列表
2. `src/app/api/generate/route.ts`: 添加新模型的API处理逻辑
3. `src/lib/AIStream.ts`: 如需特殊的流处理逻辑，更新此文件

模型定义示例：

```typescript
export const MODELS = [
  {
    value: "gpt-4-turbo",
    label: "GPT-4 Turbo",
    provider: "openai",
    imageUrl: "/models/gpt-4.webp",
  },
  // 添加新模型
  {
    value: "your-new-model",
    label: "Your New Model",
    provider: "your-provider",
    imageUrl: "/models/your-model.webp",
  },
]
```

### 自定义UI组件

模型竞技场使用shadcn/ui作为基础UI组件库：

1. 所有自定义组件应放在`components/ui/`目录下
2. 使用Tailwind CSS进行样式定制
3. 遵循组件化开发原则，保持组件的独立性和可复用性
4. 确保所有组件支持响应式设计和深色模式

## 技术栈

- **前端框架**: Next.js 15 (App Router)
- **UI组件库**: shadcn/ui、Tailwind CSS、Radix UI
- **状态管理**: React Hooks 和 Context API
- **国际化**: next-intl
- **API通信**: fetch API、Server Actions
- **流式响应**: Web Streams API
- **数据验证**: Zod (可选)
- **用户认证**: NextAuth.js (可选)

## 贡献指南

我们欢迎社区贡献，帮助模型竞技场变得更好！

1. Fork该项目并克隆到本地
2. 创建新的功能分支: `git checkout -b feature/your-feature-name`
3. 提交您的更改: `git commit -am 'Add some feature'`
4. 推送到分支: `git push origin feature/your-feature-name`
5. 提交Pull Request

请确保您的代码符合项目的编码规范，并通过所有的测试。

## 常见问题

**Q: 如何更改评判模型？**
A: 在设置中选择"评估设置"，您可以从支持的评判模型列表中选择不同的模型。

**Q: 如何处理API密钥安全问题？**
A: 客户端输入的API密钥仅存储在浏览器本地，不会传输到服务器。对于生产环境，建议使用环境变量方式配置API密钥。

**Q: 支持哪些大语言模型？**
A: 通过云雾API，模型竞技场支持270+种主流AI模型，包括OpenAI、Anthropic、Google、Mistral、智谱、百度等公司的各类模型。

**Q: 如何贡献新的评估维度？**
A: 在`src/config/evaluation-dimensions.ts`文件中添加新的评估维度定义，然后提交PR。

## 致谢

模型竞技场（Model Arena）基于[ModelJudge](https://github.com/flashclub/ModelJudge/tree/main)项目二次开发，我们对原项目团队表示诚挚的感谢！

## 许可证

本项目采用 [MIT 许可证](LICENSE)。
