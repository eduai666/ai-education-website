# 复现运行证据目录

> 此目录只定义证据协议。当前没有子目录，表示还没有可供审计的版本化运行报告，不表示测试已通过。

## 1. Run ID 与目录命名

Run ID 固定为：

```text
<UTC-时间>-<源提交前 12 位>-<类型>
```

例如：

```text
20260731T081530Z-1a2b3c4d5e6f-g7a-clean
```

类型只使用：

- `g6-local`：实现者本地预检，不能代替独立复现；
- `g7a-clean`：第二位开发者在全新 clone 中的技术复现；
- `real-device`：真实手机或平板交互运行；
- `performance`：固定设备和网络条件下的版本化性能运行。

一个 Run ID 只对应一次运行。修复后重测必须创建新 Run ID，不覆盖原失败证据。

## 2. 每次运行的固定结构

```text
runs/<Run ID>/
├── repro-run.json
├── summary.md
├── commands/
│   ├── 01-environment.log
│   ├── 02-npm-ci.log
│   ├── 03-repro-check.log
│   ├── 04-test-data.log
│   ├── 05-typecheck.log
│   ├── 06-lint.log
│   ├── 07-build.log
│   └── 08-e2e.log
├── reports/
│   ├── playwright/
│   └── performance/
└── evidence/
    ├── request-domains.txt
    ├── device.json
    └── evidence-index.json
```

不适用的命令仍在 `repro-run.json` 中保留记录，状态写为 `not-applicable`，同时写明判定依据和批准角色。不创建空文件冒充证据。

## 3. `repro-run.json` 必填字段

```json
{
  "schemaVersion": "cell-repro-run.v1",
  "runId": "20260731T081530Z-1a2b3c4d5e6f-g7a-clean",
  "runType": "g7a-clean",
  "status": "failed",
  "source": {
    "repository": "<repository-url>",
    "commit": "<full-40-character-commit>",
    "detachedHead": true,
    "cleanBeforeInstall": true
  },
  "inputs": {
    "manifestPath": "docs/markdown/生物学习/00-可复现基线/repro-inputs-v1.json",
    "manifestSha256": "<sha256>",
    "verifiedFileCount": 0
  },
  "environment": {
    "operatingSystem": "<name-version-build>",
    "architecture": "<architecture>",
    "node": "v24.13.0",
    "npm": "11.6.2",
    "browser": "<name-and-full-version>",
    "playwright": "<exact-version>",
    "viewport": "<width>x<height>",
    "dpr": 1,
    "webglRenderer": "<renderer-or-not-collected>"
  },
  "commands": [
    {
      "id": "02-npm-ci",
      "command": "npm ci",
      "startedAt": "<ISO-8601>",
      "finishedAt": "<ISO-8601>",
      "exitCode": 1,
      "log": "commands/02-npm-ci.log"
    }
  ],
  "testCases": [
    {
      "id": "BUILD-001",
      "status": "failed",
      "evidence": ["commands/02-npm-ci.log"],
      "note": "<concise-observation>"
    }
  ],
  "operatorRole": "independent-developer",
  "createdAt": "<ISO-8601>"
}
```

`status` 只允许 `passed`、`failed`、`not-applicable` 或 `incomplete`。任一 P0/P1 失败或应有证据缺失时，整次运行不得标为 `passed`。

## 4. 独立复现的证据顺序

1. 从发布清单中取得仓库地址和完整源提交。
2. 在全新 clone 中 `git checkout --detach <release-commit>`。
3. 安装前保存 `git status --porcelain`、`git rev-parse HEAD`、操作系统、架构、Node 和 npm 输出。
4. 按 `cases.md` 中 `BUILD-001` 的顺序执行，每条命令单独保存日志和退出码。
5. 失败时立即保存原始证据，不改写日志；修复后使用新 Run ID 重新执行。
6. 最后核对 `evidence-index.json` 中的相对路径和 SHA-256，再将证据作为独立制品保存或在后续证据提交中追加。

运行报告不能属于它所声明的同一源提交，否则会形成 Git commit 自引用。报告可作为 CI 制品或后续证据提交保存，其 `source.commit` 始终指向被测的源提交。

## 5. 真实设备证据

`real-device` 和 `performance` 运行还必须保存：

- 完整设备型号、内存、操作系统构建号和浏览器完整版本；
- 设备被划为“低端测试机”的具体理由；
- 视口、DPR、GPU/WebGL renderer、网络、运营商和地点；
- 冷缓存与热缓存各至少 3 次的全部原始结果；
- 触屏连续录屏、帧时间数据、传输数据和降级证据。

Playwright 设备模拟、桌面浏览器响应式模式或鼠标模拟点击都不是真实触屏证据。在对应 Run ID 下出现完整证据前，`UI-001-REAL-TOUCH`、`UI-002-REAL-GESTURE` 和 `PERF-001-REAL-LOW-END` 一律保持“待人工执行”。

## 6. 不可覆盖与隐私

- 日志、fixture、HAR、视频、截图和结果文件只追加，不在原 Run ID 下替换；
- 需要订正说明时，新建文件并记录原因，保留原文件哈希；
- 只记录测试者角色或匿名编号，不保存儿童个人信息；
- 账号、Cookie、Authorization header、密钥和内网地址在存档前必须删除；
- 脱敏不得直接改写原日志；应保存受限制原件和可共享脱敏件的对应哈希与操作记录。
