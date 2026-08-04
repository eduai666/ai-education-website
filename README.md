# AI 基础教育公益学习平台

这是一个面向学生、家长和教育工作者的中文人工智能公益学习网站。项目希望用清晰、可靠、可实践的方式解释人工智能基础知识，并帮助学习者建立事实核验、隐私保护、版权意识和负责任使用 AI 的习惯。

网站采用文档式三栏阅读布局：左侧是整个学习项目的导航，中间展示课程正文，右侧提供“本页导航”。在桌面端可以快速定位课程与知识点，在平板和手机上会自动切换为适合小屏幕的导航方式。

## 当前内容

### AI 基础课程

- 第一单元：认识人工智能
- 第二单元：机器学习与深度学习
- 第三单元：大模型是如何工作的
- 第四单元：什么是智能体
- 第五单元：如何将大模型接入到智能体

课程支持 Markdown、表格、提示块、代码、图片、数学公式、章节目录和前后课导航。机器学习与大模型单元还包含术语表、动手实验和章节挑战。

### 学习与实践资源

- 网站介绍、学习路线与项目愿景
- 学生 AI 学习与创作指南
- 家长与教师使用指南
- 教师学科应用案例
- 细胞结构探索器互动实践项目
- 个人学习中心与站内搜索

## 技术栈

- Next.js 16（App Router）
- React 19
- TypeScript 5
- MDX / Markdown
- KaTeX 数学公式
- Three.js 三维互动内容
- Playwright 端到端测试
- ESLint 代码规范检查

项目要求的运行版本记录在 `package.json` 和 `.nvmrc` 中：

- Node.js 24.13.0
- npm 11.6.2

## 本地运行

克隆仓库：

```bash
git clone git@github.com:eduai666/ai-education-website.git
cd ai-education-website
```

严格按照 `package-lock.json` 安装依赖：

```bash
npm ci
```

启动开发服务器：

```bash
npm run dev
```

浏览器访问：

- 网站首页：<http://127.0.0.1:3000>
- 机器学习与深度学习：<http://127.0.0.1:3000/courses/machine-learning/introduction>
- 大模型是如何工作的：<http://127.0.0.1:3000/courses/large-models/introduction>
- 细胞结构探索器：<http://127.0.0.1:3000/projects/learn/cell-architecture>

开发模式支持热更新。结束运行时，在启动服务的终端中按 `Ctrl+C`。

### 生产模式预览

```bash
npm run build
npm run start
```

`npm run start` 需要先成功执行 `npm run build`。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动本地开发服务器 |
| `npm run build` | 生成生产构建 |
| `npm run start` | 运行生产构建 |
| `npm run typecheck` | 检查 TypeScript 类型 |
| `npm run lint` | 执行 ESLint 检查 |
| `npm run test:data` | 验证细胞项目数据与可复现资源 |
| `npm run test:e2e` | 执行 Playwright 端到端测试 |
| `npm run verify` | 依次执行数据测试、类型检查、代码检查和构建 |
| `npm run verify:full` | 在 `verify` 基础上追加端到端测试 |

细胞项目包含原始字节哈希校验。若 Windows 自动把 LF 换行转换成 CRLF，哈希测试可能失败；参与该部分开发时建议让 Git 保留仓库中的 LF 换行，并在更新基线前认真检查实际差异。

## Markdown 内容工作流

课程与指南的内容源文件集中在：

```text
docs/markdown/
├─ 网站介绍/
├─ 用户指南/
├─ 01-认识人工智能/
├─ 机器学习与深度学习/
├─ 大模型是如何工作的/
├─ 04-什么是智能体/
└─ 生物学习/
```

内容作者通常只需要在 `docs/markdown` 下编写或修改 `.md` 文件。详细写作格式请阅读 [`docs/markdown/README.md`](docs/markdown/README.md)。

推荐的单课结构：

1. 本课目标；
2. 生活场景或问题；
3. 核心概念与案例；
4. 图片、表格或公式；
5. 动手练习与检查理解；
6. 本课小结；
7. 参考资料。

数学公式使用 LaTeX 语法。为了避免下标含义不清，推荐显式使用花括号：

```markdown
行内公式：$w_{1}$、$x_{i}$、$d_{k}$

独立公式：

$$
z = w_{1}x_{1} + w_{2}x_{2} + b
$$
```

课程图片统一放在 `public/course-assets` 下，并在 Markdown 中使用以 `/course-assets/` 开头的网站路径。各内容目录中的 `assets` 文件夹可以保存原始素材和内容归档。

> 新建 Markdown 文件后，网站不会自动出现新课程。前端维护者还需要在 `src/server/content` 中注册课程元数据，并在 `src/config/routes.ts` 中添加导航入口。只修改已有 Markdown 文件时，通常不需要调整页面组件。

## 项目结构

```text
ai-education-website/
├─ docs/markdown/              # 中文内容源文件与内容素材
├─ public/                     # 网站可直接访问的图片、品牌与模型资源
│  └─ course-assets/           # 课程插图
├─ src/app/                    # Next.js 页面、布局和全局样式
├─ src/components/             # 内容组件与三栏导航组件
├─ src/config/routes.ts        # 网站导航结构
├─ src/server/content/         # Markdown 注册、课程元数据与搜索索引
├─ src/features/               # 搜索、学习中心和互动项目
├─ scripts/                    # 可复现资源与预览生成脚本
├─ tests/                      # 数据测试与端到端测试
├─ mdx-components.tsx          # Markdown/MDX 元素渲染规则
└─ next.config.ts              # Next.js 与 Markdown 插件配置
```

## 分支与协作

- `main`：供所有协作者读取和集成的最新稳定版本。
- 个人开发分支：用于独立开发与内容整理，例如 `wqj_dev`。
- 功能完成后先同步 `main`、解决冲突并完成检查，再合并或推送到 `main`。

推荐流程：

```bash
git checkout main
git pull origin main
git checkout -b your_name_dev

# 修改、检查并提交
git add <files>
git commit -m "描述本次修改"
git push -u origin your_name_dev
```

请不要提交 `.next`、`node_modules`、本地密钥、API Key 或其他个人环境文件。提交课程事实、产品操作步骤或政策信息时，应尽量附上可靠来源与核验日期。

## 项目原则

- 所有面向学习者的主要内容优先使用中文。
- 先帮助读者理解，再引入专业术语。
- 区分长期有效的概念与会随产品版本变化的操作步骤。
- 不把 AI 输出当作天然正确的答案。
- 把隐私、事实核验、版权、公平和人的责任贯穿每个学习单元。
