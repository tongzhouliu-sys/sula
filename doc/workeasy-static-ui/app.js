(() => {
  "use strict";

  const app = document.querySelector("#app");

  const state = {
    overlay: null,
    toast: "",
    loginMode: "password",
    skillView: "cards",
    skillQuery: "",
    toolQuery: "",
    mcpTab: "normal",
    connector: "mailbox",
  };

  const routes = new Set([
    "login", "chat", "workspace", "skills", "tools", "mcp", "cron-jobs",
    "skill-pool", "mcp-pool", "feedback", "personal-info", "dashboard",
    "activity", "channels", "connectors", "updates",
  ]);

  const skills = [
    ["🛠️", "G2 统计图表", "antv-g2-chart", "使用 AntV G2 v5 生成柱状图、折线图、饼图等统计图表代码。"],
    ["🛠️", "G6 图可视化", "antv-g6-graph", "使用 AntV G6 v5 生成关系图、流程图、思维导图等图可视化代码。"],
    ["🛠️", "S2 透视表专家", "antv-s2-expert", "S2 多维交叉分析表开发与配置助手。"],
    ["📊", "智能图表生成", "chart-visualization", "将数据可视化为柱状图、折线图、饼图等图表图片。"],
    ["💬", "咨询智能体", "chat_with_agent", "咨询其他 Agent、寻求帮助，或按要求邀请某个 Agent 参与。"],
    ["⏰", "定时任务", "cron", "创建、查询、启停或删除定时与周期任务。"],
    ["🔎", "钉钉 AI 搜问", "dingtalk-aisearch", "按姓名、部门、职责等语义找人，并跨文档、消息、邮件检索。"],
    ["▦", "钉钉 AI 表格", "dingtalk-aitable", "AI 表格：建表、字段、记录增删改查、筛选排序与图表。"],
    ["📅", "钉钉日历", "dingtalk-calendar", "日程与会议室：约会议、查闲忙、改期与取消会议。"],
    ["💭", "钉钉群聊与消息", "dingtalk-chat", "群聊与消息：建群、消息、机器人通知与会话管理。"],
    ["👥", "钉钉通讯录", "dingtalk-contact", "通讯录精确查询：成员详情、部门、职位与邮箱。"],
    ["📄", "钉钉文档", "dingtalk-doc", "钉钉文档：创建、读写、块编辑、评论、附件与导出。"],
    ["☁️", "钉钉云盘", "dingtalk-drive", "钉盘文件：上传下载、文件夹、搜索、复制移动与权限。"],
    ["✉️", "钉钉邮箱", "dingtalk-mail", "邮箱读写：发信、收信、搜索、回复转发与附件。"],
    ["🎙️", "钉钉 AI 听记", "dingtalk-minutes", "AI 听记：摘要、转写、关键词、待办与分享。"],
    ["🧩", "钉钉杂项能力", "dingtalk-misc", "审批、考勤、DING、日志、电子表格与开放平台能力。"],
    ["🔗", "钉钉共享契约", "dingtalk-shared", "认证、全局参数、安全规则与跨产品导航。"],
    ["☑️", "钉钉待办", "dingtalk-todo", "待办任务：创建、指派、提醒、完成与查询。"],
    ["📚", "钉钉知识库", "dingtalk-wiki", "知识库与空间：创建、搜索、成员与节点管理。"],
    ["📝", "Word 文档", "docx", "创建、编辑或处理 Word（.docx）文档。"],
  ];

  const tools = [
    ["⏰", "创建定时任务", "create_cron_job", "创建定时任务。按 5 字段 cron 自动运行并向当前 Agent 发送触发消息。", "平台能力"],
    ["⏰", "创建提醒", "create_reminder", "创建一次性提醒；到点后向当前 Agent 发送提醒内容。", "平台能力"],
    ["🤝", "异步委派", "delegateAsync", "异步委派任务，立即返回 task_id，稍后获取结果。", "智能体与技能"],
    ["🤝", "并行委派", "delegateParallel", "并行委派多个任务给其他 Agent，并汇总各自结果。", "智能体与技能"],
    ["🤝", "委派给智能体", "delegateToAgent", "委派任务给另一个 Agent，在独立会话中执行并返回最终回复。", "智能体与技能"],
    ["⏰", "删除定时任务", "delete_cron_job", "删除指定定时任务（可能需要审批）。", "平台能力"],
    ["🔍", "识别文件类型", "detect_file_type", "检测文件 MIME 类型与类别，并建议合适的读取工具。", "文件与工作区"],
    ["📣", "钉钉机器人单聊", "dingtalk_robot_send", "用企业机器人给自己发送文字、图片和文件。", "平台能力"],
    ["💠", "钉钉办公", "dws_exec", "通过钉钉 DWS 执行办公能力，如消息、日历与文档。", "平台能力"],
    ["✏️", "编辑文件", "edit_file", "按查找替换编辑文件局部内容。", "文件与工作区"],
    ["🧠", "编辑记忆文件", "edit_workspace_memory_file", "编辑工作区记忆文件中的片段。", "记忆"],
    ["🧑‍💻", "执行代码", "execute_code", "仅用于工作区临时调试和技能运行。", "文件与工作区"],
    ["🖥️", "执行命令", "execute_shell_command", "在服务器上执行 Shell 命令，危险操作需审批。", "文件与工作区"],
    ["📄", "提取文档内容", "extract_document_text", "从 PDF 或 Office 文档提取文本。", "文件与工作区"],
    ["📁", "查找文件", "find_files", "按名称或模式查找文件。", "文件与工作区"],
    ["🕐", "获取当前日期时间", "getCurrentDateTime", "获取当前日期时间。", "时间"],
    ["🎨", "生成图片", "image_generate", "根据文字描述生成图片。", "生成与文档"],
    ["👁️", "读取图片", "image_read", "读取工作区中的图片，让模型理解画面内容。", "平台能力"],
  ];

  const poolSkills = [
    ...skills.slice(0, 6),
    ["🔎", "钉钉 AI 搜问", "dingtalk-aisearch", "按姓名、部门与职责进行语义检索。"],
    ["▦", "钉钉 AI 表格", "dingtalk-aitable", "AI 表格的结构、记录与图表能力。"],
    ["📅", "钉钉日历", "dingtalk-calendar", "日程、会议室与闲忙管理。"],
    ["💭", "钉钉群聊与消息", "dingtalk-chat", "群聊、消息与会话管理。"],
    ["📝", "Word 文档", "docx", "创建、编辑或处理 Word 文档。"],
    ["📕", "PDF 处理", "pdf", "读取、提取、生成与编辑 PDF。"],
  ];

  const iconMap = {
    chat: "▣", workspace: "▱", skills: "⌁", tools: "⌕", mcp: "ϟ",
    "cron-jobs": "▣", "skill-pool": "▦", "mcp-pool": "ϟ", feedback: "⚑",
  };

  function route() {
    const raw = location.hash.replace(/^#\/?/, "").split("?")[0] || "chat";
    return routes.has(raw) ? raw : "chat";
  }

  function navigate(next) {
    state.overlay = null;
    if (location.hash === `#/${next}`) render();
    else location.hash = `#/${next}`;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
    })[char]);
  }

  function pageHeader(icon, title, subtitle, actions = "") {
    return `<header class="page-header">
      <div class="header-icon">${icon}</div>
      <div><h1>${title}</h1><p>${subtitle}</p></div>
      <div class="header-actions">${actions}</div>
    </header>`;
  }

  function btn(label, primary = false, action = "noop") {
    return `<button class="btn${primary ? " btn-primary" : ""}" data-action="${action}">${label}</button>`;
  }

  function sidebar(activeRoute) {
    const nav = [
      ["chat", "聊天"], ["workspace", "文件"], ["skills", "技能"],
      ["tools", "工具"], ["mcp", "MCP"], ["cron-jobs", "定时任务"],
    ];
    const publicNav = [["skill-pool", "技能库"], ["mcp-pool", "MCP 广场"], ["feedback", "反馈建议"]];
    return `<aside class="sidebar">
      <div class="brand">
        <span class="brand-name">WorkEasy</span><span class="brand-sub">数字员工</span>
        <span class="brand-spacer"></span>
        <button class="icon-btn" data-action="community" aria-label="交流群">▢</button>
        <button class="icon-btn ${activeRoute === "updates" ? "active" : ""}" data-route="updates" aria-label="系统更新">▤</button>
        <button class="icon-btn" data-action="collapse" aria-label="折叠侧边栏">≡</button>
      </div>

      <section class="side-section">
        <div class="section-label">当前对象</div>
        <div class="agent-card">
          <div class="agent-line">
            <button class="agent-avatar-btn" data-action="avatar"><img src="assets/agent-avatar.png" alt="AI助手" /></button>
            <div><div class="agent-name">AI助手</div><div class="agent-id">2091697918041161729</div></div>
            <button class="switch-btn" data-action="agent">切换</button>
          </div>
          <div class="stat-row">
            <button class="stat-chip" data-route="skills">技能 × 41</button>
            <button class="stat-chip" data-route="tools">工具 × 48</button>
            <button class="stat-chip" data-route="mcp">MCP × 0</button>
            <button class="stat-chip" data-route="cron-jobs">定时任务 × 0</button>
          </div>
          <div class="stat-meta"><img class="satellite" src="assets/satellite.png" alt=""/><div class="tiny">连接器</div><div class="tiny">Asia/Singapore</div></div>
        </div>
        <div class="connect-row">
          <button class="connect-btn" data-route="channels">IM</button>
          <button class="connect-btn" data-route="connectors">邮箱</button>
        </div>
        <nav class="side-nav" aria-label="工作区菜单">
          ${nav.map(([id, label]) => `<button class="nav-tile ${activeRoute === id ? "active" : ""}" data-route="${id}"><span>${iconMap[id]}</span>${label}</button>`).join("")}
        </nav>
      </section>

      <section class="side-section">
        <div class="section-label">公共资源</div>
        <button class="publish-banner" data-action="publish" aria-label="发布空间"></button>
        <nav class="side-nav public-nav" aria-label="公共资源">
          ${publicNav.map(([id, label]) => `<button class="nav-tile ${activeRoute === id ? "active" : ""}" data-route="${id}"><span>${iconMap[id]}</span>${label}</button>`).join("")}
          <button class="nav-tile" disabled><span>▣</span>模型库</button>
        </nav>
      </section>

      <button class="account-btn" data-action="account">
        <span class="account-avatar">1</span>
        <span><span class="account-name">138****8830</span><span class="account-login">demo-user</span></span>
        <span>⌄</span>
      </button>
    </aside>`;
  }

  function chatPage() {
    return `<div class="chat-page">
      <aside class="conversation-list">
        <div class="conversation-head"><h2>会话列表</h2><button class="icon-btn">⋯</button></div>
        <input class="conversation-search" placeholder="搜索对话…" />
        <div class="conversation-group">置顶</div>
        <div class="conversation-item active"><strong>📋 Scheduled Tasks</strong><small>0 条消息 · 1 小时前</small></div>
        <div class="conversation-group">今天</div>
        <div class="conversation-item"><strong>让我们开启一段新的旅程吧！</strong><small>4 条消息 · 1 小时前</small></div>
      </aside>
      <section class="chat-panel">
        <div class="chat-toolbar">
          ${btn("▣ 新会话", false, "new-chat")}${btn("◴ 历史")}${btn("↗ 导出当前会话")}${btn("▱ 清空消息")}${btn("⛶ 全屏", false, "fullscreen")}${btn("字号 A 标准")}
          <span class="chat-toolbar-title">新会话</span><button class="icon-btn">≡</button>
        </div>
        <div class="welcome">
          <div class="welcome-avatar"><img src="assets/agent-avatar.png" alt="AI助手" /></div>
          <h2>你好，我今天能帮你做什么？</h2>
          <p>我是一个智能助手，可以帮助你解决问题。</p>
          <div class="suggestions">
            <button class="suggestion" data-action="suggest">⭐ 让我们开启一段新的旅程吧！<span>→</span></button>
            <button class="suggestion" data-action="suggest">⭐ 能否告诉我你有哪些技能吗？<span>→</span></button>
          </div>
        </div>
        <div class="composer">
          <textarea id="composer" placeholder="输入消息，@ 选择技能，Enter 发送，Shift + Enter 换行"></textarea>
          <div class="composer-bottom"><span>@</span><span>📎</span><button class="btn">MiniMax-M3⌄</button><span class="spacer"></span><span>0/10240</span><button class="btn send" data-action="fake-send">➤</button></div>
        </div>
        <aside class="artifact-rail"><button>‹</button></aside>
      </section>
    </div>`;
  }

  function workspacePage() {
    return `<div class="page">
      ${pageHeader("▱", "文件", `<span class="agent-dot">AI助手</span> · 管理当前智能体的长期与临时文件`)}
      <div class="toolbar">
        <div class="tabs"><button class="tab active">文件库</button><button class="tab">核心文件</button></div>
        <input class="search" placeholder="搜索文件名或路径" />
        <span class="muted">显示方式</span>${btn("▦ 平铺列表")}${btn("▱ 文件夹")}
        <select class="select"><option>按路径</option><option>按名称</option></select>${btn("↻")}
      </div>
      <section class="card storage-card">
        <div class="storage-line"><span>存储占用</span><div><strong class="storage-number">0 B</strong><span class="muted"> / 0 B</span></div></div>
        <div class="progress"><i></i></div>
        <div class="badge-row"><span class="badge">● 长期 0 B</span><span class="badge">● 临时 0 B</span><span class="pill active">总览 0 B</span><span class="pill">AI助手 0 B</span></div>
      </section>
      <section class="grid grid-2" style="grid-template-columns:1fr 1fr">
        <div class="card quota"><h3>长期</h3><strong>0 B <span class="muted" style="font-size:13px">/ 0 B</span></strong><p class="muted">账号合计</p><div class="progress"><i></i></div></div>
        <div class="card quota"><h3 style="color:#e8b36e">临时</h3><strong style="color:#e8b36e">0 B <span class="muted" style="font-size:13px">/ 0 B</span></strong><p class="muted">约保留 7 天后自动清理</p><div class="progress"><i style="background:#a36d33"></i></div></div>
      </section>
      <div class="empty-state" style="min-height:260px"><div class="empty-inner"><div class="empty-icon">▱</div><h2>暂无文件</h2><p>当前智能体的文件会显示在这里。</p></div></div>
    </div>`;
  }

  function skillsPage() {
    const q = state.skillQuery.trim().toLowerCase();
    const filtered = skills.filter((s) => !q || s.join(" ").toLowerCase().includes(q));
    return `<div class="page">
      ${pageHeader("⌁", "技能管理", `<span class="agent-dot">AI助手</span> · 已绑定技能（与聊天 @ 菜单同一份清单）`, `${btn("⇩ 从技能库载入")}${btn("⇧ 同步到技能库")}${btn("↻ 刷新运行时", false, "local-refresh")}${btn("⇩ 导入技能")}`)}
      <div class="toolbar">
        <button class="pill active">▦ 全部 <span class="count">41</span></button><button class="pill">🔧 内置 <span class="count">41</span></button><button class="pill">▣ 自定义 <span class="count">0</span></button><button class="pill">◴ 待归档 <span class="count">0</span></button>
        <input class="search" data-search="skills" value="${escapeHtml(state.skillQuery)}" placeholder="搜索技能名称、描述或标签..." />
        <select class="select"><option>推荐排序</option><option>按名称</option><option>最近更新</option></select>
      </div>
      <div class="skill-section-title">已启用 <span class="count">41</span></div>
      <div class="grid grid-3">
        ${filtered.map((s) => `<article class="card skill-card" data-filterable="${escapeHtml(s.join(" ").toLowerCase())}">
          <div class="skill-emoji">${s[0]}</div><div><h3>${s[1]}</h3><div class="slug">${s[2]}</div><p class="desc">${s[3]}</p><div class="badge-row"><span class="badge">就绪</span><span class="badge">内置</span><span class="badge">v1.0.0</span></div></div><button class="toggle on" data-action="toggle" aria-label="启用"></button>
        </article>`).join("")}
      </div>
      <div class="tool-section-title">未启用 <span class="count">0</span></div>
      <div class="empty-state card" style="min-height:180px"><div><div class="empty-icon" style="width:52px;height:52px;font-size:24px">⌁</div><h2 style="font-size:16px">暂无未启用的技能</h2></div></div>
    </div>`;
  }

  function toolsPage() {
    const q = state.toolQuery.trim().toLowerCase();
    const filtered = tools.filter((t) => !q || t.join(" ").toLowerCase().includes(q));
    const cats = ["全部", "文件与工作区", "时间", "智能体与技能", "记忆", "生成与文档", "平台能力", "集成连接"];
    return `<div class="page">
      ${pageHeader("⌕", "内置工具", `<span class="agent-dot">AI助手</span> · 为当前智能体启用或禁用可用工具`, `${btn("全部启用")}${btn("全部禁用")}`)}
      <div class="tabs"><button class="tab active">已启用 47</button><button class="tab">已禁用 0</button><button class="tab">全部工具 47</button></div>
      <div class="toolbar">${cats.map((c, i) => `<button class="pill ${i === 0 ? "active" : ""}">${c}</button>`).join("")}<input class="search" data-search="tools" value="${escapeHtml(state.toolQuery)}" placeholder="搜索工具名称或描述..." /></div>
      <div class="tool-section-title">已启用 <span class="count">47</span></div>
      <div class="grid grid-3">
        ${filtered.map((t) => `<article class="card tool-card"><div class="tool-head"><div class="tool-emoji">${t[0]}</div><div><h3>${t[1]}</h3><div class="slug">${t[2]}</div></div></div><button class="toggle on" data-action="toggle"></button><p class="desc">${t[3]}</p><div class="meta-line"><span>${t[4]}</span><span class="badge">已启用</span></div></article>`).join("")}
      </div>
    </div>`;
  }

  function mcpPage() {
    return `<div class="page">
      ${pageHeader("ϟ", "MCP 工具集", "管理已授权的外部工具，并分配给智能体", `${btn("↻ 全量刷新", false, "local-refresh")}<button class="btn btn-primary" data-route="mcp-pool">▦ MCP 广场</button>`)}
      <div class="tabs"><button class="tab">全部</button><button class="tab active">AI助手 <span class="badge">当前</span> 0</button></div>
      <div class="empty-state"><div class="empty-inner"><div class="empty-icon">⌕</div><h2>暂无 MCP 工具集</h2><p>在 MCP 广场添加连接或接受他人授权后，工具集会显示在这里</p><button class="btn btn-primary" data-route="mcp-pool">MCP 广场</button></div></div>
    </div>`;
  }

  function cronPage() {
    return `<div class="page">
      ${pageHeader("▣", "定时任务", `<span class="agent-dot">AI助手</span> · 按计划自动执行的 Agent 任务`, btn("＋ 新建任务", true, "demo-modal"))}
      <div class="tabs"><button class="tab active">定时任务</button><button class="tab">运行历史</button></div>
      <div class="toolbar"><button class="pill active">当前智能体</button><button class="pill">全部智能体</button><input class="search" placeholder="搜索任务名称、表达式…" /><select class="select"><option>全部状态</option><option>已启用</option><option>已停用</option></select></div>
      <table class="data-table"><thead><tr><th>任务名称</th><th>Cron 表达式</th><th>日期</th><th>关联渠道</th><th>最近投递</th><th>启用</th><th>操作</th></tr></thead><tbody><tr class="table-empty"><td colspan="7"><div class="empty-icon" style="width:56px;height:56px;font-size:24px">◷</div><p>暂无定时任务</p><button class="btn btn-primary" data-action="demo-modal">新建第一个定时任务</button></td></tr></tbody></table>
    </div>`;
  }

  function skillPoolPage() {
    return `<div class="page">
      <div class="pool-tabs"><button class="pool-tab active"><span class="pool-icon">🌐</span><span><strong>公共库</strong><small>租户共享 · 可授权到智能体</small></span></button><button class="pool-tab"><span class="pool-icon">🔒</span><span><strong>私有库</strong><small>团队仓库 · 按可见范围管理</small></span></button><div class="spacer"></div>${btn("↻", false, "local-refresh")}${btn("➤ 授权")}${btn("更新内置技能")}</div>
      <div class="toolbar"><button class="tab active">全部</button><button class="tab">晶彩</button><button class="tab">文档</button><button class="tab">搜索</button><button class="tab">可视化</button><input class="search" placeholder="按名称筛选" /></div>
      <div class="pool-list">
        ${poolSkills.map((s) => `<div class="pool-row"><div class="skill-emoji">${s[0]}</div><div><h3>${s[1]}</h3><span class="badge">v1</span> <span class="badge">内置</span> <span class="badge">最新</span><p>${s[3]}</p><span class="badge">${s[2]}</span></div><div class="pool-actions">${btn("⬇ 下载", false, "local-download")}${btn("授权")}${btn("删除", false, "noop")}</div></div>`).join("")}
      </div>
    </div>`;
  }

  function mcpPoolPage() {
    const normal = state.mcpTab === "normal";
    return `<div class="page">
      ${pageHeader("▱", "MCP 广场", "平台长连接 · 可见范围与工具授权", btn("创建客户端", true, "demo-modal"))}
      <div class="tabs"><button class="tab ${normal ? "active" : ""}" data-action="mcp-tab" data-value="normal">普通协议 <span class="count">0</span></button><button class="tab ${!normal ? "active" : ""}" data-action="mcp-tab" data-value="new">新版协议 <span class="count">0</span></button></div>
      <div class="toolbar"><input class="search" placeholder="搜索 MCP 服务…" /></div>
      <div class="empty-state"><div class="empty-inner"><div class="empty-icon">▤</div><h2>暂无 MCP 连接</h2><p>添加一个 MCP 连接来扩展 Agent 的能力</p><button class="btn btn-primary" data-action="demo-modal">＋ 自定义 MCP</button></div></div>
    </div>`;
  }

  function feedbackPage() {
    return `<div class="page">
      <section class="feedback-hero"><div class="eyebrow">技术支持</div><h1>反馈建议</h1><p>向技术团队反馈问题、需求或建议，进度与回复在此跟进。</p><div class="toolbar" style="margin:16px 0 0"><button class="pill active">● 全部</button><button class="pill">● 待处理</button><button class="pill">● 处理中</button><button class="pill">● 已解决</button><span class="spacer"></span>${btn("只看我的")}</div></section>
      <div class="empty-state card" style="margin-top:14px;min-height:610px"><div class="empty-inner"><div class="empty-icon">⚑</div><h2>还没有提报</h2><p>遇到问题或有改进想法时，在这里告诉技术团队即可。</p><button class="btn btn-primary" data-action="demo-modal">提交第一条提报</button></div></div>
    </div>`;
  }

  function personalPage() {
    return `<div class="page"><h1 class="profile-title">个人信息</h1><div class="profile-hero"><div class="profile-circle">1</div><div><strong>138****8830</strong><small>demo-user · 用户</small></div></div><div style="display:flex;align-items:center;max-width:720px"><h2>平台身份</h2><span class="spacer"></span>${btn("修改密码", false, "demo-modal")}</div><div class="profile-card"><div class="profile-row"><span>工号</span><span>DEMO-001</span></div><div class="profile-row"><span>显示姓名</span><span>138****8830</span></div><div class="profile-row"><span>登录名</span><span>demo-user</span></div><div class="profile-row"><span>角色</span><span>用户</span></div></div></div>`;
  }

  function dashboardPage() {
    const metric = [["💬","2","对话数"],["▤","4","消息数"],["⚙","0","工具调用"],["▱","51.4K","TOKEN 消耗"]];
    return `<div class="page"><h1 style="margin:0 0 8px;font-size:32px">仪表盘</h1><div class="grid grid-4">${metric.map((m)=>`<div class="card metric-card"><div class="metric-icon">${m[0]}</div><div><strong>${m[1]}</strong><span>${m[2]}</span></div></div>`).join("")}</div><h2>本周活跃度</h2><p class="muted">你和 AI 的互动频率。</p><div class="card chart-card"><svg viewBox="0 0 1000 250" preserveAspectRatio="none" aria-label="本周活跃度折线图"><g class="chart-grid"><line x1="40" y1="30" x2="970" y2="30"/><line x1="40" y1="85" x2="970" y2="85"/><line x1="40" y1="140" x2="970" y2="140"/><line x1="40" y1="195" x2="970" y2="195"/></g><path class="chart-line-a" d="M80,220 C240,220 400,220 570,220 S815,220 880,220 C930,220 940,210 962,40"/><path class="chart-line-b" d="M80,220 C260,220 420,220 590,220 S820,220 888,220 C930,218 945,197 962,62"/><g style="fill:#8a7060;font-size:10px"><text x="64" y="244">08-18</text><text x="214" y="244">08-19</text><text x="364" y="244">08-20</text><text x="514" y="244">08-21</text><text x="664" y="244">08-22</text><text x="814" y="244">08-23</text><text x="944" y="244">08-24</text></g></svg><div class="badge-row" style="justify-content:center"><span class="badge">● 消息数</span><span class="badge" style="color:#78a7ff;background:#78a7ff1c">● Tokens</span></div></div><h2>周期对比</h2><p class="muted">从日、周、月三个维度观察系统运行状况。</p><div class="grid grid-3">${["今日","本周","本月"].map((p)=>`<div class="card period-card"><h3>${p}</h3><div class="period-row"><span>对话数</span><strong>2</strong></div><div class="period-row"><span>消息数</span><strong>4</strong></div><div class="period-row"><span>Token 消耗</span><strong>51.4K</strong></div><div class="period-row"><span>工具调用</span><strong>0</strong></div></div>`).join("")}</div></div>`;
  }

  function activityPage() {
    return `<div class="page"><div style="display:flex;align-items:center"><h1>活动记录</h1><span class="spacer"></span>${btn("↻ 刷新", false, "local-refresh")}</div><div class="toolbar"><button class="pill active">全部</button><button class="pill">● 审计</button><button class="pill">● 审批</button><span class="spacer"></span><button class="tab">更多筛选</button></div><div class="empty-state card"><div class="empty-inner"><div class="empty-icon">📋</div><h2>暂无操作记录</h2><p>创建智能体、绑定技能、审批工具调用都会出现在这里。</p></div></div></div>`;
  }

  function channelsPage() {
    return `<div class="page">${pageHeader("▢", "机器人", "将数字员工连接到各消息平台和 API", btn("＋ 新建机器人", true, "demo-modal"))}<div class="empty-state card"><div class="empty-inner"><div class="empty-icon">◯</div><h2>连接第一个机器人</h2><p>把你的数字员工接入团队已经在用的 IM 工具——Slack、企业微信、Telegram 等。</p><button class="btn btn-primary" data-action="demo-modal">＋ 连接一个机器人</button></div></div></div>`;
  }

  function connectorsPage() {
    const items = [["mailbox","✉️","邮箱","绑定工作邮箱并启用邮件工具"],["dingtalk","🔷","钉钉","开通钉钉 CLI 并完成授权"],["wecom","◉","企业微信","开通企业微信 CLI 运行环境"]];
    return `<div class="page">${pageHeader("🔗", "连接器", "选择一个连接器，在右侧完成授权与开启")}
      <div class="connectors-layout"><section class="card connector-list"><h3>从哪里开始？</h3><p>选择一个连接器，在右侧完成授权与开启</p><div style="display:flex;align-items:center"><span class="muted">共 3 个连接器</span><span class="spacer"></span>${btn("刷新", false, "local-refresh")}</div>${items.map((i)=>`<button class="connector-item ${state.connector===i[0]?"active":""}" data-action="connector" data-value="${i[0]}"><span class="connector-logo">${i[1]}</span><span><strong>${i[2]}</strong><small>${i[3]}</small></span><span class="off">OFF</span></button>`).join("")}</section><section class="card connector-detail">${connectorDetail()}</section></div>
    </div>`;
  }

  function connectorDetail() {
    if (state.connector !== "mailbox") return `<div class="security-note">凭证安全说明：本静态演示不会保存或发送任何授权信息。</div><div class="empty-state"><div class="empty-inner"><div class="empty-icon">🔗</div><h2>${state.connector === "dingtalk" ? "钉钉" : "企业微信"}尚未开通</h2><p>该页面仅展示前台状态，不会发起真实授权。</p>${btn("开始配置", true, "demo-modal")}</div></div>`;
    return `<div class="security-note">ⓘ　凭证安全说明<br>您的邮箱密码不会写入智能体工作区、环境变量或令牌变量，智能体与技能禁止且无法读取。</div><div style="margin-top:16px">绑定状态　<span class="pill">未绑定</span></div><div class="connector-tabs"><button class="pill active">🐧 QQ 邮箱</button><button class="pill">🟥 163 邮箱</button><button class="pill">◉ 新浪邮箱</button><button class="pill">✉️ 自定义企业邮箱</button></div><div class="mail-form"><div><h2 style="margin-top:0">✉️ 保存绑定</h2><p class="muted">QQ 邮箱通过 IMAP/SMTP 连接。请使用授权码而非登录密码。</p><div class="field"><label>邮箱地址</label><input value="demo@example.com" /></div><div class="field"><label>授权码 / 密码</label><input type="password" placeholder="请输入授权码（本地演示不会发送）" /></div><div class="field"><button class="btn" style="width:100%;justify-content:flex-start">▸ 高级设置</button></div><div style="text-align:right">${btn("测试连接", false, "demo-modal")} ${btn("保存绑定", true, "demo-modal")}</div></div><aside class="help-card"><h3>如何获取授权码</h3><p>登录邮箱网页版，在账户设置中开启 IMAP/SMTP 服务，并生成专用授权码。</p><p>此研究版不会连接邮箱，也不会保存任何输入内容。</p></aside></div>`;
  }

  function updatesPage() {
    return `<div class="updates-page"><div class="updates-head"><h1>系统更新</h1><button class="btn" disabled>⇩ 一键导出</button><button class="icon-btn" data-action="close-updates" style="color:#333;border-color:#ddd">×</button></div><div class="updates-body">暂无已发布的更新说明</div></div>`;
  }

  function loginPage() {
    const sms = state.loginMode === "sms";
    return `<main class="login-page"><div class="login-bg"></div><section class="login-card-wrap"><img class="login-avatar" src="assets/login-avatar.png" alt="WorkEasy"/><h1 class="login-title">WorkEasy 数字员工</h1><p class="login-sub">进入您的工作空间</p><form class="login-card" data-login-form><div class="login-tabs"><button type="button" class="${sms?"active":""}" data-action="login-mode" data-value="sms">短信登录</button><button type="button" class="${!sms?"active":""}" data-action="login-mode" data-value="password">密码登录</button></div><div class="login-field"><span class="dial-code">+86</span><input autocomplete="off" placeholder="请输入手机号" /></div>${sms?`<div class="login-field"><input placeholder="请输入短信验证码"/><button class="btn" type="button" style="width:130px;color:#297b70;background:white">获取验证码</button></div>`:`<div class="login-field"><input type="password" placeholder="请输入密码" /></div><div class="login-field"><input placeholder="请输入验证码"/><span class="dial-code" style="width:132px">•••</span></div>`}<button class="login-submit" type="submit">登录</button><p style="margin:18px 0 0;text-align:center;font-size:12px">静态研究版 · 任意内容均可进入</p></form></section><footer class="login-foot"><strong>让 AI 成为您的数字同事</strong><span>WorkEasy 数字员工 · 企业内部应用</span></footer></main>`;
  }

  function mainContent(current) {
    const pages = {
      chat: chatPage, workspace: workspacePage, skills: skillsPage, tools: toolsPage,
      mcp: mcpPage, "cron-jobs": cronPage, "skill-pool": skillPoolPage,
      "mcp-pool": mcpPoolPage, feedback: feedbackPage, "personal-info": personalPage,
      dashboard: dashboardPage, activity: activityPage, channels: channelsPage,
      connectors: connectorsPage, updates: updatesPage,
    };
    return pages[current]();
  }

  function overlay() {
    if (!state.overlay) return "";
    let content = "";
    if (state.overlay === "account") {
      content = `<div class="popover account-menu"><button class="menu-item" data-route="personal-info">👤 个人信息</button><button class="menu-item" data-route="dashboard">▦ 仪表盘</button><button class="menu-item" data-route="activity">◷ 活动记录</button><button class="menu-item" data-action="noop">文　语言　›</button><button class="menu-item" data-action="noop">◐　主题　›</button><button class="menu-item danger" data-route="login">◷ 退出登录</button></div>`;
    } else if (state.overlay === "agent") {
      content = `<div class="popover agent-picker"><div style="display:flex;align-items:center"><button class="icon-btn">‹</button><strong>当前对象</strong><span class="spacer"></span><span class="muted">员工 ›</span></div><input class="search" style="width:100%;margin:8px 0" placeholder="搜索数字员工…"/><div class="connector-item active"><span class="connector-logo"><img src="assets/agent-avatar.png" style="width:100%;height:100%;object-fit:cover"/></span><span><strong>AI助手</strong><small>2091697918041161729</small></span></div></div>`;
    } else if (state.overlay === "avatar") {
      content = `<div class="popover avatar-picker"><div class="muted" style="font-size:11px">仅可使用平台内置头像（公共资源）；未选择时将按名称自动分配。</div><div class="avatar-options">${Array.from({length:7},(_,i)=>`<button class="avatar-option ${i===2?"active":""}" data-action="avatar-demo">${i===2?`<img src="assets/agent-avatar.png"/>`:""}</button>`).join("")}</div></div>`;
    } else if (state.overlay === "community") {
      content = `<div class="popover community-pop"><strong>WorkEasy 交流群</strong><div class="fake-qr">DEMO</div><div class="muted">静态演示二维码</div></div>`;
    }
    return `<div class="overlay"><div class="overlay-backdrop" data-action="close-overlay"></div>${content}</div>`;
  }

  function render() {
    const current = route();
    document.title = current === "login" ? "WorkEasy 数字员工" : "数字员工 · 静态 UI 研究版";
    if (current === "login") app.innerHTML = loginPage();
    else app.innerHTML = `<div class="app-shell">${sidebar(current)}<main class="main">${mainContent(current)}</main></div>${overlay()}${state.toast ? `<div class="toast">${state.toast}</div>` : ""}`;
  }

  function showToast(message) {
    state.toast = message;
    render();
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => { state.toast = ""; render(); }, 1800);
  }

  app.addEventListener("click", (event) => {
    const routeButton = event.target.closest("[data-route]");
    if (routeButton) { navigate(routeButton.dataset.route); return; }
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;
    const { action, value } = actionButton.dataset;
    if (["account", "agent", "avatar", "community"].includes(action)) {
      state.overlay = state.overlay === action ? null : action; render(); return;
    }
    if (action === "close-overlay") { state.overlay = null; render(); return; }
    if (action === "close-updates") { navigate("chat"); return; }
    if (action === "toggle") { actionButton.classList.toggle("on"); showToast(actionButton.classList.contains("on") ? "已在本地启用" : "已在本地停用"); return; }
    if (action === "login-mode") { state.loginMode = value; render(); return; }
    if (action === "mcp-tab") { state.mcpTab = value; render(); return; }
    if (action === "connector") { state.connector = value; render(); return; }
    if (action === "suggest") { const textarea = document.querySelector("#composer"); if (textarea) textarea.value = actionButton.textContent.replace("⭐", "").replace("→", "").trim(); return; }
    if (action === "fullscreen") { document.querySelector(".main")?.requestFullscreen?.(); return; }
    if (action === "publish") { showToast("发布空间入口 · 静态演示"); return; }
    if (action === "local-refresh") { showToast("页面已刷新（本地演示）"); return; }
    if (action === "local-download") { showToast("静态研究版不会下载生产资源"); return; }
    if (action === "new-chat") { showToast("已新建本地演示会话"); return; }
    if (action === "fake-send") { showToast("静态研究版不会发送消息"); return; }
    if (["demo-modal", "avatar-demo", "noop", "collapse"].includes(action)) { showToast("这是纯前端演示，不会产生外部操作"); }
  });

  app.addEventListener("input", (event) => {
    if (event.target.matches('[data-search="skills"]')) {
      state.skillQuery = event.target.value;
      const query = state.skillQuery.toLowerCase();
      document.querySelectorAll(".skill-card").forEach((card) => { card.hidden = !card.dataset.filterable.includes(query); });
    }
    if (event.target.matches('[data-search="tools"]')) {
      state.toolQuery = event.target.value;
      const query = state.toolQuery.toLowerCase();
      document.querySelectorAll(".tool-card").forEach((card) => { card.hidden = !card.textContent.toLowerCase().includes(query); });
    }
  });

  app.addEventListener("submit", (event) => {
    if (event.target.matches("[data-login-form]")) {
      event.preventDefault();
      navigate("chat");
    }
  });

  window.addEventListener("hashchange", render);
  if (!location.hash) location.hash = "#/chat";
  else render();
})();
