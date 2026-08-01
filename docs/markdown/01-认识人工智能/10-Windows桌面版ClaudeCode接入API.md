import claudeInstallerProgressFigure from "./assets/10-02-claude-installer-progress.png";
import claudeGetStartedFigure from "./assets/10-03-claude-get-started.png";
import claudeEnableDeveloperModeFigure from "./assets/10-04-claude-enable-developer-mode.png";
import claudeEnableDeveloperConfirmFigure from "./assets/10-05-claude-enable-developer-confirm.png";
import claudeThirdPartyInferenceMenuFigure from "./assets/10-06-claude-third-party-inference-menu.png";
import claudeGatewayConnectionFigure from "./assets/10-07-claude-gateway-connection.png";
import claudeStaticApiKeyFigure from "./assets/10-08-claude-static-api-key.png";
import claudeGatewayCredentialsFigure from "./assets/10-10-claude-gateway-credentials.png";
import claudeTierAliasFigure from "./assets/10-11-claude-tier-alias.png";
import claudeDeepseekModelFigure from "./assets/10-12-claude-deepseek-v4-pro-model.png";
import claudeTestConnectionFigure from "./assets/10-13-claude-test-connection-success.png";
import claudeSaveRestartFigure from "./assets/10-14-claude-save-restart.png";
import claudeGatewayActiveFigure from "./assets/10-15-claude-gateway-active.png";

# Windows Claude Desktop 接入 DeepSeek 官方 API

先说结论：这篇教程配置的是 **Windows 版 Claude Desktop 的第三方推理功能**。整个过程都在图形界面里完成，不需要安装独立的 Claude Code CLI，也不需要执行 `npm` 命令。

配置完成后，Claude Desktop 会把推理请求发送到 DeepSeek 的 Anthropic 兼容接口。你仍然在 Claude Desktop 中选择任务、文件夹和权限，模型推理由 DeepSeek API 提供。

> [!NOTE]
> 本文界面与兼容信息核对到 **2026 年 8 月 1 日**。Claude Desktop、DeepSeek 模型和配置入口都可能更新；如果按钮名称不同，请先升级应用，再对照文末的官方资料。

> [!WARNING]
> 本文涉及付费 API 和可产生费用的 API Key，更适合家长、教师、社团指导员，或由监护人陪同操作的学生。不要让未成年人独立充值、保存或传播密钥。

## 开始前说明

### 准备这三样东西

1. 一台 Windows 10 或 Windows 11 电脑；
2. 当前版本的 Claude Desktop；
3. DeepSeek 开放平台账号和可用余额。

如果之后要在 Claude Desktop 的 `Code` 标签页中打开本地项目，还需要安装 [Git for Windows](https://git-scm.com/downloads/win)。仅完成本文的网关配置，不需要另外安装 Claude Code CLI。

### 先看最终要填什么

| 配置项 | 填写内容 |
| --- | --- |
| Inference provider | `Gateway` |
| Gateway base URL | `https://api.deepseek.com/anthropic` |
| Credential kind | `Static API key` |
| Gateway API key | 你在 DeepSeek 开放平台创建的 API Key |
| Gateway auth scheme | `x-api-key` |
| 推荐模型路由 | `claude-opus-4` → DeepSeek V4 Pro |

> [!WARNING]
> API Key 相当于一张能够产生费用的密码。创建后不要截图，不要发给别人，不要写进项目、作业或公开仓库。如果完整密钥曾出现在截图或聊天记录中，应立即删除旧 Key 并创建新 Key。

## 这条连接到底连了什么

Claude Desktop 并没有把 DeepSeek 模型下载到电脑里。它只是把请求发送到你填写的 API 地址：

```text
你在 Claude Desktop 中提出任务
              ↓
Claude Desktop 组织上下文、权限和工具
              ↓
DeepSeek Anthropic 兼容接口完成鉴权和模型路由
              ↓
DeepSeek 模型返回文字、流式事件或工具调用
```

桌面应用的第三方推理配置与 Claude Code CLI 的环境变量是两条不同路径。本文只讲桌面图形界面，不要把终端教程中的变量直接照搬到配置窗口。

## 阶段一：安装并打开第三方推理配置

### 步骤 1：下载 Claude Desktop

打开 [Claude 官方下载页面](https://claude.com/download)：

- 普通 Intel 或 AMD Windows 电脑选择 `Download for Windows`；
- 只有 Windows on ARM 设备才选择 `Windows (arm64)`。

为了避免公开浏览器书签、账号状态等个人信息，这里不使用带完整浏览器工具栏的截图。请以官方页面当前显示的下载按钮为准。

### 步骤 2：运行 Claude Setup

双击下载得到的 `Claude Setup.exe`。安装器会继续下载完整的 Claude Desktop 应用，请保持网络连接，等待安装自动完成。

<CourseFigure
  src={claudeInstallerProgressFigure}
  alt="Windows 文件资源管理器中的 Claude Setup 安装程序和正在下载 Claude 的进度窗口"
  caption="安装器体积不大，运行后还会继续下载完整应用。"
/>

> [!NOTE]
> 安装时可能出现 Windows UAC 权限请求。只从 Claude 官方页面下载安装包；如果系统要求重新启动，请先完成重启再继续。

### 步骤 3：启用 Developer Mode

首次打开 Claude Desktop，会看到 `Get started` 页面。在登录页左上角打开三横线菜单，进入下面的配置入口。

<CourseFigure
  src={claudeGetStartedFigure}
  alt="Claude Desktop Windows 应用首次启动时的 Get started 页面"
  caption="第三方推理配置要从未登录状态下的应用菜单进入。"
/>

依次选择：

```text
Help → Troubleshooting → Enable Developer Mode
```

<CourseFigure
  src={claudeEnableDeveloperModeFigure}
  alt="Claude Desktop 的 Help 和 Troubleshooting 菜单中显示 Enable Developer Mode"
  caption="在 Troubleshooting 子菜单中启用开发者模式。"
/>

出现确认窗口后点击 `Enable`。Developer Mode 在这里的作用是显示第三方推理配置入口，不等于关闭文件权限或系统安全保护。

<CourseFigure
  src={claudeEnableDeveloperConfirmFigure}
  alt="Claude Desktop 的 Enable Developer Mode 确认窗口"
  caption="确认启用后，应用菜单中会增加 Developer 选项。"
/>

### 步骤 4：打开第三方推理配置

重新打开左上角菜单，依次选择：

```text
Developer → Configure Third-Party Inference…
```

<CourseFigure
  src={claudeThirdPartyInferenceMenuFigure}
  alt="Claude Desktop 的 Developer 菜单中显示 Configure Third-Party Inference"
  caption="第三方 API 的桌面配置入口位于 Developer 菜单。"
/>

## 阶段二：连接 DeepSeek 并完成鉴权

### 步骤 5：选择 Gateway 并填写基础地址

在 `Connection` 页面选择 `Gateway`，然后填写：

```text
https://api.deepseek.com/anthropic
```

`Custom inference headers` 保持为空，不需要额外添加请求头。

<CourseFigure
  src={claudeGatewayConnectionFigure}
  alt="Claude Desktop 第三方推理配置的 Connection 页面，推理服务选择为 Gateway"
  caption="先选择 Gateway，再填写 DeepSeek 的 Anthropic 兼容基地址。"
/>

### 为什么地址停在 `/anthropic`

这里填写的是 **Base URL（基地址）**。Claude Desktop 会继续请求 `/v1/messages` 等路径，最终的消息接口类似：

```text
https://api.deepseek.com/anthropic/v1/messages
```

不要把 `/v1/messages` 一起写进 Base URL，否则客户端可能再次追加路径，得到一个不存在的地址。

### 步骤 6：选择 Static API key

在 `Credential kind` 下拉菜单中选择 `Static API key`。选择后，页面上方才会出现 `Gateway API key` 输入框和 `Gateway auth scheme`。

<CourseFigure
  src={claudeStaticApiKeyFigure}
  alt="Claude Desktop 第三方推理配置中 Credential kind 选择为 Static API key"
  caption="先选 Static API key，密钥输入框和鉴权方式才会出现。"
/>

### 步骤 7：创建 DeepSeek API Key

在浏览器打开 [DeepSeek API Key 管理页面](https://platform.deepseek.com/api_keys)，点击“创建 API key”，输入一个便于识别的名称，例如 `Claude-Desktop`，然后点击“创建”。

密钥创建后通常只会完整显示一次。点击“复制”，立即回到 Claude Desktop 粘贴到 `Gateway API key` 输入框。

名称只用于自己识别用途，不要填写姓名、学校或其他隐私。开始测试前设置合理的充值额度或用量提醒；任务结束后删除不再使用的 Key。

> [!WARNING]
> 不要把完整密钥截进教程图片。即使界面后来只显示圆点或部分字符，也要检查原始截图里是否曾出现完整 Key。

### 步骤 8：设置认证方式

回到 Claude Desktop，逐项确认：

| 配置项 | 应显示 |
| --- | --- |
| Gateway base URL | `https://api.deepseek.com/anthropic` |
| Gateway API key | 已粘贴，并保持隐藏 |
| Gateway auth scheme | `x-api-key` |
| Credential kind | `Static API key` |

<CourseFigure
  src={claudeGatewayCredentialsFigure}
  alt="Claude Desktop Gateway 凭据已经填写，API Key 用圆点隐藏，认证方式为 x-api-key"
  caption="本文使用 x-api-key；真实密钥必须始终保持隐藏。"
/>

### 为什么这里不是 Bearer

Claude Desktop 的 Gateway 表单同时支持 `Bearer` 和 `x-api-key`，具体选择取决于服务端要求。DeepSeek 当前的 Anthropic 兼容说明明确支持 `x-api-key` 请求头，因此本文按已经实际测试通过的桌面配置选择 `x-api-key`。

你可能在 Claude Code CLI 教程中看到 `ANTHROPIC_AUTH_TOKEN` 或 Bearer 配置，那是另一条接入路径，不要因此把桌面表单也改成 Bearer。

## 阶段三：配置模型并验证连接

### 步骤 9：配置 DeepSeek V4 Pro 模型路由

如果自动模型发现没有生成可用条目，在 `Model list` 中点击 `Add model`，手动添加一个 Claude 风格的路由名。DeepSeek 会在服务端把它映射为自己的模型。

推荐配置：

| 字段 | 设置 |
| --- | --- |
| Model ID | `claude-opus-4` |
| Display name | `DeepSeek V4 Pro` |
| Offer 1M-context variant | 首次配置建议关闭 |
| Tier alias | `opus` |
| Default for tier | 开启 |

其中 `claude-opus-4` 是 Claude Desktop 用来识别模型家族的路由名称，不是 DeepSeek 的真实模型 ID；`Display name` 只是界面里显示的标签。

<CourseFigure
  src={claudeTierAliasFigure}
  alt="Claude Desktop 模型配置中 Tier alias 下拉菜单选择 opus"
  caption="V4 Pro 路由选择 opus；不要在这个字段里填写 DeepSeek 模型名称。"
/>

<CourseFigure
  src={claudeDeepseekModelFigure}
  alt="Claude Desktop 中 DeepSeek V4 Pro 模型路由的完整设置"
  caption="Model ID 使用 claude-opus-4，显示名称可以写成 DeepSeek V4 Pro。"
/>

DeepSeek 当前的 Anthropic 兼容接口会进行下面的模型映射：

| Claude Desktop 发送的名称 | DeepSeek 实际模型 |
| --- | --- |
| 以 `claude-opus` 开头 | `deepseek-v4-pro` |
| 以 `claude-sonnet` 或 `claude-haiku` 开头 | `deepseek-v4-flash` |

如果还要添加 Flash，可以再创建一条：

```text
Model ID: claude-sonnet-4
Display name: DeepSeek V4 Flash
Tier alias: sonnet
Default for tier: 开启
```

> [!NOTE]
> DeepSeek 会把不支持的模型名称自动映射到 `deepseek-v4-flash`。没有出现模型错误，不代表后端一定使用了你预期的模型；最终应以官方映射和 DeepSeek 用量记录为准。

### 步骤 10：测试连接

检查配置后，点击右上方 `Test connection`。成功时，状态点会变绿，页面底部出现 `Inference` 完成信息。

<CourseFigure
  src={claudeTestConnectionFigure}
  alt="Claude Desktop 的 Test connection 显示绿色状态，并返回 Inference 完成信息"
  caption="绿色 Inference 结果说明地址、鉴权和最短推理请求已经通过。"
/>

测试成功只能证明最短推理请求已经通过，还不能证明图片、文档、MCP 和所有工具任务都能工作。

### 步骤 11：应用配置并重新启动

点击右下角 `Apply Changes`。出现 `Save & Restart` 确认窗口后，再点击 `Save & Restart`，让 Claude Desktop 保存配置并重新启动。

<CourseFigure
  src={claudeSaveRestartFigure}
  alt="Claude Desktop 保存第三方推理配置时出现 Save and Restart 确认窗口"
  caption="测试成功后再保存并重启，避免把未验证的配置直接应用。"
/>

### 步骤 12：确认 Gateway 已生效

重新启动后，页面应出现 `You’re using Gateway`，左下角显示 `Gateway`，模型选择器显示 `DeepSeek V4 Pro`。

<CourseFigure
  src={claudeGatewayActiveFigure}
  alt="Claude Desktop 显示 You’re using Gateway，并在模型选择器中显示 DeepSeek V4 Pro"
  caption="公开截图已经移除本地用户名，只保留 Gateway 状态和模型名称。"
/>

最后再做一次真实验证：

1. 新建一个简单任务并发送一条短消息；
2. 打开 DeepSeek 开放平台的用量记录；
3. 确认刚才的时间点出现了新的 API 调用。

不要只问模型“你是谁”。模型的自我描述可能受系统提示或训练内容影响，不能证明请求实际经过了哪个后端。

## DeepSeek 接入后的能力边界

连接成功不等于 Claude 的全部能力都能原样使用。DeepSeek 当前的 Anthropic 兼容接口支持普通文本、流式返回和常规工具调用，但仍有边界：

- 文本内容、`tool_use` 和 `tool_result` 可以使用；
- 图片和文档内容块暂不支持；
- `mcp_servers` 字段会被忽略；
- `mcp_tool_use`、`mcp_tool_result`、`container_upload` 等内容块暂不支持；
- 一些 Anthropic Beta 字段会被忽略；
- 客户端、本地权限和第三方接口共同决定一个工具任务能否真正完成。

因此，最稳妥的测试顺序是：

```text
最短文本请求
    ↓
练习文件夹中的只读任务
    ↓
允许修改一个可删除的测试文件
    ↓
逐项测试真正需要的工具和长任务
```

## 常见问题

| 现象 | 优先检查 |
| --- | --- |
| 没有 Gateway API key 输入框 | 先把 `Credential kind` 改为 `Static API key` |
| `Test connection` 返回 `401` | 检查 Key 是否完整、前后是否有空格，并确认使用 `x-api-key` |
| 返回 `402` 或提示余额不足 | Claude 订阅与 DeepSeek API 余额不互通，需要检查 DeepSeek 余额 |
| 返回 `404` | Base URL 可能错误地包含了 `/v1/messages`，或服务端没有对应路由 |
| Model ID 显示红色校验错误 | 使用 `claude-opus-4` 等 Claude 风格路由名，不要直接填 `deepseek-v4-pro` |
| `Apply Changes` 无法点击 | 查看页面底部的 `Connection needs`，补齐地址、Key 或模型字段 |
| 重启后没有进入 Gateway | 重新打开配置，确认测试成功，并执行 `Apply Changes → Save & Restart` |
| 返回 `429` | 停止连续重试，稍后再试，并检查调用限额 |

排查时一次只改一项，建议按照下面的顺序：

```text
Base URL → Credential kind → API Key → x-api-key → Model ID → Test connection
```

如果同时更换地址、Key、模型和鉴权方式，即使碰巧成功，也无法知道真正的问题在哪里。

## 连上之后，先别碰重要项目

第一次允许 Agent 读取或修改文件时，继续使用可以随时删除的练习文件夹：

- 先让 Agent 说明计划，再决定是否允许编辑；
- 只开放本次任务需要的目录；
- 查看每一处文件差异；
- 真实项目先提交 Git 或做好备份；
- 删除文件、安装软件、发布作品和发送消息等操作单独确认；
- 设置并检查 DeepSeek 的费用提醒和用量记录。

提示词里写“不要删除文件”，不能替代真正的权限限制、版本控制和人工检查。

## 检查理解

判断下面四句话是否正确：

1. Base URL 应填写到 `/v1/messages` 为止。
2. 本教程的桌面 Gateway 鉴权选择 `x-api-key`。
3. 模型选择器没有报错，就能证明后端一定使用了 V4 Pro。
4. 测试连接成功后，仍应从练习文件夹和低风险任务开始。

<AnswerReveal label="我判断好了，查看参考答案">

1. 错。Base URL 填到 `/anthropic`，后续路径由客户端追加。
2. 对。本文按 DeepSeek Anthropic 接口和实际桌面测试使用 `x-api-key`。
3. 错。不支持的模型名称可能回落到 V4 Flash，应查看官方映射和平台用量记录。
4. 对。`Test connection` 只验证最短推理请求，不代表全部工具和权限都安全可用。

</AnswerReveal>

## 最后记住这几件事

- 这篇教程配置的是 Claude Desktop，不是 Claude Code CLI。
- Base URL 填写 `https://api.deepseek.com/anthropic`，桌面 Gateway 路径使用 `Static API key` 和 `x-api-key`。
- `claude-opus-4` 是路由名称，会映射到 DeepSeek V4 Pro；实际调用以官方映射和用量记录为准。
- Test connection 成功后，还要执行 `Apply Changes → Save & Restart`。
- API Key、费用、文件权限和修改结果始终要由人检查，第一次文件任务只在练习目录中进行。

下一篇会转到 Windows 桌面版 Codex，比较另一套 API 配置和连接排查方法。

## 参考资料

- [Claude Desktop 官方下载](https://claude.com/download)——用于下载当前 Windows 安装程序。
- [Claude Desktop：In-app configuration](https://claude.com/docs/third-party/claude-desktop/in-app-configuration)——用于核对 Developer Mode、第三方推理窗口和本地应用流程。
- [Claude Desktop：LLM gateway](https://claude.com/docs/third-party/claude-desktop/gateway)——用于核对 Gateway、静态 API Key、鉴权方式、Messages、流式输出和模型发现要求。
- [Claude Code Desktop](https://code.claude.com/docs/en/desktop)——用于核对 Windows 下载、`Code` 标签页和 Git 要求。
- [DeepSeek：Using the Anthropic API](https://api-docs.deepseek.com/guides/anthropic_api)——用于核对 Base URL、`x-api-key`、模型映射和兼容能力。
- [DeepSeek：Integrate with Claude Code](https://api-docs.deepseek.com/quick_start/agent_integrations/claude_code)——用于核对 Claude Code / Claude Desktop 的模型映射。
- [DeepSeek API Key 管理](https://platform.deepseek.com/api_keys)——用于创建、轮换和删除 API Key。
- [DeepSeek Error Codes](https://api-docs.deepseek.com/quick_start/error_codes)——用于核对鉴权、余额、限流和服务端错误码。
