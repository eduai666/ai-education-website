import workbuddyDownloadFigure from "./assets/03-01-workbuddy-download.png";
import workbuddyModelSettingsFigure from "./assets/03-02-workbuddy-model-settings.png";
import workbuddyProviderListFigure from "./assets/03-03-workbuddy-provider-list.png";
import workbuddyCustomModelFormFigure from "./assets/03-04-workbuddy-custom-model-form.png";
import workbuddyModelSelectorFigure from "./assets/03-05-workbuddy-model-selector.png";
import deepseekCreateApiKeyFigure from "./assets/03-06-deepseek-create-api-key.png";

# Windows 桌面版 WorkBuddy 接入 DeepSeek 官方 API

WorkBuddy 是腾讯推出的桌面智能体。它不只回答问题，还能在得到授权后读取本地文件、调用工具并完成多步任务。本课使用 WorkBuddy 当前的图形化模型设置，把推理请求接入 DeepSeek 官方 API。

> [!NOTE]
> 本文依据 WorkBuddy、腾讯云与 DeepSeek 官方文档编写，界面和兼容信息核对到 **2026 年 8 月 4 日**。软件更新后，按钮名称和模型列表可能变化；遇到差异时，以文末官方文档为准。

> [!WARNING]
> DeepSeek API 会按实际用量计费，API Key 也能产生费用。未成年人应在家长、教师或社团指导员陪同下操作，不要独立充值，也不要把 Key 发给别人或放进截图、作业和公开仓库。

## 开始前先分清三件事

接入完成后，WorkBuddy、DeepSeek API 和你的电脑仍然承担不同工作：

```text
你提出任务
    ↓
WorkBuddy 组织上下文、工具和权限
    ↓
DeepSeek API 负责模型推理
    ↓
WorkBuddy 展示回答，并在获得许可后调用本地工具
```

- **WorkBuddy 是智能体客户端**：管理任务、文件夹、工具与权限。
- **DeepSeek API 是模型服务**：接收请求、完成推理，并按 Token 用量计费。
- **权限控制仍在本地客户端**：API 连接成功不代表模型可以随意读取、修改或发送文件。

API Key 只是访问模型服务的凭证，不会把模型下载到电脑，也不会自动给智能体更高权限。WorkBuddy 官方说明，自定义模型的配置和 Key 保存在本地；任务内容会被转发给你选择的第三方模型服务处理。

## 准备工作

开始前准备以下内容：

1. 一台 Windows 10 或 Windows 11 电脑；
2. 当前版本的 WorkBuddy 桌面客户端；
3. 已登录的 WorkBuddy 账号；
4. 已登录且有可用余额的 DeepSeek 开放平台账号；
5. 一个只放测试文件的练习文件夹。

先看本课会用到的配置：

| 配置项 | 推荐内容 | 说明 |
| --- | --- | --- |
| 提供商 | `深度求索 / DeepSeek` | 新版优先使用官方预设 |
| 接口地址 | `https://api.deepseek.com/v1/chat/completions` | 仅在自定义 API 方式中手动填写 |
| API Key | DeepSeek 开放平台创建的 Key | 不要在教程、聊天或仓库中公开 |
| 模型名称 | `deepseek-v4-pro` | 质量优先 |
| 备选模型 | `deepseek-v4-flash` | 速度和成本优先 |
| 工具调用 | 开启 | 智能体任务通常需要 |
| 图片输入 | 关闭 | DeepSeek 的 WorkBuddy 接入配置目前标记为不支持图片 |
| 自定义协议 | 关闭 | DeepSeek 官方地址使用标准 OpenAI 兼容路径 |

> [!TIP]
> 新版 WorkBuddy 已有 DeepSeek 提供商预设，通常只需选择提供商、填写 Key 和选择模型。只有预设不存在或无法使用时，才需要手动填写完整接口地址。

## 步骤 1：下载并登录 WorkBuddy

打开 [WorkBuddy 官方网站](https://www.codebuddy.cn/work/)，选择 Windows 版本下载安装包。官方安装指南要求 Windows 10 及以上系统；不支持 Windows 7、8 或 8.1。

<CourseFigure
  src={workbuddyDownloadFigure}
  alt="WorkBuddy 官方下载页面中已选中 WorkBuddy，并展开 Windows x64 下载选项"
  caption="从官方页面选择 WorkBuddy 和 Windows 版本，不要从不明软件下载站获取安装包。"
/>

下载完成后：

1. 双击安装包；
2. 阅读并确认安装协议；
3. 选择安装目录；
4. 等待安装完成并启动 WorkBuddy；
5. 按客户端提示完成登录。

登录后，先在头像菜单中选择“检查更新”。如果后面的设置页没有“模型”或“添加模型”，通常是客户端版本较旧。

## 步骤 2：获取 DeepSeek API Key

这里获得的是 **DeepSeek 开放平台 API Key**，不是 DeepSeek 网页或 App 的会员资格。

1. 打开 [DeepSeek 开放平台](https://platform.deepseek.com/)并登录；
2. 查看当前余额、模型价格和用量设置；
3. 进入 [API Key 管理页面](https://platform.deepseek.com/api_keys)；
4. 点击“创建 API key”；
5. 使用不包含姓名、学校等隐私的名称，例如 `WorkBuddy-Learning`；
6. 创建后立即复制 Key，并回到 WorkBuddy 中使用。

<CourseFigure
  src={deepseekCreateApiKeyFigure}
  alt="DeepSeek 开放平台创建 API Key 的窗口，名称输入框使用不含个人信息的示例名称"
  caption="Key 通常只在创建后完整显示一次；复制后不要截图，也不要发到聊天群。"
/>

> [!WARNING]
> API Key 相当于一张能产生费用的密码。如果完整 Key 曾出现在截图、聊天记录、代码或 Git 提交中，应立即在开放平台删除旧 Key，再创建新 Key。

## 步骤 3：打开模型设置

启动 WorkBuddy，点击左下角头像，然后进入：

```text
设置 → 模型 → 添加模型
```

<CourseFigure
  src={workbuddyModelSettingsFigure}
  alt="WorkBuddy 设置页左侧选中模型，页面右侧显示添加模型按钮"
  caption="进入“模型”页面后，点击右侧的“添加模型”。"
/>

WorkBuddy 官方文档说明，新版客户端可以在这个图形界面中添加、编辑和删除自定义模型，不再要求普通用户手动修改配置文件。

如果页面中完全没有“模型”入口：

- 先检查更新并完全退出 WorkBuddy；
- 重新启动后再次查看；
- 仍然没有时，使用本文后面的“旧版配置文件兼容方法”。

## 步骤 4：选择 DeepSeek 预设

点击“添加模型”后，打开“提供商”列表，选择：

```text
深度求索 / DeepSeek
```

<CourseFigure
  src={workbuddyProviderListFigure}
  alt="WorkBuddy 添加模型的提供商列表，其中包含深度求索 DeepSeek 和自定义 Custom"
  caption="新版提供商列表已经包含 DeepSeek；优先使用这个预设。"
/>

选择预设后，WorkBuddy 会根据提供商设置自动补全接口地址、模型列表和部分能力标记。接下来：

1. 把刚刚创建的 DeepSeek API Key 粘贴到 `API KEY`；
2. 在模型列表中选择 `deepseek-v4-pro` 或 `deepseek-v4-flash`；
3. 检查 Key 输入框仍以圆点隐藏；
4. 点击“保存”。

两个模型可以这样选择：

| 模型 | 更适合的任务 |
| --- | --- |
| `deepseek-v4-flash` | 快速问答、短任务、第一次连通性测试 |
| `deepseek-v4-pro` | 复杂分析、长任务、对质量要求较高的任务 |

DeepSeek 官方价格和能力可能调整，不要在充值前只依赖旧教程。请直接查看 [DeepSeek 模型与价格](https://api-docs.deepseek.com/zh-cn/quick_start/pricing/)页面。

## 预设不可用时使用自定义 API

如果你的版本没有 DeepSeek 预设，或预设暂时不能正确加载模型，可以在提供商列表中选择：

```text
自定义 / Custom
```

<CourseFigure
  src={workbuddyCustomModelFormFigure}
  alt="WorkBuddy 自定义模型表单，包含接口地址、API Key、模型名称和工具调用等高级设置"
  caption="自定义方式需要手动填写完整接口地址、模型名和能力选项。"
/>

按下面的表格填写：

| 字段 | 填写内容 |
| --- | --- |
| 提供商 | `自定义 / Custom` |
| 接口地址 | `https://api.deepseek.com/v1/chat/completions` |
| API KEY | 你的 DeepSeek API Key |
| 模型名称 | `deepseek-v4-pro` 或 `deepseek-v4-flash` |
| 工具调用 | 开启 |
| 图片输入 | 关闭 |
| 推理模式 | 可开启；若客户端出现兼容问题，先关闭后测试 |
| 自定义协议 | 关闭 |
| 输入长度 | 使用提供商默认值，或保守选择 `128K` |
| 输出长度 | 使用提供商默认值，或保守选择 `8K` |

### 为什么接口地址要写完整

DeepSeek 给 WorkBuddy/CodeBuddy 的官方接入示例使用 OpenAI 兼容的 Chat Completions 接口：

```text
https://api.deepseek.com/v1/chat/completions
```

这里填写的是完整消息接口，不是 Claude Desktop 教程中的 Anthropic 基地址，也不是 Codex 的 Responses API 地址。三个客户端的协议和配置字段不同，不能互相照抄。

### 为什么关闭图片输入

DeepSeek 官方 WorkBuddy 配置把 `supportsImages` 标记为 `false`。即使客户端界面提供“图片输入”复选框，也不应仅因为有这个按钮就开启。文本、工具调用和图片是三种不同能力，需要分别验证。

### 什么时候才开启自定义协议

DeepSeek 官方地址使用标准 `/chat/completions` 路径，因此保持关闭。只有第三方网关明确要求使用一个非标准完整路径，并且 WorkBuddy 自动补全路径导致请求错误时，才考虑开启“自定义协议”。

## 旧版配置文件兼容方法

DeepSeek 官方仍提供本地配置文件方案，适合没有图形化“添加模型”入口的旧版 WorkBuddy/CodeBuddy。

先至少打开一次 WorkBuddy 和一个项目目录，然后在 PowerShell 中设置用户环境变量：

```powershell
setx DEEPSEEK_API_KEY "<你的 DeepSeek API Key>"
```

> [!NOTE]
> `setx` 只影响之后新启动的程序。执行后必须完全退出 WorkBuddy，再从新的桌面进程重新启动。不要把真实 Key 写进教程、截图或 Git 仓库。

创建或编辑用户级配置文件：

```text
C:\Users\<你的用户名>\.codebuddy\models.json
```

写入以下配置：

```json
{
  "models": [
    {
      "id": "deepseek-v4-pro",
      "name": "DeepSeek V4 Pro",
      "vendor": "DeepSeek",
      "url": "https://api.deepseek.com/v1/chat/completions",
      "apiKey": "${DEEPSEEK_API_KEY}",
      "maxInputTokens": 128000,
      "maxOutputTokens": 8192,
      "supportsToolCall": true,
      "supportsImages": false,
      "relatedModels": {
        "lite": "deepseek-v4-flash",
        "reasoning": "deepseek-v4-pro"
      }
    },
    {
      "id": "deepseek-v4-flash",
      "name": "DeepSeek V4 Flash",
      "vendor": "DeepSeek",
      "url": "https://api.deepseek.com/v1/chat/completions",
      "apiKey": "${DEEPSEEK_API_KEY}",
      "maxInputTokens": 128000,
      "maxOutputTokens": 8192,
      "supportsToolCall": true,
      "supportsImages": false
    }
  ],
  "availableModels": [
    "deepseek-v4-pro",
    "deepseek-v4-flash"
  ]
}
```

保存时必须注意：

- 文件名是 `models.json`，不要保存成 `models.json.txt`；
- JSON 中不能写注释，也不能漏掉逗号或引号；
- 使用 **UTF-8 无 BOM** 编码；
- 保存后完全退出并重启 WorkBuddy；
- 如果界面直接显示 `${DEEPSEEK_API_KEY}`，说明当前桌面进程没有读取到环境变量。

## 步骤 5：保存并选择模型

配置保存后，回到 WorkBuddy 新建任务页面，在输入框附近打开模型选择器，选择刚刚添加的 DeepSeek 模型。

<CourseFigure
  src={workbuddyModelSelectorFigure}
  alt="WorkBuddy 任务输入框的模型选择器已经显示 deepseek-v4-pro"
  caption="模型名称出现在选择器中，说明本地配置已被 WorkBuddy 读取。"
/>

如果模型没有出现：

1. 回到“设置 → 模型”，确认记录已经保存；
2. 核对模型名是否严格写成 `deepseek-v4-pro` 或 `deepseek-v4-flash`；
3. 完全退出 WorkBuddy，而不是只关闭窗口；
4. 重新启动后再检查模型选择器；
5. 使用配置文件方法时，确认路径、JSON 格式和 UTF-8 无 BOM。

## 步骤 6：做一次低风险验证

不要一上来就让智能体操作重要文件。按风险从低到高验证：

### 第一轮：只测试文字回答

发送一条短消息：

```text
请用一句话解释“API Key 的作用”，不要调用任何工具。
```

能得到回答，说明接口地址、Key 和模型名至少完成了最基本的连通。

### 第二轮：检查实际用量

打开 DeepSeek 开放平台的用量记录，确认刚才的时间点出现了新的 API 调用。不要只问模型“你是谁”，因为模型的自我描述不能证明请求实际经过哪个服务。

### 第三轮：在练习文件夹测试工具

新建一个可以随时删除的文件夹，只放一份测试文本。然后让 WorkBuddy：

```text
先说明你准备做什么，不要立即修改文件。
请列出当前练习文件夹中的文件，并等待我确认下一步。
```

检查计划和权限提示后，再决定是否允许读取或修改。API 连接、工具调用和本地文件权限是三层不同能力，必须逐层验证。

## 常见问题

| 现象 | 优先检查 |
| --- | --- |
| 返回 `401` 或 Authentication Fails | Key 是否完整、是否有多余空格、是否已经被删除 |
| 返回 `402` 或余额不足 | DeepSeek API 余额；它与网页会员、WorkBuddy 套餐不是同一份额度 |
| 返回 `404` 或未找到模型 | 接口是否为 `/v1/chat/completions`，模型名是否完全正确 |
| 返回 `429` | 停止连续重试，稍后再试并查看限速与用量 |
| 模型选择器中没有新模型 | 是否保存、是否完全重启、配置文件路径是否正确 |
| 文字能回答但工具不能用 | 是否开启工具调用，WorkBuddy 是否获得对应本地权限 |
| 图片任务失败 | 当前 DeepSeek WorkBuddy 配置不应声明支持图片输入 |
| `${DEEPSEEK_API_KEY}` 原样显示 | 从设置环境变量后的新进程启动 WorkBuddy，或改用图形界面安全填写 |
| 读取本地模型配置失败 | 检查 JSON 语法和 UTF-8 无 BOM 编码 |

最快的排查顺序是：

```text
提供商 → 接口地址 → API Key → 模型名 → 保存 → 完全重启 → 文字测试 → 工具测试
```

一次只改一项。若同时更换地址、Key、模型和能力开关，即使碰巧成功，也很难知道真正的问题在哪里。

## 安全与费用

接入第三方模型后，要同时管理四类风险：

- **密钥风险**：Key 泄露后，别人可能消耗你的余额；
- **费用风险**：智能体的长任务、重试和多轮工具调用可能产生更多 Token；
- **数据风险**：发送给 WorkBuddy 的任务内容会转发给你配置的模型服务；
- **操作风险**：模型回答正确，不代表它对本地文件的每一次操作都正确。

建议这样做：

1. 只在自己的设备上填写 Key；
2. 设置余额提醒并定期查看用量；
3. 不使用时删除或轮换 Key；
4. 第一次任务只开放练习目录；
5. 删除、覆盖、安装、发布和发送等操作单独确认；
6. 重要项目先提交 Git 或做好备份；
7. 不把隐私、未公开资料和他人数据交给未经确认的第三方模型。

## 检查理解

判断下面四句话是否正确：

1. 只要 WorkBuddy 中出现 DeepSeek 模型，就能证明工具调用和文件权限也已经正常。
2. 使用 DeepSeek 预设时，通常只需填写 Key 并选择模型。
3. 自定义方式的接口地址可以直接照抄 Claude Desktop 的 Anthropic 地址。
4. 最可靠的后端验证之一，是在 DeepSeek 开放平台检查对应时间的用量记录。

<AnswerReveal label="我判断好了，查看参考答案">

1. **错误。** 模型连通、工具调用和本地权限需要分别验证。
2. **正确。** WorkBuddy 官方说明，提供商预设会自动补全地址、模型和能力标记。
3. **错误。** WorkBuddy 的这条接入路径使用 OpenAI 兼容的 Chat Completions 接口。
4. **正确。** 用量记录比询问模型身份更能说明请求是否实际到达 DeepSeek。

</AnswerReveal>

## 本课小结

- 新版 WorkBuddy 优先使用“设置 → 模型 → 添加模型 → 深度求索 / DeepSeek”。
- 预设不可用时，选择自定义 API，并填写 `https://api.deepseek.com/v1/chat/completions`。
- 模型名使用 `deepseek-v4-pro` 或 `deepseek-v4-flash`，工具调用开启，图片输入关闭。
- 旧版客户端可以使用 `.codebuddy/models.json`，文件要保存为 UTF-8 无 BOM。
- 测试顺序是文字回答、用量记录、练习文件夹中的低风险工具任务。
- Key、费用、数据去向和文件权限始终需要由人管理。

## 参考资料

- [WorkBuddy Windows 系统安装指南](https://www.codebuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Installation-Win-Guide)——核对系统要求、官方下载、安装和登录步骤。
- [WorkBuddy 模型配置](https://www.codebuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Model)——核对图形化自定义模型、提供商预设、本地保存、能力标记和安全说明；本文 WorkBuddy 中文界面截图来自该官方文档。
- [DeepSeek：接入 WorkBuddy/CodeBuddy](https://api-docs.deepseek.com/zh-cn/quick_start/agent_integrations/workbuddy/)——核对官方接口地址、模型名、工具与图片能力、配置文件和常见错误。
- [DeepSeek 模型与价格](https://api-docs.deepseek.com/zh-cn/quick_start/pricing/)——查询当前模型能力、上下文、价格和计费规则。
- [DeepSeek 开放平台](https://platform.deepseek.com/)——登录、查看余额和用量。
- [DeepSeek API Key 管理](https://platform.deepseek.com/api_keys)——创建、轮换和删除 API Key。
- [腾讯云 WorkBuddy 接入说明](https://intl.cloud.tencent.com/jp/document/product/1300/80640)——辅助核对设置入口、自定义模型字段和模型选择器；本文英文界面截图来自该官方文档。
