# Windows 桌面版 Claude Code 怎样接入 API

先说结论：在 Windows 桌面版里接入 DeepSeek，不用在 PowerShell 里敲配置命令，也不用改 Claude Code CLI 的环境变量。正确的入口在 Claude Desktop 登录页，叫作 **Third-Party Inference（第三方推理）**。

Claude Code 的桌面工作区位于 Claude Desktop 的 `Code` 标签页。我们先把它连到 DeepSeek 官方 Anthropic API，确认能完成一次只读任务，再看其他中转站该怎么选。整个过程都在 Windows 图形界面中完成。

> [!NOTE]
> 下面的界面和兼容信息核对于 **2026 年 7 月 31 日**。桌面应用、模型名称和 API 能力会更新；如果界面不同，先升级 Claude Desktop，再对照文末官方资料。

## 动手前，准备好这三样东西

第一样是一台符合要求的 Windows 电脑。Claude Desktop 支持 x64 和 Arm64，可以从 [Claude 官方下载页](https://claude.com/download) 安装当前版本。

第二样是 Git for Windows。Windows 上的 `Code` 标签页会用到它，从 [Git 官方网站](https://git-scm.com/downloads/win) 安装后，重新启动 Claude Desktop。

第三样是 API Key。使用 DeepSeek 官方接口时，到 [DeepSeek 开放平台](https://platform.deepseek.com/api_keys) 创建一个，并确认账户余额和计费规则。使用中转站时，就用中转站签发的 Key；不同服务的 Key 不能混用。

这里不安装 Claude Code CLI，也不在 PowerShell 中输入配置命令。

> [!WARNING]
> API Key 相当于一张可以产生费用的通行证。不要把它发给别人，不要写进作业、项目文件或聊天消息，也不要让它出现在截图中。未成年人应在教师或监护人指导下完成付费 API 配置。

## 这条连接到底连了什么

这里很容易产生一个误会：Claude Desktop 并没有把 DeepSeek 模型下载到电脑上。它只是把 `Code` 标签页里的请求发到你填写的 API 地址：

```text
Claude Desktop 的 Code 标签页
              ↓
Anthropic Messages 格式的请求
              ↓
DeepSeek 官方 API 或兼容中转站
              ↓
模型返回文字、流式事件或工具调用
```

桌面版和 CLI 的配置入口不是一回事。官方文档明确说明：桌面应用不会从 `ANTHROPIC_BASE_URL` 或 `%USERPROFILE%\.claude\settings.json` 读取这项网关地址。哪怕终端里的 Claude Code 已经能用，桌面版仍要填写下面的表单。

## 第一步：打开第三方推理配置

这套本地配置只对当前电脑和当前 Windows 用户生效。操作要从 Claude Desktop 登录页开始：先不要创建或登录 Anthropic 账号；如果已经登录，就从账号菜单退出，回到登录页。

1. 在 Windows 应用登录页左上角打开 `☰` 菜单。
2. 进入 `Help → Troubleshooting`。
3. 选择 `Enable Developer Mode`。
4. 应用重启后，打开新出现的 `Developer` 菜单。
5. 选择 `Configure Third-Party Inference…`。

应用重启后，菜单里能看到 `Developer`，并且能打开 `Configure Third-Party Inference…` 窗口，这一步就走通了。

> [!IMAGE]
> 建议文件：`./assets/13-claude-enable-developer-mode.png`
> 内容：Windows Claude Desktop 登录页左上角菜单，以及 `Help → Troubleshooting → Enable Developer Mode` 入口。
> 用途：帮助学习者找到开发者模式开关。
> 风格：Windows 实际界面截图；裁去无关区域，用标记框突出菜单路径。
> 替代文字：Claude Desktop 疑难解答菜单中的启用开发者模式选项。
> 打码要求：隐藏邮箱、头像、组织名称、设备名称和任何账号信息。

> [!NOTE]
> Developer Mode 在这里只是打开第三方推理配置窗口。它不会关闭权限保护，也不会让应用自动获得更高的系统权限。

## 第二步：填写 DeepSeek 官方 API

打开配置窗口，进入 `Connection`，照着下表填写：

| 配置项              | 填写内容                             |
| ------------------- | ------------------------------------ |
| Inference provider  | `Gateway`                            |
| Credential kind     | `Static API key`                     |
| Gateway base URL    | `https://api.deepseek.com/anthropic` |
| Gateway API key     | 你的 DeepSeek API Key                |
| Gateway auth scheme | `Bearer`                             |

先把鉴权方式选为 `Bearer`，这是 DeepSeek 的 Claude Code 官方示例采用的方式。DeepSeek 的 Anthropic 兼容接口也支持 `x-api-key`，但两者使用的请求头不同，不能随意互换；只有当前官方说明或组织管理员明确要求时，才切换到 `x-api-key`。

填完后点击 `Apply locally`。应用会保存当前 Windows 用户的配置并重新启动。回到登录页后，如果能选择第三方配置并进入应用，说明地址和 Key 已经被桌面版接收；能否真正调用模型，还要等第四步的只读任务确认。

> [!IMAGE]
> 建议文件：`./assets/14-claude-third-party-inference.png`
> 内容：Claude Desktop 的 Third-Party Inference 配置窗口，展示 `Gateway`、DeepSeek Base URL、`Static API key`、`Bearer` 和 `Apply locally` 的位置。
> 用途：让学习者逐项核对表单，不展示真实密钥。
> 风格：Windows 实际界面截图；保留完整 Connection 区域，用编号标出填写顺序。
> 替代文字：Claude Desktop 第三方推理配置页中的网关地址、凭证类型、鉴权方式和应用按钮。
> 打码要求：API Key 必须完全遮盖，不能保留开头或结尾；同时隐藏邮箱、组织名称、设备名和本地路径。

### 地址为什么停在 `/anthropic`

表单要填的是 **Base URL（基地址）**。Claude Desktop 会自己在后面请求 `/v1/messages`，最终路径类似：

```text
https://api.deepseek.com/anthropic/v1/messages
```

如果把完整的 `/v1/messages` 也填进去，客户端再次追加路径，就可能请求到一个不存在的地址。

## 第三步：选一个模型来试

桌面端仍会发送 Claude 模型家族名称，DeepSeek 再在服务器端把它们映射到自己的模型：

| 桌面端发送的模型名称    | DeepSeek 实际使用的模型 |
| ----------------------- | ----------------------- |
| 以 `claude-opus` 开头   | `deepseek-v4-pro`       |
| 以 `claude-sonnet` 开头 | `deepseek-v4-flash`     |
| 以 `claude-haiku` 开头  | `deepseek-v4-flash`     |

选择器里具体出现什么，取决于 Claude Desktop 版本、模型发现结果和显式 Models 配置。能看到 Sonnet 或 Haiku 时，先选一个完成短小的只读任务；确实需要更复杂的推理，再试可见的 Opus 对应项。列表为空时，按后文检查 `/v1/models` 或显式 Models 配置，不要自己猜名称。

这里还有一个容易误判的地方：DeepSeek 会把不支持的模型名称自动落到 `deepseek-v4-flash`。因此，没有出现模型错误，不代表它真的用了你以为的模型。要确认实际模型，应对照当前官方映射和服务商的用量记录。

> [!IMAGE]
> 建议文件：`./assets/15-claude-deepseek-model-picker.png`
> 内容：第三方推理模式下 `Code` 标签页的模型选择器，展示当前实际出现的模型条目；如果有 Opus、Sonnet 或 Haiku，再突出相应选项。
> 用途：配合表格说明客户端发送的名称与 DeepSeek 实际模型的映射，并如实记录当前版本的可见列表。
> 风格：Windows 实际界面截图；只保留模型选择器和必要上下文。
> 替代文字：Claude Desktop 模型选择器中的 Opus、Sonnet 和 Haiku 模型家族选项。
> 打码要求：隐藏账号、组织、会话标题、项目名称和本地路径。

## 第四步：从只读任务开始验证

只收到一句“你好”还不够。先新建一个练习文件夹，里面只放一份不含隐私的 `README.md`，再从 `Code` 标签页打开它，发送下面这段话：

> 只读取当前文件夹，不要修改文件。告诉我这里有哪些文件，并用三句话概括 README 的内容。完成后说明你实际读取了什么。

接着检查三件事：

1. 应用有没有正常收到连续的文字回复；
2. 它列出的文件是否和文件夹实际内容一致；
3. 文件差异区是否保持为空。

三项都对得上，才算完成了最基本的连接验证。它只能证明文字请求和这一次只读任务能工作；编辑、工具调用和错误恢复，还要在一个随时可以删除的练习文件里分别测试。

> [!IMAGE]
> 建议文件：`./assets/16-claude-deepseek-readonly-success.png`
> 内容：Claude Desktop `Code` 标签页完成只读 README 任务，界面显示正常回答且没有文件修改。
> 用途：给出连接成功的最低验收标准。
> 风格：Windows 实际界面截图；只展示任务、简短结果和空的差异状态。
> 替代文字：Claude Desktop 通过 DeepSeek 完成只读文件检查并且没有产生文件修改。
> 打码要求：隐藏 API Key、账号、组织名称、项目绝对路径、用户名、会话 ID 和请求 ID。

## DeepSeek 接入后有哪些能力差异

连接成功后，先别急着把 Claude 的所有功能都搬过来。DeepSeek 的 Anthropic 兼容接口支持普通文本、流式返回、常规工具定义、`tool_use` 和 `tool_result`，但下面这些能力仍有限制：

- 图片和文档内容块不受支持；
- `mcp_servers` 字段会被忽略；
- `mcp_tool_use` 和 `mcp_tool_result` 内容块不受支持；
- `code_execution_tool_result` 和 `container_upload` 不受支持，`container` 等部分字段会被忽略；
- 一些 Anthropic Beta 字段不受支持或会被忽略。

上面说的是 Anthropic API 原生 MCP 字段和内容块。如果客户端把某个本地 MCP 工具转换成普通 `tool_use`，它仍有可能工作，但必须实测。文本问答和本地编程任务跑通后，再逐项测试你真正会用到的图片、文档、MCP 和桌面工具。

## 换成其他中转站，先问清七件事

“OpenAI 兼容”这个说法太宽泛，不能直接拿来判断 Claude Desktop。配置前，把下面七件事逐项问清：

1. 提供 Anthropic Messages API；
2. 接收 `POST <Base URL>/v1/messages`；
3. 支持 SSE 流式返回；
4. 支持 Anthropic 格式的工具定义、`tool_use` 和 `tool_result`；
5. 告诉你使用 `Bearer` 还是 `x-api-key`；
6. 能正确处理或原样转发 `anthropic-version`、`anthropic-beta` 及新增请求字段；
7. 告诉你真实模型 ID，或者提供可用的 `/v1/models` 接口。

SSE 可以先理解成：服务器沿着同一条连接，一小段一小段地推送输出。如果中转站把内容一直攒到最后才返回，桌面 Agent 的体验和稳定性都会受影响。

`GET /v1/models` 对 Claude Desktop 网关是可选的。没有模型发现接口时，就在第三方推理配置的 Models 部分手动填写站方接受的完整模型 ID，必要时关闭 Model discovery。

Base URL 一定以中转站自己的文档为准。比如站方给出的最终接口是：

```text
https://gateway.example.com/anthropic/v1/messages
```

表单里通常就填写：

```text
https://gateway.example.com/anthropic
```

不要看到别的教程里有 `/v1`，就给所有地址统一添加或删除一段路径。

> [!WARNING]
> 一个只支持 `/chat/completions` 的“OpenAI 兼容”中转站，不能因此直接用于 Claude Desktop。协议转换如果不完整，普通聊天可能偶尔成功，工具调用、流式事件和长任务仍会失败。

## 常见错误怎样排查

出错后先看现象，不要一上来把地址、Key 和模型全换一遍：

| 现象                                     | 可能原因                                                                 | 优先处理                                                                                               |
| ---------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `Gateway was unreachable`                | 地址错误、DNS（域名解析）、代理、VPN、防火墙或 TLS（加密连接与证书）问题 | 核对 Base URL 和网络路径；浏览器能打开域名只能初步排除部分网络问题，不能证明 API 路径、鉴权和 SSE 正常 |
| `401`                                    | Key 错误，或 Bearer / `x-api-key` 选错                                   | 重新生成 Key，并按站方说明切换鉴权方式                                                                 |
| `402`                                    | DeepSeek 账户余额不足                                                    | 查看余额和计费状态，充值后再试                                                                         |
| `404`                                    | Base URL 已经包含了不该包含的 `/v1/messages`，或站方没有该路由           | 对照最终端点，重新确定基地址                                                                           |
| `400` 或 `422`                           | 模型 ID、`thinking`、工具字段或协议不兼容                                | 先做最短文本请求，再让站方确认 Messages 与工具字段支持情况                                             |
| 普通回答成功，工具任务失败               | 中转站没有完整转发工具调用或流式事件                                     | 要求站方验证 `tool_use`、`tool_result` 和 SSE                                                          |
| 上传图片或文档失败                       | DeepSeek 当前 Anthropic 兼容能力有限                                     | 改用文本输入，或选择明确支持这些内容块的服务                                                           |
| `429`                                    | 请求过多或账户达到限制                                                   | 停止反复重试，稍后再试并查看限额                                                                       |
| `500`、`503`                             | DeepSeek 服务端错误或过载                                                | 保存错误时间和状态码，等待服务恢复或联系服务商                                                         |
| `529`                                    | Anthropic 或某些中转站使用的过载状态码                                   | 按当前服务商的状态页和错误说明处理，不能把它当作 DeepSeek 固定错误码                                   |
| HTTP `200` 却返回 HTML、空内容或格式异常 | 登录页、WAF（网站应用防火墙）、反向代理或错误路由没有返回 API JSON       | 核对 API 域名和路径，并让服务商检查 WAF 与代理规则                                                     |
| 模型选择器为空                           | `/v1/models` 缺失、超时或没有显式 Models 配置                            | 手动填写站方接受的完整模型 ID，必要时关闭模型发现                                                      |

排查顺序很简单：地址 → 鉴权 → 最短文本请求 → 工具和长任务。一次只改一项；同时更换地址、Key、模型和权限，即使碰巧成功，也不知道究竟是哪一项起了作用。

## 连上之后，先别碰重要项目

第一次编辑继续使用可以随时删除的练习文件夹：

- 先让 Agent 说明计划，再允许编辑；
- 查看每一处文件差异；
- 不开放与任务无关的目录和账号；
- 真实项目先提交版本控制或做好备份；
- 删除、安装软件、发布和发送消息等动作单独确认。

模型和工具决定它能做什么，客户端权限、操作系统和你的检查决定它可以做到哪一步。提示词里写一句“千万不要删文件”，代替不了真正的权限限制。

## 检查理解

判断下面三个中转站说明，哪一个最可能直接用于 Claude Desktop：

- 甲：只写“OpenAI Chat Completions compatible”，最终路径是 `/v1/chat/completions`。
- 乙：明确支持 `POST /v1/messages`、SSE、工具调用，并说明 Key 使用 `x-api-key`。
- 丙：支持普通 Messages 请求，但不支持流式事件和工具调用。

<AnswerReveal label="我已判断 Claude 网关兼容性，查看参考答案">

乙最符合桌面 Code 工作区的基本条件。甲的协议不同；丙可能完成简单的非流式聊天，却不能稳定支撑 Claude Code 的流式交互和工具任务。即使选择乙，也还要核对 Base URL、真实模型 ID、费用和数据处理方式，并在练习文件夹中实际验证。

</AnswerReveal>

## 最后记住这几件事

- Windows 上的 Claude Code 桌面体验位于 Claude Desktop 的 `Code` 标签页。
- 桌面第三方推理要通过 Developer 菜单中的配置表单完成，不能用终端环境变量代替。
- DeepSeek 的 Anthropic Base URL 是 `https://api.deepseek.com/anthropic`。
- Opus 会映射到 `deepseek-v4-pro`，Sonnet 和 Haiku 会映射到 `deepseek-v4-flash`。
- 中转站必须真正支持 Anthropic Messages、SSE 和工具调用；“OpenAI 兼容”不够。
- DeepSeek 当前并不支持全部 Anthropic 内容块和桌面功能，需要按真实任务逐项测试。
- 第一次验证应使用专门练习文件夹和只读任务，并始终隐藏 API Key。

下一篇转到 ChatGPT Windows 桌面应用中的 Codex，重点解决自定义 API 最常见的连接超时问题。

## 参考资料

- [Labuladong：Claude Code 安装与使用](https://labuladong.online/zh/ai-coding/claude-code/install-and-use/)——用于参考入门讲解顺序；本课改为 Windows 桌面第三方推理流程。
- [Claude Code Desktop application](https://code.claude.com/docs/en/desktop)——用于核对 `Code` 标签页、Windows 安装要求和桌面能力。
- [Installation and setup — Claude Desktop on 3P](https://claude.com/docs/third-party/claude-desktop/installation)——用于核对单机配置、不登录 Anthropic 账号和 `Apply locally` 流程。
- [Connect Claude Code to an LLM gateway](https://code.claude.com/docs/en/llm-gateway-connect)——用于核对桌面应用必须使用 Third-Party Inference 配置以及网关排错方法。
- [In-app configuration — Claude Desktop on 3P](https://claude.com/docs/third-party/claude-desktop/in-app-configuration)——用于核对 Developer 菜单、配置窗口和 `Apply locally`。
- [Deploy Claude Desktop on 3P with an LLM gateway](https://claude.com/docs/third-party/claude-desktop/gateway)——用于核对 Messages、流式输出、工具调用、鉴权方式和模型发现要求。
- [Using the Anthropic API — DeepSeek](https://api-docs.deepseek.com/guides/anthropic_api)——用于核对 Base URL、模型映射和当前兼容能力。
- [Integrate with Claude Code — DeepSeek](https://api-docs.deepseek.com/quick_start/agent_integrations/claude_code)——用于核对 Claude Code / Desktop 模型映射和 DeepSeek 接入说明。
- [Error Codes — DeepSeek](https://api-docs.deepseek.com/quick_start/error_codes)——用于核对余额、鉴权、参数、限流和服务端错误码。
