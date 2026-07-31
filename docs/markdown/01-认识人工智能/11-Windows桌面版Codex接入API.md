# Windows 桌面版 Codex 怎样接入 API

先说结论：**Codex 能不能接上一个 API，先看它有没有 `/responses`，再看 Key。**

Windows 上的 Codex 现在位于 ChatGPT 桌面应用中。很多人还是习惯叫它“Codex 桌面版”，本课也沿用这个简称。你实际操作的是 **ChatGPT Windows 桌面应用中的 Codex 视图**，不是另一套独立程序。

> [!NOTE]
> 本课界面、模型和兼容信息核对于 **2026 年 7 月 31 日**。截至这个日期，DeepSeek 的 Codex 接入只支持 `deepseek-v4-flash`；`deepseek-v4-pro` 仍标注为预计 2026 年 8 月初支持，不能当作当前已可用模型。

## 先看接口，别急着填 Key

Claude Desktop 和 Codex 虽然都能接第三方模型，接口却不是一套东西：Claude Desktop 使用 Anthropic Messages API，Codex 当前的自定义模型提供商使用 **Responses API**。

```text
ChatGPT 桌面应用中的 Codex
              ↓
Responses API 请求与 SSE 流式事件
              ↓
DeepSeek 官方 API 或兼容中转站
              ↓
deepseek-v4-flash 或站方提供的模型
```

所以，中转站写着下面这些话，还不能证明它能给 Codex 用：

- “OpenAI 兼容”；
- “支持 GPT 格式”；
- “支持 `/chat/completions`”；
- “能在普通聊天软件中使用”。

真正要找的是三项：`/responses`、Responses API 的 SSE 流式事件、Codex 使用的工具调用格式。SSE 可以先理解成“服务器沿着同一条连接，一段一段推送事件”。

### 先把兼容边界说清楚

DeepSeek 当前实现的是 Responses API 的一部分能力。图片和文件输入暂不支持；`previous_response_id`、Conversations、`store`、后台任务，以及 `file_search`、`code_interpreter`、`computer_use`、内置 MCP 等能力也有缺失。

这不妨碍我们先完成文本、代码和本地命令的基础接入，但图片、MCP、Computer Use 和长任务要在目标版本上另行验证。后面排错时，也要把“功能没实现”和“网络超时”分开。

## 准备 Key 和练习文件夹

使用 DeepSeek 官方接口，就到 [DeepSeek 开放平台](https://platform.deepseek.com/api_keys) 创建 API Key，并先看余额、价格和限额。使用中转站，就用中转站签发的 Key。两边的 Key 不能混用。

再准备一个不含隐私、随时可以删除的练习文件夹。第一次连接不要拿重要项目试手。

> [!WARNING]
> API Key 可以产生费用。不要把真实 Key 写进 `config.toml`、项目文件、聊天内容或截图；未成年人应在教师或监护人指导下完成付费 API 配置。

## 第一步：找到真正生效的配置文件

从 OpenAI 官方入口安装 [ChatGPT Windows 桌面应用](https://learn.chatgpt.com/docs/windows/windows-app)。至少启动一次，再切换到 `Codex` 视图。

进入：

```text
Settings → Configuration → Open config.toml
```

Windows 上的用户级配置文件通常是：

```text
%USERPROFILE%\.codex\config.toml
```

> [!IMAGE]
> 建议文件：`./assets/17-codex-open-config-toml.png`
> 内容：ChatGPT Windows 桌面应用的 `Settings → Configuration` 页面，突出 `Open config.toml`。
> 用途：帮助学习者打开正确的用户级配置文件。
> 风格：Windows 实际界面截图；保留设置页标题和按钮，裁去无关区域。
> 替代文字：ChatGPT Windows 应用配置页中的打开 config.toml 按钮。
> 打码要求：隐藏邮箱、头像、组织名称、项目名称、本地用户名和绝对路径。

### 别把提供商配置写进项目

Codex 确实支持项目级 `.codex/config.toml`，但其中的 `model_provider`、`model_providers`、`openai_base_url` 等提供商设置会被忽略。

原因很好理解：不能让一个刚下载的项目悄悄改掉请求地址。第三方 API 配置要写在用户级 `%USERPROFILE%\.codex\config.toml` 中。

## 第二步：用 Windows 用户变量保存 Key

不要把真实 Key 塞进 TOML。用 `env_key` 后，配置文件只记环境变量的名字，Key 留在 Windows 用户变量里。

### 在图形界面中创建变量

1. 打开 Windows 搜索，输入“编辑账户的环境变量”。
2. 打开对应的系统设置窗口。
3. 在“用户变量”区域选择“新建”。
4. 变量名填写 `DEEPSEEK_API_KEY`。
5. 变量值填写你的真实 DeepSeek API Key。
6. 确认并关闭所有窗口。

不要修改 `Path`，也不要把 Key 放进变量名。

> [!IMAGE]
> 建议文件：`./assets/18-windows-deepseek-api-key-variable.png`
> 内容：Windows“环境变量”窗口，在用户变量区域创建 `DEEPSEEK_API_KEY`，变量值完全遮盖。
> 用途：帮助学习者通过图形界面保存 Key，不依赖 PowerShell。
> 风格：Windows 实际界面截图；用编号突出“用户变量”“新建”“变量名”和“变量值”。
> 替代文字：Windows 用户环境变量中名为 DEEPSEEK_API_KEY 的新变量。
> 打码要求：变量值必须完全遮盖；同时隐藏 Windows 用户名、设备名、其他私密变量值和个人路径。

> [!WARNING]
> 已经打开的应用读不到后来新建的环境变量。配置完成后要 **完全退出 ChatGPT，包括后台进程，再重新打开**。只关窗口不一定够。

先等正在运行的任务结束，再右击系统托盘里的 ChatGPT 图标并选择“退出”。托盘里找不到，但应用还在运行时，可以到任务管理器结束 ChatGPT 进程。

## 第三步：填写 DeepSeek 配置

先备份 `config.toml`。下面的 **顶层三行必须放在所有 `[表名]` 之前**。原文件里的 MCP、权限等配置要保留，别整份覆盖。

已经有 `model`、`model_provider` 或 `model_reasoning_effort`，就修改原值；已经有 `[model_providers.deepseek]`，就修改原表。TOML 不允许重复声明同名键和同名表。

```toml
model = "deepseek-v4-flash"
model_provider = "deepseek"
model_reasoning_effort = "low"

[model_providers.deepseek]
name = "DeepSeek"
base_url = "https://api.deepseek.com/"
env_key = "DEEPSEEK_API_KEY"
wire_api = "responses"
supports_websockets = false
request_max_retries = 2
stream_max_retries = 2
stream_idle_timeout_ms = 600000
```

### 哪几项最关键

前五项决定“请求发给谁”：

- `model`：当前可用于 Codex Responses 接入的 `deepseek-v4-flash`；
- `model_provider`：选中下面这组 `deepseek` 提供商；
- `base_url`：DeepSeek 官方 API 基地址；
- `env_key`：从 Windows 用户变量读取 Key；
- `wire_api = "responses"`：按 Responses API 发请求。

其余几项是第一次连接时的保守设置：先用 `low` 减少等待；关闭 WebSocket，走 HTTP/SSE；请求和流中断各重试两次；SSE 空闲等待最多 10 分钟。稳定后可以再按需要调整推理级别。

不要同时添加 `requires_openai_auth = true`。它会让 Codex 使用 OpenAI 鉴权并忽略 `env_key`，结果就是 DeepSeek Key 怎么填都不生效。

### TOML 最容易出现的两个格式错误

第一，顶层配置必须放在任何 `[model_providers.deepseek]`、`[mcp_servers...]` 等表头之前。下面这样写是错的：

```toml
[mcp_servers.example]
command = "example"

model = "deepseek-v4-flash"
model_provider = "deepseek"
model_reasoning_effort = "low"
```

最后三行虽然顶格写了，仍属于 `[mcp_servers.example]`，不是顶层设置。

第二，用记事本保存时要确认文件仍叫 `config.toml`，没有变成 `config.toml.txt`。

> [!IMPORTANT]
> 上面是按 OpenAI 当前配置规范整理的 **精简配置草案**，不是 DeepSeek 官方完整配方；本轮也没有用真实 Windows 桌面环境和 Key 实测。正式教学前，教师应在目标版本上完整走一遍。

DeepSeek 的官方方案还会生成 `models.json`，并通过 `model_catalog_json` 补充上下文窗口、工具格式和推理级别等元数据。如果应用不显示 `Custom`，或者提示模型元数据异常，先更新桌面应用，再改用文末官方集成页中的完整方案。

## 第四步：完全重启并做只读验证

1. 保存 `config.toml`。
2. 完全退出 ChatGPT Windows 应用和它的后台进程。
3. 重新打开应用并进入 `Codex`。
4. 查看模型选择器是否显示 `Custom`。

看到 `Custom`，说明自定义模型配置被选中了，但还不能收工。接下来要发出一次真实请求。

> [!IMAGE]
> 建议文件：`./assets/19-codex-deepseek-custom-model.png`
> 内容：配置生效后，ChatGPT Windows 应用的 Codex 模型选择器显示 `Custom`。
> 用途：记录桌面端是否选择了本地自定义模型；不能把它单独作为 API 成功证明。
> 风格：Windows 实际界面截图；只保留 Codex 标题和模型选择器。
> 替代文字：Codex 模型选择器显示 Custom 自定义模型。
> 打码要求：隐藏账号、组织名称、项目名称、本地路径和会话内容。

### 第一次任务不要修改文件

打开刚才准备的练习文件夹，然后发送：

> 只读取当前项目，不要修改文件，也不要安装任何软件。列出顶层文件，告诉我这个项目可能用什么技术，并说明你的判断依据。找不到依据时明确说不知道。

核对三件事：文件列表对不对，判断有没有依据，差异面板是不是空的。三项都对，才算完成第一次验收。

> [!IMAGE]
> 建议文件：`./assets/20-codex-deepseek-readonly-success.png`
> 内容：Codex 使用 `Custom` 模型完成一次只读项目检查，显示结果且文件差异为空。
> 用途：展示比“能回复你好”更可靠的首次验收方法。
> 风格：Windows 实际界面截图；保留任务、简短结果和无改动状态。
> 替代文字：Codex 通过自定义 DeepSeek 模型完成只读项目检查且没有修改文件。
> 打码要求：隐藏账号、API Key、项目真实名称、绝对路径、用户名、仓库地址和请求 ID。

## 连接其他中转站

如果中转站使用 Bearer Key，最终接口类似 `https://gateway.example.com/v1/responses`，可以从下面的模板开始：

```toml
model = "<中转站给出的真实模型 ID>"
model_provider = "gateway"

[model_providers.gateway]
name = "自定义 API 网关"
base_url = "https://gateway.example.com/v1"
env_key = "AI_GATEWAY_API_KEY"
wire_api = "responses"
supports_websockets = false
request_max_retries = 2
stream_max_retries = 2
stream_idle_timeout_ms = 600000
```

在 Windows 用户变量中创建 `AI_GATEWAY_API_KEY`，方法和上一节相同。

只有站方明确支持 Responses 的 `reasoning.effort`，才添加 `model_reasoning_effort = "low"`。不确定就先省略，免得网关直接返回 `400` 或 `422`。

### Base URL 不要统一照抄 `/v1`

先找到站方给出的 **最终 Responses 地址**，再删掉末尾的 `/responses`：

| 站方最终接口 | `base_url` 应填写 |
| --- | --- |
| `https://gateway.example.com/v1/responses` | `https://gateway.example.com/v1` |
| `https://gateway.example.com/responses` | `https://gateway.example.com` |

有些地址还带租户路径。不要凭经验补 `/v1`，否则很容易拼成 `/v1/v1/responses`，甚至请求到普通网页。

最终地址带 `api-version` 等查询参数时，按站方的 Codex 文档配置 `query_params`，不要把查询字符串硬塞进 `base_url`。

### 如果中转站要求 `x-api-key`

把模板中的：

```toml
env_key = "AI_GATEWAY_API_KEY"
```

替换为：

```toml
env_http_headers = { "x-api-key" = "AI_GATEWAY_API_KEY" }
```

右侧仍然是环境变量名，不是真实 Key。真实 Key 不要写进 `http_headers`。

### 配置前，先问服务商六句话

1. 是否真正支持 Responses API，而不只是 Chat Completions；
2. 最终 `/responses` 地址和应填写的 Base URL；
3. 是否实时转发 Responses SSE 事件，而不是缓存完整回答；
4. 实际模型 ID；
5. Key 使用 Bearer、`x-api-key` 还是其他请求头；
6. WAF、首包时间、空闲超时、并发和重试限制。

## 重点排查：为什么 Codex 会连接超时

先别急着点“重试”。“连接超时”只是界面上的结果，真正的问题可能发生在域名解析、鉴权、接口路径、模型排队或流式传输中的任何一层。

### 第一步：看它在哪一层停住

| 现象 | 先查什么 | 下一步动作 |
| --- | --- | --- |
| 立即提示无法连接 | 域名、DNS、TLS 证书、代理、VPN、防火墙 | 先确认地址和网络 |
| 很快返回状态码或 HTML | Key、接口路径、模型 ID、WAF | 按状态码处理 |
| 已连接，但迟迟没有第一个事件 | 模型排队、推理慢、代理缓冲 SSE | 查服务端和代理日志 |
| 已经开始输出，随后断开 | 网络抖动、代理空闲超时、SSE 被截断 | 查流式传输和重试 |

### 第二步：读懂返回内容

- **`404 /responses`**：要么 Base URL 拼错，要么服务只有 `/chat/completions`。核对最终接口；没有 Responses API 就更换服务。
- **返回 HTML**：请求多半进了登录页、网站首页、WAF 拦截页或反向代理错误页。检查 API 专用域名、租户路径和 WAF 规则。
- **`401`**：检查环境变量名是否与 `env_key` 一致、Key 是否属于当前服务、是否被撤销或带空格，以及鉴权究竟是 Bearer 还是 `x-api-key`。新建变量后还要完全重启应用。
- **`400`、`422`、`model not found`**：先核对模型 ID。截至 2026 年 7 月 31 日，DeepSeek Responses 只能用 `deepseek-v4-flash`；中转站则要使用站方给出的真实 API 模型 ID。
- **`402`**：余额不足；**`429`**：超过速率或并发限制；**`500`、`503`**：服务端错误或过载。先看余额和服务状态，不要无限重试。

### 第三步：区分“没首包”和“输出中断”

很久没有第一个有效事件，通常要查模型排队和 SSE 缓冲。Responses API 会持续发送 SSE 事件；如果中转站把它们攒到回答结束再一次性吐出来，Codex 在等待期间就可能断开。

让服务商确认四件事：

- SSE 响应没有被缓冲；
- Responses 事件没有被改写成 Chat Completions 的 `[DONE]`；
- `response.completed`、`response.incomplete`、`response.failed` 等结束事件能够透传；
- 首包和空闲超时足以覆盖模型可能的等待时间。

DeepSeek 等待期间可能发送 `: keep-alive`，但 OpenAI 公开文档没有说明它是否会重置当前 Codex 客户端的空闲计时。服务商看到了 keep-alive，只能证明上游还活着，不能证明桌面端一定不会超时。

如果回答已经开始输出，后来才断开，重点转向网络抖动、反向代理的 SSE 空闲超时和流中断重试。

### 最后才调整超时和重试

```toml
request_max_retries = 2
stream_max_retries = 2
stream_idle_timeout_ms = 600000
```

- `request_max_retries` 管普通 HTTP 请求失败；
- `stream_max_retries` 管流式连接中断；
- `stream_idle_timeout_ms` 管 SSE 多久没有活动才算空闲超时。

这三项只对慢响应和短暂断线有帮助。DNS、证书、错误路径、`401`、HTML 响应和缺失的 `/responses`，都要回到对应那一层处理。

DeepSeek 还规定：请求在服务端等了 10 分钟仍未开始推理，会被主动断开。这是服务端排队规则，不是 Codex 的总任务时限。这里的 `600000` 只是本课用于首次排障的空闲容忍值；如果发生重试，整次任务完全可能超过 10 分钟。

> [!IMAGE]
> 建议文件：`./assets/21-codex-api-timeout-error.png`
> 内容：Codex 中一次典型的连接超时或 `/responses` 错误，保留状态码、路径和简短错误文本。
> 用途：教学习者从状态码和响应类型判断故障层次，而不是只看“重试”按钮。
> 风格：Windows 实际界面截图；用标记框突出状态码、路径和错误类型。
> 替代文字：Codex 自定义 API 请求显示状态码和 Responses 路径的连接错误。
> 打码要求：隐藏 API Key、Authorization 头、账号、项目路径、请求 ID、中转站私有域名和任何源码内容。

## 最快的排查顺序

如果你不想在十几项设置里来回试，就按这个顺序，每次只改一项：

1. 更新 ChatGPT Windows 桌面应用；
2. 确认使用用户级 `config.toml`，顶层键位于所有表之前；
3. 确认模型是当前可用的真实 ID；
4. 确认最终路径确实是 `/responses`；
5. 确认 Key、环境变量名和鉴权请求头；
6. 完全退出并重启应用，用 `low` 推理跑最短只读任务；
7. 请求已经进入推理后，再查 SSE 缓冲、流中断和空闲时间。

前五步解决“配置错了”，后两步才处理“连接慢了”。

## 权限和 API 连接是两回事

API 配置回答“请求发给谁”，Codex 权限回答“它能在电脑上做什么”。两件事别混在一起。连接成功后仍应：

- 只打开练习文件夹；
- 使用 `Ask for approval` 等受控权限开始；
- 修改前查看计划，修改后审查差异；
- 不让 Agent 读取保存 Key 的界面或文件；
- 重要项目保留版本控制或备份；
- 安装、删除、发布、登录和发送信息前再次确认。

自定义 API Key 也不会附带 ChatGPT 订阅、云端任务或其他账号功能。桌面权限、ChatGPT 账号和第三方 API 账单是三套独立的东西。

## 检查理解

下面四种情况应该先处理什么？

1. 错误是 `404`，路径以 `/responses` 结尾，中转站文档只提到 `/chat/completions`。
2. 创建环境变量后立即重试，仍然得到 `401`，但应用一直没有完全退出。
3. 返回内容是一整页 HTML 登录页面。
4. 请求已经开始输出，几分钟后流式连接中断。

<AnswerReveal label="我已完成 Codex 超时诊断，查看参考答案">

1. 中转站不满足 Responses API 条件，应确认是否有 `/responses` 或更换服务；延长超时无效。
2. 完全退出桌面应用并重新启动，让新进程读取环境变量；仍失败再核对 Key 和鉴权方式。
3. 核对 API 域名、Base URL、登录状态和 WAF。HTML 不是有效的 Responses JSON。
4. 检查网络抖动、反向代理的 SSE 空闲超时和事件透传；此时 `stream_max_retries` 与合理的空闲时间才可能起到缓解作用。

</AnswerReveal>

## 本课小结

- Windows 上的 Codex 桌面体验位于 ChatGPT 桌面应用中。
- 接第三方服务先确认 `/responses`，再配置 Key；截至 2026 年 7 月 31 日，DeepSeek 应使用 `deepseek-v4-flash`。
- 提供商配置放在用户级 `%USERPROFILE%\.codex\config.toml`，Key 优先放在 Windows 用户环境变量中。
- 本课关闭 WebSocket、限制重试并设置 10 分钟 SSE 空闲时间，这是一组待目标 Windows 环境验证的保守起点，不是通用最优值。
- 排错要看故障发生在哪一层：地址、鉴权、模型、服务状态和 SSE 传输各有各的处理方法。
- 连接成功后仍要从只读任务、最小权限和文件差异审查开始。

到这里，你已经能在 Windows 桌面版 Codex 中接入第三方 API，也知道出了问题该先看哪一层，而不是盯着“重试”按钮碰运气。

## 参考资料

- [Labuladong：Codex 安装与使用](https://labuladong.online/zh/ai-coding/codex/install-and-use/)——用于参考入门讲解顺序；本课改为 ChatGPT Windows 桌面应用、自定义 API 和超时排查流程。
- [ChatGPT desktop app](https://learn.chatgpt.com/docs/app)——用于核对 ChatGPT 桌面应用与 Codex 工作入口。
- [ChatGPT desktop app for Windows](https://learn.chatgpt.com/docs/windows/windows-app)——用于核对 Windows 安装、项目和权限操作。
- [Config basics — Codex](https://learn.chatgpt.com/docs/config-file/config-basic)——用于核对用户级配置路径与桌面端打开方式。
- [Advanced Config — Custom model providers](https://learn.chatgpt.com/docs/config-file/config-advanced#custom-model-providers)——用于核对自定义提供商、鉴权和 Base URL 配置。
- [Configuration Reference — Codex](https://learn.chatgpt.com/docs/config-file/config-reference#configtoml)——用于核对 `env_key`、Responses、重试、SSE 空闲超时、WebSocket 和项目级配置限制。
- [Integrate with Codex — DeepSeek](https://api-docs.deepseek.com/quick_start/agent_integrations/codex)——用于核对 DeepSeek 模型、Base URL、Responses API 和桌面 `Custom` 标签。
- [Using the Responses API — DeepSeek](https://api-docs.deepseek.com/guides/responses_api)——用于核对当前模型支持和 Responses 兼容范围。
- [Error Codes — DeepSeek](https://api-docs.deepseek.com/quick_start/error_codes)——用于核对 `401`、`402`、`422`、`429`、`500` 和 `503` 等错误。
- [Rate Limit & Isolation — DeepSeek](https://api-docs.deepseek.com/quick_start/rate_limit)——用于核对并发限制、等待心跳和 10 分钟服务端等待边界。
