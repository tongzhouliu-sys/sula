# OpenClaw 数字员工门户完整需求方案

> 文档版本：V1.1  
> 编制日期：2026-08-24  
> 文档状态：立项与详细设计基线  
> 产品代号：OpenClaw Digital Employee Portal  
> 产品形态：WorkEasy 风格的企业数字员工工作台、管理后台与 OpenClaw 治理控制面

---

## 1. 文档说明

### 1.1 文档目的

本文档用于统一产品、业务、技术、安全、测试和运维团队对 OpenClaw 数字员工门户的理解，作为以下工作的共同依据：

- 项目立项和范围审批；
- UI/UX 设计；
- 系统架构和数据模型设计；
- OpenClaw Gateway 集成；
- 研发任务拆分与排期；
- 安全评审、测试验收和试点上线；
- 后续微信、钉钉、邮箱、MCP、自动化和多 Gateway 扩展。

### 1.2 编制依据

本文档综合以下输入形成：

1. 现有 OpenClaw 数字员工门户 PRD V1.0；
2. 三轮 PRD 评审与复盘意见；
3. 已有 OpenClaw 环境和 6 个长期智能体的实际背景；
4. 历史讨论中已经确认的产品方向；
5. 截至 2026-08-24 的 OpenClaw 官方 Gateway、Client、Security、Multi-user、Skill、MCP 文档。

### 1.3 修订结论

V1.1 保留完整产品愿景，但将原来过大的“一期 P0”重构为：

```text
Gate 0：可行性与安全基线验证
    ↓
MVP-1：已有数字员工的安全使用闭环
    ↓
MVP-2：数字员工与 Skill 的受控运营闭环
    ↓
P1：连接、审批、自动化和企业能力扩展
    ↓
P2：多 Gateway Cell、多租户和平台化
```

本文将“一期工程”定义为 Gate 0、MVP-1 和 MVP-2 三个连续增量；其中 MVP-1 是首个生产试点版本。这样既保证一期包含用户管理、数字员工管理和 Skill 管理，又把原生 Agent 创建、受信 Skill 安装和可写连接等高风险能力放在一期的第二个受控增量中交付。

项目不修改或分叉 OpenClaw 原生 UI，不重写 OpenClaw Runtime。门户作为独立系统，通过服务端 Adapter 连接 Gateway。

---

## 2. 项目背景与现状

### 2.1 当前基础

- 已有一套正在运行的 OpenClaw 环境；
- 已完成一套智能体团队治理方案；
- 当前有 6 个长期智能体协同工作；
- 智能体角色、职责、协作、技能和治理逻辑已经基本形成；
- OpenClaw 已承担 Agent、Session、Skill、Tool、MCP、Channel、Cron 和运行状态等核心能力；
- 后续仍以 OpenClaw 为智能体运行底座，不迁移至其他 Agent 平台。

### 2.2 当前问题

OpenClaw 原生界面更接近技术控制台，面向普通企业用户时存在以下问题：

- 用户看到的是 Agent、Session、Tool、Skill 等技术概念，而不是“员工、岗位、能力、任务和成果”；
- 缺少企业用户、部门、角色、数据范围和用户—员工分配关系；
- 缺少面向业务管理员的数字员工目录、员工档案和发布流程；
- 缺少统一的 Skill、连接、审批、通知和成果运营界面；
- 多用户环境中，Agent 权限不足以自动解决 Session、Task、Artifact 的资源级隔离；
- 现有 Agent 和 Skill 虽可原生创建，但缺少发现、认领、发布、授权和审计流程。

### 2.3 项目定义

本项目不是换皮页面，也不是新的智能体框架，而是：

> 在保留 OpenClaw 运行能力和现有治理体系的前提下，新增一套面向企业用户的数字员工门户、业务管理后台、资源授权层和 Gateway 适配层。

---

## 3. 产品愿景、目标与成功标准

### 3.1 产品愿景

让企业用户像使用一个真实员工团队一样使用 OpenClaw：每个长期业务 Agent 被包装为有姓名、头像、岗位、职责、技能、权限、连接和工作记录的数字员工；用户可以拥有多个数字员工，并在统一工作台中与其对话、委派任务、提供资料、审批动作和接收成果。

### 3.2 核心目标

1. 提供 WorkEasy 风格、但具有独立视觉体系的数字员工工作台；
2. 支持多用户登录、用户管理、角色权限和数据范围；
3. 支持一个用户拥有多个数字员工、一个数字员工服务多个用户；
4. 自动发现现有及后续新增的 OpenClaw Agent 和 Skill；
5. 通过 OpenClaw 原生接口创建和管理 Agent、Workspace、Skill 和其他运行对象；
6. 保留并逐步映射微信、钉钉、邮箱、MCP、Plugin、Cron 等原生能力；
7. 对 Session、Task、Artifact、Approval 和 Connection 实施资源级授权；
8. 建立可审计、可回滚、可升级、可恢复的企业治理能力；
9. 保持当前 6 个 Agent 的职责、协作和运行逻辑不变；
10. 为后续多 Gateway Cell、跨部门和多租户部署预留能力。

### 3.3 非目标

- 不替换 OpenClaw Agent Runtime；
- 不重新实现 OpenClaw 的 Agent、Skill、Tool、MCP、Session、Cron、Channel 执行机制；
- 不把一次对话、Session、Run 或临时 sub-agent 作为数字员工；
- 不把门户 RBAC 或 OpenClaw 会话归属当作敌对用户之间的运行时隔离边界；
- 不允许浏览器直接持有 Gateway 管理凭证；
- 不在首期建设公开 SaaS 计费、订阅和开放市场；
- 不在首期同时完成所有渠道的全量可写配置；
- 不承诺展示模型原始思维链或未脱敏内部推理；
- 不允许无审计、无校验地直接编辑高风险 Workspace 文件或安装任意 Skill。

### 3.4 产品成功指标

试点阶段至少跟踪以下指标，具体阈值在 Gate 0 后由项目组确认：

| 指标 | 定义 | 建议试点目标 |
|---|---|---:|
| 用户激活率 | 已登录且完成首次任务的试点用户占比 | ≥ 80% |
| 周活跃率 | 每周至少完成一次有效交互的试点用户占比 | ≥ 60% |
| 任务完成率 | 被认定为成功交付结果的任务占全部终态任务比例 | ≥ 80% |
| 无人工介入完成率 | 未经管理员修复即可完成的任务比例 | ≥ 70% |
| 成果获取率 | 成功任务中用户打开或下载 Artifact 的比例 | 建立基线并持续提升 |
| 越权拦截正确率 | 自动化越权测试被正确拒绝的比例 | 100% |
| 同步新鲜度 | 原生对象变化进入门户的时间 | 事件路径 P95 ≤ 30 秒；校准路径按配置 |
| 恢复正确率 | 断线或重启后运行状态不重不漏 | 100% 通过演练 |
| 单位成功任务成本 | 模型与工具成本/成功任务数 | 建立基线并配置软护栏 |

---

## 4. 核心概念与对象关系

### 4.1 术语定义

| 术语 | 定义 |
|---|---|
| Portal User | 门户中的企业用户，是业务授权和审计的主要人员身份 |
| OpenClaw Agent | OpenClaw 中注册的长期智能体，拥有配置、Workspace、模型、工具和运行权限 |
| Digital Employee | 门户对一个长期业务 Agent 的一对一业务映射，加上门户员工档案与授权关系 |
| Agent Workspace | Agent 的工作目录及暴露的引导文件，如 `AGENTS.md`、`SOUL.md`、`IDENTITY.md`、`TOOLS.md` |
| Skill | OpenClaw 技能包，通常以 `SKILL.md` 描述用途、规则、依赖和执行方式 |
| Tool | Agent 可调用的运行工具，例如文件、浏览器、执行器和消息能力 |
| MCP | 被 OpenClaw 配置、发现并投射给 Agent 的 MCP Server 与工具集合 |
| Channel | 微信、钉钉等消息入口及其 Plugin/Connector |
| Connection | 对 Channel、邮箱、MCP、Plugin 或外部账号的门户统一业务抽象 |
| Session | 用户、渠道或 Agent 与数字员工之间的一段持续工作上下文 |
| Task | 一项可追踪的工作任务 |
| Run | 一次具体运行实例 |
| Artifact | Agent 产生的文档、表格、图片、报告或其他成果 |
| Approval | 高风险工具、插件动作或业务动作的审批请求 |
| Gateway Cell | 按信任域隔离的一套 Gateway、状态、Workspace、凭证和运行环境 |

### 4.2 必须澄清的概念关系

数字员工、Agent 和 Skill 不是同一对象：

```text
数字员工
  = 一个长期业务 OpenClaw Agent
  + 门户员工档案
  + 用户授权
  + Skill/Connection 分配
  + 生命周期和审计状态

Skill
  = 可被一个或多个 Agent 使用的能力包
  ≠ 数字员工

Session / 对话
  = 数字员工的一次工作上下文
  ≠ 数字员工
```

Agent 的人格、职责和工作规则可能由 Workspace 中的 Markdown 文件承载；Skill 的主要说明由 `SKILL.md` 承载。两者均可能包含 Markdown，但生命周期和权限模型不同。

### 4.3 关系模型

```text
一个用户 ──< 用户员工授权 >── 一个或多个数字员工

一个数字员工 ──1:1── 一个 OpenClaw 长期业务 Agent
一个数字员工 ──N:M── Skill
一个数字员工 ──N:M── Connection / MCP / Channel
一个数字员工 ──1:N── Session ──1:N── Task / Run / Artifact

一个 Agent 可以产生临时 sub-agent
临时 sub-agent 默认不进入数字员工目录
```

### 4.4 不自动映射为数字员工的对象

- 临时 sub-agent；
- 一次性执行 Agent；
- 审核器、路由器、安全守卫、监控器等治理节点；
- `kind=system` 的 Agent；
- 管理员显式隐藏或忽略的 Agent；
- 无法确认长期业务用途的未知 Agent。

---

## 5. 总体设计原则

### 5.1 原生优先

Agent、Workspace、Skill、Tool、MCP、Channel、Session、Task、Artifact 和 Cron 的原生运行状态以 OpenClaw 为准。门户通过 Gateway、官方 Client、官方 CLI 或受控 Driver 调用原生能力，不绕过原生校验和生命周期。

### 5.2 业务控制面与运行面分离

- OpenClaw：运行控制面；
- Portal：业务控制面和体验层；
- OpenClaw Control UI：技术运维面；
- 浏览器不得直连高权限 Gateway 管理面。

### 5.3 双权威来源

- OpenClaw 权威：Agent 原生配置、Workspace、Skill 安装状态、Tool/MCP/Channel、Session、Task、Artifact、Automation；
- Portal 权威：用户、组织、角色、业务员工档案、发布状态、用户—员工授权、资源 ACL、通知和门户审计。

### 5.4 动态发现但受控发布

门户必须发现新 Agent、Skill 和连接，但发现不等于向普通用户自动发布。所有未知对象默认进入待审核或隐藏状态。

### 5.5 默认拒绝与逐资源授权

未明确授权的员工、Session、Task、Artifact、Connection、Approval 和管理动作一律拒绝。资源标识不能作为授权凭证。

### 5.6 可恢复与可追溯

所有副作用请求必须可幂等；所有重要变更必须记录操作者、策略、Gateway 身份、执行结果和前后差异；事件断线后必须按权威历史恢复。

### 5.7 能力探测而非界面硬编码

门户根据 Gateway 版本、握手结果、方法和事件能力、插件状态及实际探测结果决定功能可用性。不支持的功能必须显示明确状态，不得静默失败。

---

## 6. 总体架构与系统边界

### 6.1 推荐架构

```text
企业用户浏览器
      │ HTTPS
      ▼
反向代理 / WAF / 企业访问控制
      │
      ├── Portal Web（工作台 + 管理后台）
      │
      ▼
Portal Backend / BFF
      ├── 认证与用户服务
      ├── RBAC / ABAC / Resource ACL
      ├── 数字员工目录服务
      ├── Skill 与连接治理服务
      ├── Session 投影与事件服务
      ├── 审批、通知与审计服务
      ├── Portal Database
      ├── Secret Provider
      └── OpenClaw Adapter
              │ 私有 WebSocket/RPC/CLI Driver
              ▼
        OpenClaw Gateway Cell
              ├── Agents / Workspaces
              ├── Skills / Tools / MCP
              ├── Sessions / Tasks / Artifacts
              ├── Cron / Heartbeat
              └── Channels / Plugins

OpenClaw Control UI：仅供技术管理员通过受控网络访问
```

### 6.2 Portal Backend 的职责

- 门户用户认证和会话管理；
- 用户—数字员工授权；
- Session、Task、Artifact、Approval 等资源级授权；
- Gateway 连接、配对、Scope 和能力快照管理；
- OpenClaw 请求验证、幂等、超时、重试和错误归一化；
- 事件订阅、断线补拉和会话状态投影；
- Agent、Skill、Connection 的发现、同步和差异处理；
- 高风险变更审批、版本、回滚和审计；
- 敏感数据脱敏和下载授权。

### 6.3 Portal 不承担的职责

- 模型推理和 Agent Loop；
- Tool、Skill、MCP 的实际执行；
- Channel 消息收发运行时；
- OpenClaw 原生 Session 和 Artifact 存储；
- Gateway 版本升级实现；
- 对 OpenClaw 主机级安全边界的替代。

---

## 7. 信任域、部署单元与多租户边界

### 7.1 一期信任域假设

一期仅面向同一企业、同一受控信任域中的用户。用户之间可以有业务数据权限差异，但不应被视为能够对运行主机实施敌对攻击的外部租户。

### 7.2 单 Gateway 使用条件

共享 Gateway 适用于以下条件同时成立的情况：

- 使用者属于同一受控信任域；
- 数字员工严格限定企业业务用途；
- Gateway 运行在专用机器、VM 或容器环境；
- 使用专用 OS 用户及专用浏览器/Profile/企业账号；
- 不混入个人 Apple、Google、密码管理器或个人浏览器身份；
- Agent 的工具、文件、连接和凭证范围经过审核。

不要求每个 Agent 默认单独一台机器；隔离单位根据租户、信任域、数据域和风险等级确定。

### 7.3 必须拆分 Gateway Cell 的情况

- 不同外部客户；
- 互不信任或存在敌对风险的部门/人员；
- 法规或合同要求数据、密钥、Workspace 物理隔离；
- 某 Agent 拥有明显超出其他人员授权范围的高敏凭证或主机权限；
- 无法通过单独 Agent、工具限制和数据域控制满足隔离要求。

每个 Cell 至少独立：Gateway 进程、状态目录、凭证、Workspace、OS 用户或主机边界。

### 7.4 门户多租户演进

P2 多租户采用“一个租户/信任域对应一个或多个 Gateway Cell”的管理模型，不在同一 Gateway 上仅增加 `tenant_id` 假装实现强隔离。

---

## 8. 用户、角色与权限模型

### 8.1 用户角色

| 角色 | 核心职责 |
|---|---|
| 超级管理员 | 管理 Gateway Cell、系统配置、用户、角色、员工、Skill、连接和审计 |
| 技术管理员 | 管理 OpenClaw 原生映射、运行健康、兼容性和高风险技术配置 |
| 业务管理员 | 管理用户分配、员工业务档案、发布、业务连接和运营数据 |
| 审批人 | 审批被策略路由给自己的高风险动作 |
| 普通用户 | 使用被授权的数字员工及属于自己的业务资源 |
| 只读审计员 | 查看授权、变更、运行和对账记录，不执行变更 |

### 8.2 权限维度

系统采用 RBAC + 资源 ACL + 条件策略组合：

1. 菜单和页面权限；
2. 操作权限；
3. 部门/组织数据范围；
4. 用户—数字员工授权；
5. 数字员工—Skill/Tool/MCP/Connection 授权；
6. 用户/数字员工—Connection 授权；
7. Session/Task/Artifact 资源 ACL；
8. Approval reviewer 权限；
9. 模型、数据密级和工具策略；
10. 时间、来源网络、风险等级等条件。

### 8.3 授权判定顺序

```text
验证门户登录身份
→ 验证账户和角色状态
→ 验证菜单/操作权限
→ 验证数字员工授权
→ 验证目标资源归属或共享 ACL
→ 验证 Connection/Skill/Tool/模型策略
→ 验证审批或二次确认要求
→ 执行 OpenClaw 调用
→ 写入审计结果
```

任一步失败均停止请求，不向前端泄露资源是否存在。

### 8.4 Portal 身份与 Gateway 身份

三类身份必须分开：

| 身份 | 用途 |
|---|---|
| Portal Principal | 真实业务用户，是门户授权和审计主体 |
| Gateway Service/Device Identity | Portal Backend 连接 Gateway 的机器身份 |
| Agent Actor | 执行任务或创建子会话的 Agent 身份 |

Portal 用户不强制一人对应一个 Gateway Device Token。系统必须通过 `trace_id`、`portal_principal_id`、`gateway_service_identity_id`、`agent_id` 和原生执行标识建立完整追踪链。

如目标 Gateway 已建立可用的用户 Profile 映射，可保存 `gateway_profile_id`；但该映射是可选增强，不能替代门户授权。

### 8.5 Gateway 权限域

逻辑上至少分为：

- 运行权限域：聊天、Session、Task、Artifact、事件和必要审批；
- 管理权限域：Agent、配置、Skill 安装、Secret、更新等管理员能力；
- 配对/设备权限域：仅设备配对流程使用。

物理使用一个或多个连接由 Adapter 技术设计决定，不写成产品硬约束；不同权限域必须使用最小 Scope、独立凭证策略和独立审计路径。

---

## 9. 产品信息架构

### 9.1 用户前台

```text
/work
├── 工作台
├── 数字员工
├── 对话与历史
├── 任务
├── 文件与成果
├── 技能与工具
├── 连接
├── 通知与审批
└── 个人中心
```

### 9.2 业务管理后台

```text
/admin
├── 管理概览
├── 用户与组织
├── 角色与权限
├── 数字员工管理
├── Skill 管理
├── 连接中心
│   ├── 微信/消息渠道
│   ├── 钉钉
│   ├── 邮箱
│   ├── MCP
│   └── Plugin
├── 会话与任务
├── 审批中心
├── 通知中心
├── 同步中心
├── 审计与对账
├── 模型与数据策略
└── 系统设置
```

### 9.3 技术运维入口

OpenClaw Control UI 继续保留，只允许技术管理员通过内网、VPN、零信任访问或安全反向代理进入。普通用户不得看到 Gateway 地址和凭证。

---

## 10. WorkEasy 风格前台工作台

### 10.1 设计目标

参考 WorkEasy 的“员工门户”交互标准，但不复制其品牌、素材或代码。设计风格应现代、清晰、轻量、企业化，避免原生技术控制台的配置感。

### 10.2 页面布局

```text
┌──────────────┬────────────────────────────────────┐
│ 员工与导航区 │ 顶部会话工具栏                     │
│              ├────────────────────────────────────┤
│ 当前员工卡片 │                                    │
│ 头像/岗位    │ 对话、计划、执行轨迹、结果          │
│ Skill/连接数 │                                    │
│              │                         运行详情抽屉 │
│ 员工切换     ├────────────────────────────────────┤
│ 文件/任务等  │ 输入框、附件、Skill、模型策略、发送 │
└──────────────┴────────────────────────────────────┘
```

### 10.3 员工卡片

| 编号 | 需求 | 阶段 |
|---|---|---|
| WORK-001 | 展示头像、姓名、岗位、员工编号和简介 | MVP-1 |
| WORK-002 | 展示在线、工作中、离线、异常等运行状态 | MVP-1 |
| WORK-003 | 展示有效 Skill、Tool、MCP、Connection 和自动化数量 | MVP-1 |
| WORK-004 | 支持在用户被授权的多个员工之间切换 | MVP-1 |
| WORK-005 | 员工切换后加载独立 Session、任务和文件范围 | MVP-1 |
| WORK-006 | 展示员工能力详情、使用说明和授权连接 | MVP-1 |
| WORK-007 | 支持收藏、最近使用和搜索员工 | MVP-2 |
| WORK-008 | 支持企业 Logo、主题色和员工头像配置 | MVP-2 |

### 10.4 对话交互

| 编号 | 需求 | 阶段 |
|---|---|---|
| CHAT-001 | 新建、切换、重命名、归档 Session | MVP-1 |
| CHAT-002 | 支持流式消息、Markdown、代码、表格、图片和附件 | MVP-1 |
| CHAT-003 | 支持图片和普通文件上传，并按握手策略校验大小 | MVP-1 |
| CHAT-004 | 支持停止当前运行和安全重试 | MVP-1 |
| CHAT-005 | 展示业务计划、当前阶段、Tool/Skill/MCP 调用摘要 | MVP-1 |
| CHAT-006 | 展示可解释执行轨迹，不展示原始思维链 | MVP-1 |
| CHAT-007 | 在权限允许时展示和处理会话内审批 | MVP-1 |
| CHAT-008 | 在能力可用时处理交互式问题 | MVP-1 |
| CHAT-009 | 支持复制、导出和会话搜索 | MVP-2 |
| CHAT-010 | 支持 `@` 选择当前员工允许使用的 Skill | MVP-2 |
| CHAT-011 | 在模型策略允许范围内切换模型或运行模式 | P1 |
| CHAT-012 | 展示 Token、上下文和可用的成本信息 | MVP-2 |

### 10.5 执行轨迹展示规则

允许展示：

- 用户可理解的任务计划；
- 当前阶段和进度；
- 工具名称、用途摘要、状态和耗时；
- 审批请求、失败原因、重试和最终结果；
- Artifact 来源和生成时间。

禁止直接展示：

- 模型原始思维链；
- 系统提示词；
- Secret、Token 和完整凭证；
- 未脱敏工具参数和返回值；
- 主机真实路径、内部网络地址及敏感调试信息。

### 10.6 文件与成果

| 编号 | 需求 | 阶段 |
|---|---|---|
| FILE-001 | 查看本人有权访问的上传文件和 Artifact | MVP-1 |
| FILE-002 | 按员工、Session、Task、日期和类型筛选 | MVP-1 |
| FILE-003 | 下载前执行用户—员工—资源三层授权 | MVP-1 |
| FILE-004 | 下载采用短期、范围受限的凭证或服务端流转 | MVP-1 |
| FILE-005 | 支持常见文件安全预览 | MVP-2 |
| FILE-006 | 展示版本、来源 Run、生成时间和保留期 | MVP-2 |
| FILE-007 | 支持病毒检测、MIME 检测和大小策略 | MVP-1 |

---

## 11. 用户与组织管理

| 编号 | 需求 | 阶段 |
|---|---|---|
| USER-001 | 创建、编辑、启用、禁用和删除门户用户 | MVP-1 |
| USER-002 | 重置密码、解除锁定和强制退出 | MVP-1 |
| USER-003 | 为用户分配角色、部门和数据范围 | MVP-1 |
| USER-004 | 为一个用户分配多个数字员工 | MVP-1 |
| USER-005 | 批量分配或取消数字员工 | MVP-2 |
| USER-006 | 查看用户的使用、会话、任务和审批记录 | MVP-2 |
| USER-007 | 限制用户可用模型、连接、Skill 和高风险动作 | MVP-2 |
| USER-008 | 支持用户导入导出 | P1 |
| USER-009 | 支持企业 SSO/OIDC；SAML 作为可选 Driver | P1 |
| USER-010 | 支持 MFA 和高风险操作二次验证 | P1 |

身份数据必须拆分保存：`password_hash`、`external_idp_subject`、`identity_provider_id` 均为独立可空字段，禁止复用一个字段表达多种身份。

---

## 12. 数字员工管理

### 12.1 发现与认领

| 编号 | 需求 | 阶段 |
|---|---|---|
| AGENT-001 | 发现 Gateway 可见的现有 Agent | MVP-1 |
| AGENT-002 | 首次接入时识别当前 6 个 Agent 并生成待确认清单 | Gate 0 |
| AGENT-003 | 根据 `kind`、来源、命名规则和人工覆盖区分业务/系统/临时 Agent | MVP-1 |
| AGENT-004 | 新 Agent 默认进入“待审核”，不得直接向普通用户发布 | MVP-1 |
| AGENT-005 | 支持认领、忽略、隐藏、重新同步和差异查看 | MVP-1 |
| AGENT-006 | 原生 Agent 消失后标记“失联”，保留历史关联 | MVP-1 |

首次迁移时不建议无条件自动激活全部 6 个 Agent。管理员应逐个确认：员工类型、岗位、负责人、用户范围、Skill、连接和风险等级；确认后可批量发布。

### 12.2 业务档案

门户员工档案包括：

- 展示名称、头像、员工编号；
- 岗位、部门、职责、服务说明；
- 业务负责人和技术负责人；
- 允许服务的用户/部门；
- Skill、Tool、MCP、Connection 清单；
- 模型策略和数据等级；
- 发布、停用、归档状态；
- 最近运行、健康和成本摘要；
- 风险等级和审批策略。

### 12.3 原生创建与受控配置

| 编号 | 需求 | 阶段 |
|---|---|---|
| AGENT-010 | 通过原生 Agent 管理接口创建 Agent | MVP-2 |
| AGENT-011 | 通过原生接口修改、删除 Agent，并执行影响检查 | MVP-2 |
| AGENT-012 | 通过暴露的 Agent 文件接口管理引导文件 | MVP-2 |
| AGENT-013 | 使用模板创建身份、职责和协作规则 | MVP-2 |
| AGENT-014 | Workspace 变更必须提供差异预览、校验、版本和回滚 | MVP-2 |
| AGENT-015 | 高风险文件或工具策略变更需要审批 | MVP-2 |
| AGENT-016 | 配置模型、工具、沙箱、Skill 和 Agent-to-Agent 权限 | P1 |
| AGENT-017 | 支持克隆员工模板，但创建新的原生 Agent 身份 | P1 |

不得将 Workspace 当成任意文件管理器。普通管理员仅能编辑允许清单中的引导文件和结构化策略；完整 Workspace 浏览为受信技术管理员的只读能力。

### 12.4 发布、停用与离职

| 编号 | 需求 | 阶段 |
|---|---|---|
| AGENT-020 | 发布、隐藏、暂停、恢复和归档数字员工 | MVP-1 |
| AGENT-021 | 将员工分配给多个用户或部门 | MVP-1 |
| AGENT-022 | 为员工分配 Skill 和 Connection | MVP-1 |
| AGENT-023 | 停用前检查运行中任务、Cron、待审批和未交付 Artifact | MVP-2 |
| AGENT-024 | 支持转移会话责任人、取消任务、交接成果和撤销凭证 | MVP-2 |
| AGENT-025 | 原生删除必须二次确认，并优先采用门户归档而非物理删除 | MVP-2 |

---

## 13. Skill 管理与供应链治理

### 13.1 一期能力边界

一期必须具备 Skill 管理，但管理深度分层：

- MVP-1：发现、查看状态、风险标识、员工分配、启用/停用请求；
- MVP-2：受信来源搜索、安装、更新和版本回滚；
- P1：私有上传、模板化创建、在线编辑和审批发布；
- P2：企业 Skill 市场和跨 Cell 分发。

### 13.2 功能需求

| 编号 | 需求 | 阶段 |
|---|---|---|
| SKILL-001 | 获取指定 Agent 可见的 Skill、eligibility 和缺失依赖 | MVP-1 |
| SKILL-002 | 监听 Skill 变化并执行定向刷新 | MVP-1 |
| SKILL-003 | 解析名称、描述、版本、来源、元数据、依赖和风险标签 | MVP-1 |
| SKILL-004 | 区分可用、缺依赖、禁用、被策略阻止、失联等状态 | MVP-1 |
| SKILL-005 | 将 Skill 分配给一个或多个数字员工 | MVP-1 |
| SKILL-006 | 展示使用该 Skill 的员工和最近调用摘要 | MVP-2 |
| SKILL-010 | 从管理员认可的受信来源搜索和安装 | MVP-2 |
| SKILL-011 | 安装前展示来源、版本、完整性、依赖和安全检查 | MVP-2 |
| SKILL-012 | 更新前执行本地改动检测，支持强制更新审批 | MVP-2 |
| SKILL-013 | 支持启用、停用、更新失败回滚和紧急下线 | MVP-2 |
| SKILL-020 | 支持上传包含根目录 `SKILL.md` 的私有归档 | P1 |
| SKILL-021 | 私有上传仅在 Gateway 显式开启相应能力后可用 | P1 |
| SKILL-022 | 支持模板化创建与在线编辑 | P1 |
| SKILL-023 | 在线编辑必须进入差异、扫描、审批和发布流程 | P1 |

### 13.3 供应链要求

Skill 安装必须记录：

- 来源、发布者、版本和下载地址；
- 内容 Hash、签名或信任信封；
- 依赖安装器和将执行的命令；
- 所需 Tool、网络、文件和 Secret 权限；
- 扫描结果、审批人和安装操作者；
- 安装前后版本、目标 Agent 和回滚点。

Skill allowlist 只表示可见或可选范围，不等价于主机 Shell 安全边界。若 Agent 拥有执行器、浏览器或网络工具，必须同时应用沙箱、OS 隔离、工具策略和审批。

---

## 14. 连接中心

### 14.1 产品模型

门户将微信、钉钉、邮箱、MCP 和 Plugin 统一呈现为 Connection，但底层使用独立 Driver。统一的是库存、授权、状态、审计和入口，不强行统一不同连接的凭证和生命周期。

### 14.2 通用能力

| 编号 | 需求 | 阶段 |
|---|---|---|
| CONN-001 | 发现已配置 Plugin、Channel、MCP 和可识别邮箱能力 | MVP-1 |
| CONN-002 | 展示类型、Provider、账号、归属、健康、版本和最近检查时间 | MVP-1 |
| CONN-003 | 支持企业共享、员工专属和用户个人三类归属 | MVP-1 |
| CONN-004 | 将连接授权给用户、员工或部门 | MVP-1 |
| CONN-005 | 凭证只保存为 SecretRef 或受控加密值，不回显明文 | MVP-1 |
| CONN-006 | 支持测试、停用、重新授权和删除 | MVP-2 |
| CONN-007 | 所有授权、凭证和路由变更写入审计 | MVP-1 |
| CONN-008 | 驱动不支持写入时显示“仅发现/只读纳管” | MVP-1 |

### 14.3 微信

- 识别实际安装的微信 Channel/Plugin 及其版本；
- 展示登录、在线、异常、路由和能力限制；
- 保持现有微信连接在门户部署后继续原生运行；
- 扫码登录、安装、升级和路由修改由专属 Driver 实现；
- 群聊、私聊、文件、主动发送能力以实际插件能力探测为准；
- 渠道 sender identity 不自动等同于门户用户，需身份映射或会话认领。

### 14.4 钉钉

- 识别企业认可的钉钉 Connector/Plugin；
- 展示应用、机器人、账号、私聊/群聊能力和路由；
- 支持凭证授权、健康检测和 Agent 绑定；
- 文档、日程、待办等扩展能力按插件能力单独显示；
- 所有主动发送和高风险业务动作受策略和审批控制。

### 14.5 邮箱

邮箱可以通过 Skill、MCP、Plugin、Gmail Hook 或 IMAP/SMTP/API Driver 实现。门户统一展示：

- 邮箱 Provider 和账号类型；
- 个人邮箱或共享业务邮箱；
- OAuth/SecretRef 状态；
- 收件、检索、发送、附件和线程能力；
- 外发策略、审批、保留和敏感数据规则；
- 失败重试、退信和发送审计。

不受信任邮件默认先进入受限 Reader Agent 或只读处理链路，不直接赋予高权限业务 Agent 完整工具能力。

### 14.6 MCP

MCP Driver 目标能力包括：

- list/show/status/doctor/probe；
- stdio、SSE、Streamable HTTP 传输；
- add/set/configure/unset；
- OAuth 登录、退出、重新授权；
- 工具 include/exclude 过滤；
- 超时、TLS、并行调用提示和健康探测；
- 共享 OAuth 与 per-requester OAuth 状态；
- SecretRef、Header 和环境变量的脱敏展示。

### 14.7 分期策略

| 阶段 | 连接范围 |
|---|---|
| MVP-1 | 四类连接全部保留；发现、状态、授权库存和健康展示 |
| MVP-2 | 选择一种企业当前最成熟的连接做完整可写闭环，默认建议优先 MCP |
| P1 | 依次完成微信、钉钉、邮箱的专属可写 Driver |
| P2 | 连接市场、跨 Gateway 分发和租户级策略 |

该分期不会删除任何原生能力；未被门户写入式纳管的连接仍由 OpenClaw 原生方式配置和运行。

---

## 15. Session、Task、Artifact 与资源授权

### 15.1 Session 归属状态机

门户必须为每个可见 Session 建立显式业务归属：

```text
portal_owned       门户用户创建并可证明归属
channel_mapped     渠道身份已映射到门户用户
admin_assigned     管理员分配给某用户或部门
shared_approved    经审批允许多人共享
agent_owned        Agent/自动化产生，按策略归属负责人
unattributed_hidden 无法证明归属，普通用户默认隐藏
```

OpenClaw 的 creator、owner、participants 用于来源和协作参考，不能单独作为门户安全授权依据。participants 为历史信息，不能作为持久 ACL。

### 15.2 Session 权限规则

- Portal 创建 Session 时同步写入门户用户、数字员工和业务来源；
- 用户只能查看自己拥有或经共享 ACL 授权的 Session；
- 共享同一数字员工不代表共享该员工的全部 Session；
- 渠道、Cron、Agent spawn 和其他客户端产生的 Session 无法映射时默认隐藏；
- 管理员认领、分配或共享必须记录理由和审计；
- Session owner 的原生重新分配只改变责任展示，不自动改变门户 ACL。

### 15.3 Task

| 编号 | 需求 | 阶段 |
|---|---|---|
| TASK-001 | 展示排队、运行、成功、失败、取消、超时状态 | MVP-1 |
| TASK-002 | 展示 Agent、Session、Run、父子任务和进度摘要 | MVP-1 |
| TASK-003 | 用户可取消自己有权访问且策略允许的任务 | MVP-1 |
| TASK-004 | 支持失败重试、人工接管和责任人分配 | MVP-2 |
| TASK-005 | 展示 Cron、Heartbeat 和自动化运行记录 | MVP-2 |
| TASK-006 | 创建、暂停、恢复、手动触发和删除自动化 | P1 |

### 15.4 Artifact

- Artifact 必须关联 Session、Run 或 Task 中至少一种可证明来源；
- 门户先执行资源授权，再调用原生下载能力；
- 不向前端返回主机真实路径或长期通用下载 Token；
- 对大文件优先采用“授权后签发短期下载凭证/对象存储直传”；
- 记录下载人、资源、时间、IP、结果和 Trace；
- 支持保留期、过期、删除、法务保留和敏感等级策略。

---

## 16. 审批、通知与人工接管

### 16.1 审批

| 编号 | 需求 | 阶段 |
|---|---|---|
| APR-001 | 在 Session 中展示属于该会话的待审批请求 | MVP-1 |
| APR-002 | 仅被策略指定的审批人可批准或拒绝 | MVP-1 |
| APR-003 | 展示动作摘要、风险、目标、发起人、员工和过期时间 | MVP-1 |
| APR-004 | 审批处理必须执行门户层 RBAC 和资源校验 | MVP-1 |
| APR-005 | 记录 Gateway 原生结果和门户审计链 | MVP-1 |
| APR-006 | 提供跨会话审批中心、转交、升级和委托 | P1 |
| APR-007 | 支持邮件外发、消息主动发送和高风险配置的业务审批 | P1 |

运行连接可以按实际功能请求 read、write、approvals 及交互问题所需 Scope；是否拆分物理连接由 Adapter 决定。审批“可见”和“可处理”必须在门户层分别授权。

### 16.2 站内通知最小闭环

MVP-1 必须支持：

- 审批到达；
- 任务成功、失败或超时；
- Artifact 已生成；
- Agent、Gateway、Skill 或 Connection 异常；
- 用户权限或员工授权变更。

通知包含未读状态、优先级、目标链接、资源授权复核和过期时间。P1 再增加邮件、钉钉、微信等外部通知 Driver，以及静默时段、升级策略和模板管理。

### 16.3 人工接管

任务或员工异常时，授权用户可以：

- 查看安全化的失败原因；
- 停止或重试；
- 转交其他员工；
- 请求管理员协助；
- 对进行中 Session 重新分配责任人；
- 对未完成成果进行交接。

---

## 17. 管理概览、同步中心与审计

### 17.1 管理概览

展示：

- 用户、数字员工、Skill、Connection、Session 和任务数量；
- 员工在线、工作中、空闲、失联和异常状态；
- Gateway、MCP、Channel 和插件健康；
- 待审批、失败任务、同步冲突和未归属 Session；
- Token、调用量和成本摘要（目标 Gateway 支持时）；
- 最近管理员操作和安全告警。

### 17.2 同步中心

管理员可以：

- 查看 Agent、Skill、Connection、Session 投影的同步状态；
- 手动同步全部或单个资源；
- 查看差异、错误分类、重试次数和下一步建议；
- 处理失联、冲突、未知类型和权限不足；
- 查看 Gateway 协议版本、Feature Snapshot 和最后成功 Cursor；
- 导出诊断包，但诊断包必须脱敏。

### 17.3 审计与对账

门户审计至少记录：

- Portal 用户和角色；
- Gateway 服务身份；
- 动作、资源、请求参数摘要；
- 策略判定、审批结果；
- 原生方法、执行结果和结构化错误；
- 修改前后差异；
- Trace ID、Run ID、Task ID 和时间；
- 来源 IP、User Agent 和风险标记。

门户审计应与 Gateway 原生活动账本进行对账，但不能把 Gateway 的有限期、best-effort 审计记录当作企业合规档案的唯一来源。

---

## 18. 自动发现、同步与投影机制

### 18.1 同步触发

1. Portal Backend 启动；
2. Gateway 首次连接或重新连接；
3. Agent、Skill、Session、配置等原生事件；
4. 门户完成原生写操作后的定向重拉；
5. 管理员手动同步；
6. 定时一致性校准；
7. 版本升级或 Feature Snapshot 变化。

### 18.2 Agent 同步

- 唯一键：`gateway_instance_id + openclaw_agent_id`；
- 新对象进入 `discovered/pending_review`；
- `kind=system` 默认不进入普通员工选择器；
- 旧 Gateway 缺少类型字段时，使用来源、命名规则和人工覆盖；
- OpenClaw 原生字段冲突时以 OpenClaw 为准；
- 门户业务档案和发布字段不被原生同步覆盖；
- 原生删除仅将门户映射标记为失联或已删除，不清除历史审计。

### 18.3 Skill 同步

- 唯一键至少包含 Gateway、Skill key 和来源范围；
- 保存内容 Hash、版本、eligibility 和缺失依赖；
- 外部新增自动发现，外部删除标记不可用；
- 分配变更通过受控原生写入完成，并定向重拉确认；
- 不通过文件扫描结果臆测“已启用”，以原生有效状态为准。

### 18.4 会话投影引擎

Portal Backend 必须维护服务端会话投影，而不是把 Gateway 事件简单透传给前端：

```text
连接/重连
→ 重新订阅 Session 列表和选中 Session 消息
→ 拉取权威 chat.history
→ 全量替换对应本地消息投影
→ 接纳 inFlightRun
→ 按 snapshot/delta 语义处理 activeRunIds
→ 按 runId + seq 去重
→ 发现序列缺口时重新拉取权威历史
→ 持久化 Cursor 和状态版本
```

具体要求：

- 每个 Session 保存最后成功的历史 Cursor；
- Cursor 失效或收到 reset 时执行正常尾部重建；
- 不把省略字段误当成空数组；
- 多实例部署时，一个订阅分区只有一个活动 Projector Owner；
- 使用租约、Checkpoint 和幂等 Upsert 保证故障切换；
- 不因 Portal 重启重复提交用户消息或 Run；
- 前端缓存不能成为权威运行状态。

### 18.5 写操作补偿

门户写入 OpenClaw 采用：

```text
生成 idempotency_key
→ 写入本地 operation 记录
→ 调用 Gateway
→ 定向重拉确认原生状态
→ 更新门户映射
→ 成功关闭 operation
```

如果原生写成功而门户落库失败，恢复任务根据 idempotency key 和原生对象重新认领，避免产生不可见孤儿对象。并发编辑采用 revision/hash 或乐观锁。

---

## 19. OpenClaw Adapter 能力契约

### 19.1 技术原则

- 优先使用官方 `@openclaw/gateway-client` 和 `@openclaw/gateway-protocol`；
- Gateway Client 包与 OpenClaw 版本一起锁定和升级；
- 当前协议版本作为连接配置和能力快照记录，不散落硬编码在业务代码；
- 所有请求进行 Schema 校验；
- 副作用方法携带幂等键；
- 按结构化错误码处理权限、重试和降级；
- 从握手读取协议、方法、事件、策略和附件限制；
- 方法发现列表并非所有可调用方法的完整枚举，Adapter 需结合版本契约、广告能力和受控探测；
- 插件、Channel 和 MCP 差异通过 Driver 层隔离。

### 19.2 当前能力映射基线

下表用于 Gate 0 验证，不构成对所有历史或未来 Gateway 版本的无条件承诺。

| 门户域 | 当前原生能力基线 | 门户处理 |
|---|---|---|
| Agent | `agents.list/create/update/delete` | 发现、原生创建、变更和影响检查 |
| Agent 文件 | `agents.files.list/get/set` | 仅管理暴露的引导文件；受控变更 |
| Workspace | `agents.workspace.list/get` | 受信管理员只读浏览，不提供任意写入 |
| Session | `sessions.list/create/describe/subscribe`、消息订阅 | 建立资源 ACL 和服务端投影 |
| Chat | `chat.history/send/abort` 等 | 流式转发、Cursor、恢复和安全渲染 |
| Task | `tasks.list/get/cancel` | 状态、进度、取消和授权 |
| Artifact | `artifacts.list/get/download` | 按 Session/Run/Task 授权下载 |
| Tool | `tools.catalog/effective/invoke` | 展示目录、有效能力和策略化调用 |
| Skill | `skills.status/search/detail/install/update/upload.*` | 能力探测、供应链治理和分期开放 |
| Approval | `approval.history/get/resolve`、相关事件 | 会话审批和审批中心 |
| Usage | `usage.status/cost`、`sessions.usage*`、`models.list` | 成本与软护栏，能力可用时启用 |
| Audit | `audit.activity.list`、`audit.run.inspect` | 与门户审计对账，不作唯一合规存档 |
| Secret | `secrets.*`、SecretRef | 管理端调用，前端永不回显 Secret |
| Channel | `channels.status`、插件方法和配置 Driver | 发现、状态和按插件实现可写能力 |
| Cron | `cron.*` | 首期只读/运行记录，后续开放编辑 |
| MCP | 原生 MCP CLI/配置/OAuth/诊断能力 | 专属 Driver 管理和健康探测 |

### 19.3 Client Scope 与 Capability

交互式聊天客户端通常需要运行所需的 read/write Scope；如展示和处理审批，再请求 approvals；如处理交互问题，仅在目标版本明确支持时增加对应 Scope。管理操作只在管理员路径临时或独立使用 admin 权限。

实时工具事件、审批、内联组件等能力只有在 Portal 实际实现时才在握手中声明，禁止虚报 Client Capability。

### 19.4 协议兼容与升级

截至本文编制时，通用 Operator/WebChat 客户端按当前 Gateway wire version 精确协商。系统必须：

- 保存当前 Gateway 版本、wire version 和 Feature Snapshot；
- 维护 Portal—Gateway 兼容矩阵；
- 锁定生产 OpenClaw 版本；
- 先发布兼容 Portal，再升级 Gateway；
- 升级前执行自动契约测试和预发演练；
- 不兼容时阻断升级或进入明确只读/离线状态；
- 禁止在生产环境“盲升” Gateway。

这是一套受控联合升级流程，不要求被动依赖“同日紧急发版”。

---

## 20. 数据权威与字段所有权

### 20.1 实体级权威

| 数据域 | 权威来源 | 门户职责 |
|---|---|---|
| Agent 原生配置 | OpenClaw | 调用入口、镜像索引、差异和审计 |
| Workspace 引导文件 | OpenClaw Workspace | 受控编辑、版本、审批和回滚 |
| Skill 内容与安装状态 | OpenClaw | 同步元数据、供应链和业务分配 |
| Tool/MCP/Channel/Cron | OpenClaw | Driver 管理、展示和授权投影 |
| Session/Task/Artifact | OpenClaw | 服务端投影、资源 ACL 和业务索引 |
| 用户、角色、组织 | Portal | 完整权威 |
| 员工业务档案 | Portal | 完整权威 |
| 用户—员工授权 | Portal | 完整权威 |
| Session 业务 ACL | Portal | 完整权威 |
| 通知、审批业务策略 | Portal | Portal 权威；原生执行结果回写 |
| Portal 合规审计 | Portal | 完整权威 |

### 20.2 字段级规则

每个可编辑字段必须定义：

- 权威系统；
- 读取接口；
- 写入接口；
- 所需权限；
- 校验规则；
- revision/hash；
- 冲突处理；
- 审批和审计要求；
- 回滚方式。

例如，员工展示名称可以由 Portal 权威；Agent 原生模型配置由 OpenClaw 权威；Portal 页面可以提供编辑入口，但最终写入原生配置并定向重拉确认。

---

## 21. 状态机

### 21.1 数字员工状态

避免多个无约束状态字段组合。采用三个正交维度并明确规则：

| 维度 | 状态 |
|---|---|
| 发现状态 | `discovered`、`reviewed`、`ignored` |
| 发布状态 | `draft`、`published`、`hidden`、`archived` |
| 运行状态 | `online`、`busy`、`offline`、`degraded`、`missing` |

规则：

- 只有 `reviewed + published` 才能被普通用户看到；
- `ignored` 不能发布；
- `missing` 时自动禁止新 Session，但保留历史；
- `archived` 只读保留，不允许新任务；
- `busy`、`offline` 属运行状态，不改变员工业务发布状态。

### 21.2 Skill 状态

```text
discovered
→ eligible / ineligible / missing_dependency / policy_blocked
→ assigned / unassigned
→ enabled / disabled
→ updating / update_failed / unavailable
```

### 21.3 Connection 状态

```text
discovered → configured → healthy
                       ↘ authorization_required
                       ↘ degraded
                       ↘ offline
                       ↘ revoked
                       ↘ removed
```

### 21.4 同步状态

```text
pending → running → succeeded
                  ↘ retryable_failed → retrying
                  ↘ conflict → manual_resolution
                  ↘ unsupported
                  ↘ permission_denied
```

---

## 22. 核心数据模型

以下为逻辑模型，物理表结构在详细设计阶段确定。

### 22.1 身份与权限

#### users

- `id`
- `username`
- `display_name`
- `email`
- `password_hash`（可空）
- `external_idp_subject`（可空）
- `identity_provider_id`（可空）
- `department_id`
- `status`
- `last_login_at`
- `created_at` / `updated_at`

#### roles / permissions / user_roles / role_permissions

保存角色、权限和用户关系；权限使用稳定代码，不依赖前端路由名称。

#### gateway_service_identities

- `id`
- `gateway_instance_id`
- `purpose`：runtime/admin/pairing
- `device_id`
- `credential_ref`
- `approved_scopes`
- `status`
- `last_connected_at`

#### portal_gateway_identity_links

- `portal_user_id`
- `gateway_profile_id`（可空）
- `channel_identity_id`（可空）
- `link_type`
- `verification_status`
- `verified_by` / `verified_at`

### 22.2 Gateway 与员工

#### gateway_instances

- `id`
- `name`
- `trust_domain_id`
- `private_url`
- `server_version`
- `wire_protocol_version`
- `feature_snapshot_json`
- `policy_snapshot_json`
- `compatibility_status`
- `health_status`
- `last_connected_at`

#### digital_employees

- `id`
- `gateway_instance_id`
- `openclaw_agent_id`
- `display_name`
- `employee_no`
- `job_title`
- `department_id`
- `description`
- `avatar_ref`
- `business_owner_user_id`
- `technical_owner_user_id`
- `discovery_status`
- `publication_status`
- `runtime_status`
- `agent_kind`
- `risk_level`
- `native_revision_hash`
- `last_synced_at`
- `created_at` / `updated_at`

唯一键：`gateway_instance_id + openclaw_agent_id`。

#### user_employee_grants

- `user_id`
- `digital_employee_id`
- `grant_type`
- `data_scope_json`
- `granted_by`
- `starts_at` / `expires_at`
- `status`

### 22.3 Skill 与 Connection

#### skills

- `id`
- `gateway_instance_id`
- `native_skill_key`
- `source_type`
- `source_locator`
- `version`
- `description`
- `metadata_json`
- `eligibility_status`
- `risk_level`
- `content_hash`
- `trust_envelope_json`
- `sync_status`
- `last_synced_at`

#### employee_skill_bindings

- `digital_employee_id`
- `skill_id`
- `enabled`
- `policy_json`
- `configured_by`
- `native_revision_hash`

#### connections

- `id`
- `gateway_instance_id`
- `type`：channel/email/mcp/plugin
- `provider`
- `native_id`
- `display_name`
- `owner_type`：enterprise/user/employee
- `owner_id`
- `status`
- `secret_ref`
- `capabilities_json`
- `metadata_json`
- `last_checked_at`

#### connection_grants

- `connection_id`
- `subject_type`：user/employee/department
- `subject_id`
- `permission_scope_json`
- `starts_at` / `expires_at`
- `created_by`

### 22.4 会话与运行投影

#### session_projections

- `id`
- `gateway_instance_id`
- `native_session_key_ciphertext` 或安全引用
- `session_key_hash`
- `digital_employee_id`
- `title`
- `summary`
- `created_actor_type` / `created_actor_id`
- `native_owner_type` / `native_owner_id`
- `portal_owner_user_id`
- `ownership_status`
- `visibility_status`
- `has_active_run`
- `active_run_ids_json`
- `delta_cursor`
- `last_state_version`
- `last_message_at`
- `last_synced_at`

只保存 Hash 无法支持 Gateway 回源，因此原生 SessionKey 必须以受控加密值、安全引用或等价方式保存；列表展示字段使用门户投影，避免每次渲染全量回源。

#### session_acl

- `session_projection_id`
- `subject_type`
- `subject_id`
- `permission`
- `granted_by`
- `reason`
- `expires_at`

#### task_projections / artifact_index / approvals

保存原生 ID、所属 Session/Run/Task、Portal 资源关系、状态、摘要和授权索引，不复制不必要的原始敏感内容。

### 22.5 运营与治理

#### operations / sync_records

- `resource_type`
- `native_id`
- `operation_type`
- `idempotency_key`
- `portal_revision`
- `native_revision_hash`
- `gateway_protocol_version`
- `feature_snapshot_id`
- `event_cursor`
- `retry_class`
- `status`
- `diff_summary`
- `error_code` / `error_details_json`
- `started_at` / `completed_at`

#### change_requests

保存 Workspace、Agent、Skill、Connection 等高风险变更的模板、差异、审批、发布和回滚信息。

#### notifications

保存接收人、类型、优先级、目标资源、已读、过期和投递状态。

#### audit_logs

保存 Portal Principal、Gateway Identity、动作、资源、策略、审批、前后差异、结果、Trace 和来源信息。

---

## 23. 门户 API 设计范围

以下为门户业务 API，不等同于 OpenClaw 原生方法。

### 23.1 认证与用户

```text
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/me
GET    /api/admin/users
POST   /api/admin/users
PATCH  /api/admin/users/{id}
POST   /api/admin/users/{id}/disable
PUT    /api/admin/users/{id}/employees
```

### 23.2 数字员工

```text
GET    /api/employees
GET    /api/employees/{id}
GET    /api/admin/employees/discovered
POST   /api/admin/employees/{id}/review
POST   /api/admin/employees/{id}/publish
POST   /api/admin/employees/{id}/archive
POST   /api/admin/employees
PATCH  /api/admin/employees/{id}
PUT    /api/admin/employees/{id}/users
PUT    /api/admin/employees/{id}/skills
PUT    /api/admin/employees/{id}/connections
POST   /api/admin/employees/{id}/changes
POST   /api/admin/employees/sync
```

### 23.3 Skill 与 Connection

```text
GET    /api/admin/skills
GET    /api/admin/skills/{id}
POST   /api/admin/skills/{id}/assign
POST   /api/admin/skills/install
POST   /api/admin/skills/update
POST   /api/admin/skills/upload
POST   /api/admin/skills/sync

GET    /api/admin/connections
GET    /api/admin/connections/{id}
POST   /api/admin/connections/{type}
POST   /api/admin/connections/{id}/authorize
POST   /api/admin/connections/{id}/test
PUT    /api/admin/connections/{id}/grants
DELETE /api/admin/connections/{id}
```

### 23.4 Session、任务、Artifact 与审批

```text
GET    /api/employees/{id}/sessions
POST   /api/employees/{id}/sessions
GET    /api/sessions/{id}/messages
POST   /api/sessions/{id}/messages
POST   /api/sessions/{id}/abort
POST   /api/sessions/{id}/share
POST   /api/sessions/{id}/claim

GET    /api/tasks
POST   /api/tasks/{id}/cancel
GET    /api/artifacts/{id}
POST   /api/artifacts/{id}/download-token

GET    /api/approvals
POST   /api/approvals/{id}/resolve
GET    /api/notifications
POST   /api/notifications/{id}/read
```

消息流采用 Portal WebSocket 或 SSE；连接、授权、事件过滤和恢复全部由 Backend 完成。

---

## 24. 模型、数据出域与内容安全

### 24.1 模型准入

每个模型配置必须记录：

- Provider、模型和区域；
- 是否允许训练或保留请求数据；
- 数据处理协议和合规状态；
- 可处理的数据密级；
- 是否允许工具、文件、网页和外部消息；
- 对抗性稳健性评测结果；
- 成本和配额；
- 备用模型切换条件。

用户不能绕过员工模型策略任意切换模型。备用模型不得降低数据合规或安全等级。

### 24.2 数据出域

系统必须定义：

- 哪些会话、文件和字段可以发送给外部模型；
- 哪些数据需要脱敏、匿名化或完全禁止出域；
- 哪些 Agent 只能使用本地或私有模型；
- 数据保留、删除、导出和法律保留规则；
- Provider 故障时是否允许跨区域或跨 Provider 降级；
- 用户对敏感数据上传的提示和确认。

### 24.3 提示注入防护

- 网页、邮件、附件、渠道消息和粘贴日志均视为不可信内容；
- 保持 OpenClaw 外部内容包装和来源标记；
- 禁止生产环境开启不安全外部内容绕过选项；
- 限制 `exec`、`browser`、`web_fetch`、`web_search` 等高风险工具；
- 需要时启用沙箱、严格命令和内联执行审批；
- 敏感场景使用只读 Reader Agent 先摘要，再交给主 Agent；
- Secret 不进入 Prompt，不存放在 Agent 可读普通文件中；
- 模型选择作为一层缓解措施，但不能替代工具策略和强制控制。

---

## 25. 安全要求

### 25.1 网络与 Gateway

- Gateway 仅监听环回地址或私有网络；
- 普通用户网络不得直接访问 Gateway；
- Portal Backend 通过受控网络连接；
- Control UI 使用内网、VPN、零信任访问或安全代理；
- Portal 对外仅开放 HTTPS；
- Gateway Cell 主机启用磁盘加密和最小文件权限。

### 25.2 凭证

- 禁止将 Gateway、模型、邮箱、MCP 和 Channel Token 写入前端；
- 使用 Secret Manager、OpenClaw SecretRef 或等价安全引用；
- 数据库不存储明文凭证；
- 日志、错误、通知和审计脱敏；
- 支持轮换、撤销、过期提醒和使用审计；
- Bootstrap Token 只用于受控配对，不作为长期浏览器凭证。

### 25.3 Web 与文件安全

- Secure/HttpOnly/SameSite Cookie；
- CSRF、XSS、SSRF、点击劫持、开放重定向和速率限制防护；
- Markdown、HTML、内联组件和 Artifact 安全渲染；
- 上传文件执行大小、类型、恶意内容和病毒检查；
- 高风险下载、外发和配置修改要求二次确认或审批。

### 25.4 安全测试硬门槛

用户 A 构造用户 B 的以下标识时必须全部拒绝且不泄露存在性：

- Digital Employee ID；
- Session ID/SessionKey；
- Task ID/Run ID；
- Artifact ID；
- Approval ID；
- Connection ID；
- Skill 管理 ID。

---

## 26. 非功能需求

### 26.1 性能

| 场景 | 目标 |
|---|---|
| 登录后员工列表 | 在约定试点数据量下 P95 ≤ 2 秒 |
| 已缓存 Session 列表 | P95 ≤ 2 秒 |
| Portal 单事件转发额外耗时 | 服务端 P95 ≤ 300ms，不含模型生成时间 |
| 管理列表 | 分页、筛选和索引，不全量加载 |
| 文件传输 | 大文件不经单点内存缓冲，支持流式或直传 |

性能测试必须注明并发数、数据量、缓存状态、Gateway 负载、统计窗口和错误率。

### 26.2 可用性与连续性

- Gateway 不可用时展示只读/离线状态；
- 自动重连、重新订阅和权威状态恢复；
- Portal Backend 多实例运行时避免重复订阅处理；
- 数据库和审计支持备份恢复；
- 高风险写操作具备幂等和补偿；
- 员工停用时处理 Session、Task、Cron、Approval、Artifact 和 Connection；
- 提供 RPO/RTO 基线，试点建议 Portal 数据 RPO ≤ 15 分钟、RTO ≤ 2 小时，Gateway 状态以企业备份策略为准。

### 26.3 兼容性

- 首期支持当前稳定版 Chrome、Edge、Safari；
- 桌面 Web 优先，支持常见 1366×768 及以上分辨率；
- 平板和移动端可完成基础查看、对话和审批；
- OpenClaw 版本、Gateway wire version、插件版本建立兼容矩阵；
- 每次升级执行自动契约测试。

### 26.4 可维护性

- Adapter 与业务逻辑解耦；
- Connection 使用可插拔 Driver；
- 前后端、Gateway 集成、权限和投影具有自动化测试；
- 数据库 Migration 可回滚；
- 所有请求具备 Trace ID；
- 错误使用稳定代码，用户文案与内部诊断分离。

### 26.5 可访问性与国际化

- 首期语言为简体中文；
- 时间统一保存 UTC，按用户时区展示；
- 文案、日期、数字格式可国际化；
- 关键操作支持键盘、焦点状态、对比度和可读错误提示。

---

## 27. 部署与迁移方案

### 27.1 已有 OpenClaw 电脑

```text
部署 Portal Web、Backend、Database
→ 配置 Gateway 私有地址
→ 使用正式配对流程建立 Portal 设备/服务身份
→ 读取协议、能力与策略快照
→ 发现 6 个 Agent、Skill、Connection
→ 管理员完成分类、认领和发布
→ 创建门户用户并分配员工
→ 执行越权和重连验收
→ 开放试点
```

现有 Agent、Workspace、Skill、Session、Channel、MCP 和治理逻辑无需重新创建。门户上线不得中断现有 OpenClaw 原生运行路径。

### 27.2 新电脑部署

需同时准备：

- 经兼容验证的 OpenClaw 版本；
- Gateway 配置、状态目录和专用 OS 用户；
- Agent Workspace、Skill、MCP、Channel、Cron 和 Secret；
- Portal Frontend、Backend、Database 和 Secret Provider；
- 反向代理、HTTPS、备份和监控；
- 如果迁移历史，则迁移 OpenClaw State 和 Portal Database。

安装后通过一份环境配置和配对流程即可建立连接；不要求修改 OpenClaw 源码。

### 27.3 建议部署包

```text
deployment/
├── compose.yaml
├── portal-web/
├── portal-backend/
├── portal-migrations/
├── reverse-proxy/
├── env.example
├── compatibility-matrix.yaml
├── contract-tests/
└── README.md
```

### 27.4 关键配置

```text
PORTAL_DATABASE_URL
PORTAL_PUBLIC_URL
PORTAL_SESSION_SECRET_REF
PORTAL_SECRET_PROVIDER
OPENCLAW_GATEWAY_URL
OPENCLAW_DEVICE_CREDENTIAL_REF
OPENCLAW_EXPECTED_PROTOCOL_VERSION
OPENCLAW_EXPECTED_SERVER_RANGE
PORTAL_SYNC_INTERVAL
PORTAL_DEFAULT_AGENT_DISCOVERY_POLICY=pending_review
PORTAL_TRUST_DOMAIN_ID
PORTAL_ARTIFACT_RETENTION_DAYS
PORTAL_AUDIT_RETENTION_DAYS
```

---

## 28. 分期范围与交付计划

### 28.1 Gate 0：可行性与安全基线（建议 2–3 周）

目标不是做完整产品，而是关闭最昂贵的不确定性。

必须完成：

1. 盘点当前 Gateway、OpenClaw 和插件版本；
2. 记录 wire version、Feature Snapshot、Policy Snapshot 和 Scope；
3. 对当前 6 个 Agent 完成业务/系统/临时分类；
4. 验证 Agent 发现、创建、文件读取和受控写入；
5. 验证 Session 创建、流式聊天、停止、历史、事件和断线恢复；
6. 验证 Task、Artifact、Approval、Skill、Usage、Audit 和 Secret 能力；
7. 盘点微信、钉钉、邮箱、MCP 的实际实现、版本和写入接口；
8. 验证门户配对、运行 Scope、管理 Scope 和凭证轮换；
9. 验证 A/B 用户资源越权全部被拒绝；
10. 验证 Gateway 升级不兼容时 Portal 明确阻断或降级；
11. 确认模型、数据出域、保留和脱敏策略；
12. 确认首期用户数、并发、文件大小和存储容量基线。

### 28.2 MVP-1：安全使用闭环（建议 5–7 周）

范围：

- 登录、用户、角色和基础权限；
- 现有员工发现、审核、发布、隐藏和用户分配；
- WorkEasy 风格员工工作台；
- Session、流式聊天、附件、停止、历史和执行轨迹；
- Session/Task/Artifact 资源级授权；
- Task 状态、取消和 Artifact 下载；
- Skill 发现、状态、风险展示和员工分配；
- 四类 Connection 的只读发现、状态、库存和授权；
- 会话内审批；
- 站内通知最小闭环；
- Gateway 健康、同步中心、审计和基础成本数据；
- 断线、Portal 重启和 Gateway 重启恢复。

本阶段重点是“安全使用已有数字员工”，不开放任意 Skill 上传、自由 Workspace 编辑和全部连接写入。

### 28.3 MVP-2：受控运营闭环（建议 4–6 周）

范围：

- 模板化原生 Agent 创建；
- 受控 Workspace 变更、差异、审批、版本和回滚；
- 受信来源 Skill 搜索、安装、更新和下线；
- 员工停用/离职业务连续性；
- 一类可写 Connection Driver，默认建议优先 MCP；
- 人工接管、任务重试、批量员工授权；
- 文件预览、成果版本和更完整运营指标。

### 28.4 P1：企业能力扩展

- 微信、钉钉、邮箱专属可写 Driver；
- 完整审批中心和外部通知；
- Cron/Heartbeat/Automation 管理；
- 私有 Skill 上传、模板化创建和在线编辑；
- 企业 SSO、MFA、复杂组织和自定义角色；
- requester-scoped OAuth；
- 模型、成本、配额和员工运营分析；
- 移动端体验增强。

### 28.5 P2：平台化

- 多企业租户控制面；
- 每信任域独立 Gateway Cell 生命周期；
- 高可用和跨 Gateway 管理；
- Skill/MCP/员工模板市场；
- 计费、套餐、配额和资源治理；
- 集中审计、策略编排和跨 Cell 发布。

### 28.6 整体量级

在 3–5 名稳定研发与测试投入、现有环境可访问、外部账号审批不成为关键阻塞的前提下：

- Gate 0 + MVP-1：约 7–10 周；
- 加上 MVP-2：约 11–16 周；
- 完整愿景：按 6–9 个月的平台工程评估更合理。

周期以 Gate 0 实测结果为准，不构成固定承诺。

---

## 29. 验收标准

### 29.1 用户与权限

- 管理员可以创建用户并分配多个员工；
- 普通用户只看到已发布且被授权的员工；
- 禁用用户后，现有 Portal Session 在规定时间内失效；
- 用户不能通过修改参数访问他人的员工、Session、Task、Artifact、Approval 或 Connection；
- 权限变更全程可审计。

### 29.2 员工发现与管理

- 门户首次连接后能够发现当前 6 个长期 Agent；
- 管理员可以逐个分类、认领、补档、授权和发布；
- 新增长期 Agent 无需修改或重新发布 Portal 即可发现；
- system 和临时 Agent 不会错误发布；
- 原生 Agent 删除或失联后保留历史并停止新任务；
- Portal 创建的 Agent 可在原生 Control UI/CLI 中看到。

### 29.3 Skill

- 能发现当前可见 Skill 和有效状态；
- 外部新增、删除、更新后可同步；
- 分配 Skill 后原生有效配置与门户一致；
- 缺依赖、策略阻止和安装失败显示明确原因；
- 未开启上传归档能力时，Portal 不展示或禁用相关入口；
- 高风险安装不能绕过审批和供应链检查。

### 29.4 连接

- 门户部署后原有微信、钉钉、邮箱和 MCP 继续运行；
- 管理端可发现并展示可识别的 Connection；
- 不支持写入的 Driver 明确显示只读；
- 用户不能使用未授权 Connection；
- Secret 不回显前端、不进入普通日志；
- 可写 Driver 的添加、测试、授权、停用和撤销形成闭环。

### 29.5 对话与运行

- 用户可以为被授权员工创建多个独立 Session；
- 流式输出、停止、重试和附件正常；
- 执行轨迹不泄露原始推理和 Secret；
- 审批只向有权人员展示和处理；
- 断网、Portal 重启、Gateway 重启后状态正确恢复，不重复提交；
- 事件乱序、重复和缺口测试通过。

### 29.6 Artifact

- 用户只能下载授权 Session/Task/Run 产生的 Artifact；
- 无权限、过期或伪造 ID 返回无泄露的拒绝；
- 不返回主机路径或长期通用链接；
- 下载、预览、删除和过期均记录审计。

### 29.7 安全与运维

- 浏览器无法获得 Gateway 管理 Token；
- Gateway 不直接暴露给普通用户网络；
- Agent、Skill、Workspace、Connection、权限变更均有完整审计；
- OpenClaw 升级前可自动运行兼容和契约检查；
- 安全扫描、备份恢复和故障切换演练通过；
- 未归属 Session 默认对普通用户隐藏。

---

## 30. 测试矩阵

### 30.1 自动化测试

- Portal API 单元和集成测试；
- RBAC、ACL 和条件策略测试；
- Gateway Schema 和契约测试；
- Agent/Skill/Connection 同步测试；
- Session 投影 reducer、Cursor、runId/seq 去重测试；
- 幂等、补偿和并发编辑测试；
- 文件上传、下载和安全渲染测试；
- 数据保留和删除测试。

### 30.2 故障演练

- Portal 前端刷新和网络切换；
- Portal Backend 单实例重启；
- Portal Backend 多实例主投影节点故障；
- Gateway 重启和暂时不可用；
- Gateway 协议版本不兼容；
- 数据库短暂不可用；
- Connection Token 过期；
- Skill 更新失败；
- 大文件上传和下载中断；
- 运行中员工停用。

### 30.3 安全测试

- IDOR/越权；
- CSRF、XSS、SSRF；
- 恶意 Markdown/HTML/文件；
- Prompt Injection 和不可信外部内容；
- Secret 泄露和日志脱敏；
- Skill/Plugin 供应链；
- 高风险 Tool 审批绕过；
- 多用户共享员工的数据穿透；
- 渠道身份伪映射和未归属 Session 泄露。

---

## 31. 风险与应对

| 风险 | 影响 | 应对 |
|---|---|---|
| 共享 Gateway 被误当强多租户边界 | 极高 | 明确信任域；敌对用户拆分 Gateway Cell |
| P0 同时覆盖全部控制面 | 高 | Gate 0、MVP-1、MVP-2 分期 |
| Portal 与 Gateway 协议失配 | 高 | 版本锁定、兼容矩阵、契约测试、升级阻断 |
| Session/Artifact 越权 | 极高 | 资源状态机、ACL、默认隐藏、自动化越权测试 |
| 事件断线或多实例重复处理 | 高 | 服务端投影、Cursor、runId/seq、租约和幂等 |
| Skill/Plugin 供应链 | 极高 | 受信源、扫描、审批、沙箱、回滚和下线 |
| Workspace 变更导致行为漂移 | 高 | 模板、差异、版本、审批、验证和回滚 |
| 模型数据出域不合规 | 极高 | 模型准入、数据分级、脱敏、本地模型和审计 |
| 微信/钉钉/邮箱插件差异 | 高 | Connection Driver、能力探测、分类型验收 |
| 凭证泄漏 | 极高 | SecretRef、最小权限、轮换、脱敏和撤销 |
| 员工离职后遗留任务和连接 | 高 | 停用前检查、交接、撤销和保留策略 |
| Portal 单点成为流式瓶颈 | 中高 | 背压、限流、多实例投影、文件直传和容量测试 |

---

## 32. Gate 0 需要最终确认的业务决策

| 决策 | V1.1 推荐默认值 |
|---|---|
| 首期信任域 | 单企业受控信任域 |
| 当前 6 个 Agent | 逐个审核，确认后批量发布，不无条件自动激活 |
| 新 Agent 发现策略 | `pending_review` |
| 数字员工与 Agent | 一个长期业务 Agent 对应一个数字员工 |
| Session 与员工 | Session 是工作上下文，不是员工 |
| 首个可写连接 | 默认优先 MCP；如邮件价值更高可改为单一邮箱 Provider |
| Skill 一期范围 | 发现、状态、分配；受信安装进入 MVP-2 |
| 私有 Skill 上传 | P1，且依赖 Gateway 显式开启与审批扫描 |
| Workspace 编辑 | MVP-2 受控变更，不开放自由文件编辑 |
| 未归属 Session | 普通用户默认隐藏 |
| 原始思维链 | 不展示，使用可解释执行轨迹 |
| 数据保留 | 会话、Artifact、审计分别配置，Gate 0 确认期限 |
| OpenClaw 升级 | 版本锁定、Portal 兼容先行、契约测试后升级 |

---

## 33. 参考资料

- [OpenClaw 官方文档](https://docs.openclaw.ai/)
- [Gateway Protocol](https://docs.openclaw.ai/gateway/protocol)
- [Building a Gateway Client](https://docs.openclaw.ai/gateway/clients)
- [Gateway Security](https://docs.openclaw.ai/gateway/security)
- [Multi-user Mode](https://docs.openclaw.ai/concepts/multi-user)
- [OpenClaw MCP](https://docs.openclaw.ai/cli/mcp)
- [OpenClaw Agents](https://docs.openclaw.ai/cli/agents)
- [Agent Workspace](https://docs.openclaw.ai/agent-workspace)

---

## 34. 评审签署

| 角色 | 姓名 | 结论 | 日期 |
|---|---|---|---|
| 产品负责人 |  |  |  |
| 技术负责人 |  |  |  |
| OpenClaw 治理负责人 |  |  |  |
| 安全负责人 |  |  |  |
| 测试负责人 |  |  |  |
| 运维负责人 |  |  |  |

---

## 附录 A：V1.0 至 V1.1 关键变化

| 主题 | V1.0 | V1.1 |
|---|---|---|
| 项目定位 | 门户 + 大量一期 P0 | 企业控制面，分 Gate 0/MVP-1/MVP-2 |
| Agent 发现 | 可自动激活 | 默认待审核，发现与发布分离 |
| 用户隔离 | 用户—Agent 授权为主 | 增加 Session/Task/Artifact/Approval 资源 ACL |
| Gateway 身份 | 倾向固定双连接 | 固定逻辑权限域，物理连接数由技术设计决定 |
| 多用户 | 提示单 Gateway 风险 | 明确信任域准入和 Gateway Cell 条件 |
| 会话恢复 | 重连后恢复 | 服务端投影、Cursor、activeRunIds、runId/seq 状态机 |
| Skill | 创建、上传、安装全部 P0 | 发现分配优先，受信安装和私有上传分期 |
| Workspace | 直接编辑 | 模板、差异、审批、版本和回滚 |
| 连接 | 四类连接 P0 可写 | 全量保留，MVP-1 纳管，逐 Driver 开放写入 |
| 思考过程 | 展示思考状态 | 展示可解释执行轨迹，不展示原始思维链 |
| 模型治理 | 基本缺失 | 增加模型准入、数据出域、脱敏和安全评测 |
| 通知 | 菜单级提及 | MVP-1 站内通知闭环 |
| 成功标准 | 功能验收 | 增加试点指标和退出标准 |
| 员工离职 | 未定义 | 增加任务、会话、连接、成果交接流程 |

## 附录 B：最终产品能力全景

```text
数字员工门户
├── 用户工作台
│   ├── 员工切换
│   ├── 对话与会话
│   ├── 文件与成果
│   ├── 任务与自动化
│   ├── 执行轨迹
│   ├── 审批与通知
│   └── 个人连接
├── 管理后台
│   ├── 用户/组织/RBAC
│   ├── 数字员工发现、档案、发布、停用
│   ├── Skill 发现、分配、供应链
│   ├── 微信/钉钉/邮箱/MCP/Plugin
│   ├── Session/Task/Artifact 治理
│   ├── 审批、通知、人工接管
│   ├── 模型与数据策略
│   ├── 同步、健康、成本
│   └── 审计与对账
├── OpenClaw Adapter
│   ├── 协议与配对
│   ├── Scope 与 Capability
│   ├── 能力探测
│   ├── 幂等与错误归一化
│   ├── 事件投影与重连恢复
│   └── Connection Drivers
└── OpenClaw Runtime
    ├── Agents / Workspaces
    ├── Skills / Tools / MCP
    ├── Sessions / Tasks / Artifacts
    ├── Cron / Heartbeat
    └── Channels / Plugins
```
