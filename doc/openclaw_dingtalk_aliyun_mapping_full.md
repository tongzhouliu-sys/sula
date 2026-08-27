# OpenClaw 本机多 Agent 与钉钉“阿里云专家”机器人绑定阿里云 Agent 完整实施方案

版本：v3.0  
适用时间：2026-08-27  
适用机器：你的 Mac mini / 本机 OpenClaw  
当前实施范围：**只处理一个钉钉机器人“阿里云专家” → 本机 OpenClaw 的阿里云 Agent**  
后续扩展范围：飞书机器人、多钉钉机器人、多云厂商 Agent、总控 Agent

---

## 0. 这份文档解决什么问题

你现在的目标不是重新设计 OpenClaw，也不是重新训练 Agent，而是要把现有本机 OpenClaw 的多个 Agent 与外部机器人做**确定性映射**。

当前真实状态是：

```text
本机 OpenClaw 已经存在多个 Agent
钉钉机器人目前只创建了 1 个：阿里云专家
相关 Client ID / Client Secret 在桌面文件夹的 key 目录中
当前只需要把“钉钉阿里云专家机器人”绑定到“OpenClaw 阿里云 Agent”
```

最终效果：

```text
钉钉用户 @阿里云专家机器人
        ↓
DingTalk Stream / Connector
        ↓
OpenClaw channel = dingtalk-connector
        ↓
accountId = 当前阿里云机器人账号
        ↓
OpenClaw bindings
        ↓
agentId = aliyun / aliyun-agent / 实际本机阿里云 Agent ID
        ↓
阿里云专家 Agent 回答
```

核心目标：

1. 不串 Agent。
2. 不影响现有 Agent。
3. 不泄露 key。
4. 不破坏现有 OpenClaw 配置。
5. 能验证。
6. 能回滚。
7. 后续能扩展到 AWS、GCP、腾讯云、京东云和飞书。

---

## 1. 总体设计原则

### 1.1 不做 LLM 判断路由

不要做这种设计：

```text
用户消息 → 一个总机器人 → LLM 判断是阿里云/AWS/GCP → 再转发给不同 Agent
```

这个方案的问题是：

- LLM 判断会出错。
- 多轮上下文容易混淆。
- 权限边界不清楚。
- 后续审计困难。
- Agent 间串线风险高。

本方案采用确定性路由：

```text
机器人身份 / accountId → 固定 Agent
```

也就是：

```text
钉钉“阿里云专家”机器人 → OpenClaw 阿里云 Agent
```

### 1.2 机器人不是 Agent

在这个系统里：

```text
钉钉机器人 = 入口身份
OpenClaw Agent = 真正执行任务的大脑
Binding = 入口身份和 Agent 的映射规则
```

因此不要把机器人和 Agent 混为一谈。

### 1.3 当前只做最小闭环

当前你只有一个钉钉机器人，所以第一阶段只做：

```text
dingtalk-connector / aliyun-bot → aliyun-agent
```

不要现在就一次性配置 AWS、GCP、腾讯云、京东云的钉钉机器人。等它们的钉钉机器人真正创建好后，再新增对应账号和 Binding。

---

## 2. OpenClaw 映射模型

OpenClaw 多 Agent 路由可以理解为：

```json
{
  "agents": {
    "entries": {
      "aliyun": {
        "workspace": "~/.openclaw/workspace-aliyun"
      },
      "aws": {
        "workspace": "~/.openclaw/workspace-aws"
      }
    }
  },
  "channels": {
    "dingtalk-connector": {
      "accounts": {
        "aliyun-bot": {
          "name": "阿里云专家"
        }
      }
    }
  },
  "bindings": [
    {
      "agentId": "aliyun",
      "match": {
        "channel": "dingtalk-connector",
        "accountId": "aliyun-bot"
      }
    }
  ]
}
```

关键字段解释：

| 字段 | 含义 |
|---|---|
| `agents.entries.aliyun` | OpenClaw 中的阿里云 Agent |
| `channels.dingtalk-connector.accounts.aliyun-bot` | 钉钉阿里云机器人账号 |
| `bindings[].agentId` | 消息最终交给哪个 Agent |
| `bindings[].match.channel` | 消息来自哪个 Channel |
| `bindings[].match.accountId` | 消息来自哪个机器人账号 |

---

## 3. 当前推荐绑定关系

当前只做一条有效绑定：

```text
dingtalk-connector:aliyun-bot → aliyun
```

如果你的真实 Agent ID 不是 `aliyun`，例如是：

```text
aliyun-agent
ali-cloud
aliyun_expert
alibaba-cloud
```

则必须使用本机真实 Agent ID。

所以实际部署时先执行检测：

```bash
openclaw agents list --bindings
```

或者：

```bash
openclaw agents list --bindings --json
```

从输出里找到真正的阿里云 Agent。

---

## 4. 禁止使用的危险绑定

当前阶段不要使用：

```bash
openclaw agents bind --agent aliyun --bind 'dingtalk-connector:*'
```

原因：

```text
accountId = * 代表该 channel 下所有账号兜底匹配
```

你以后增加：

```text
aws-bot
gcp-bot
tencent-bot
jdcloud-bot
```

如果之前存在：

```text
dingtalk-connector:* → aliyun
```

就可能导致所有钉钉机器人都路由到阿里云 Agent。

正确方式是显式绑定：

```text
dingtalk-connector:aliyun-bot → aliyun
dingtalk-connector:aws-bot → aws
dingtalk-connector:gcp-bot → gcp
```

---

## 5. 文件和目录约定

建议在桌面创建：

```text
~/Desktop/openclaw-dingtalk-aliyun/
├── key/
│   ├── client_id.txt
│   └── client_secret.txt
├── scripts/
│   ├── 00_PRECHECK_DINGTALK_ALIYUN.command
│   ├── 01_DEPLOY_DINGTALK_ALIYUN.command
│   ├── 02_VERIFY_DINGTALK_ALIYUN.command
│   └── ROLLBACK_DINGTALK_ALIYUN.command
├── backup/
├── report/
└── README.md
```

如果你现在的文件夹已经创建好了，只要满足：

```text
桌面某个目录/key/
```

里面能找到钉钉机器人的 Client ID 和 Client Secret 即可。

脚本会优先搜索：

```text
~/Desktop/openclaw-dingtalk-aliyun/key
~/Desktop/openclaw-bot-mapping/key
~/Desktop/key
```

---

## 6. Secret 安全原则

不要把以下内容发到聊天中：

```text
DingTalk Client Secret
DingTalk App Secret
Feishu App Secret
OpenAI API Key
OpenClaw Gateway Token
Mac 登录密码
SSH 私钥
完整未脱敏 openclaw.json
```

本方案采用本机读取方式：

```text
key 只在 Mac mini 本机读取
Secret 不进入聊天
Secret 不写入部署报告
Secret 不打印到终端
Secret 文件权限设置为 600
父目录权限设置为 700
```

建议将钉钉密钥迁移到：

```text
~/.openclaw/credentials/dingtalk/aliyun/client_id
~/.openclaw/credentials/dingtalk/aliyun/client_secret
```

权限：

```bash
chmod 700 ~/.openclaw/credentials
chmod 700 ~/.openclaw/credentials/dingtalk
chmod 700 ~/.openclaw/credentials/dingtalk/aliyun
chmod 600 ~/.openclaw/credentials/dingtalk/aliyun/client_id
chmod 600 ~/.openclaw/credentials/dingtalk/aliyun/client_secret
```

---

## 7. 部署前检查清单

执行前确认：

- [ ] Mac mini 可以打开终端。
- [ ] 本机已经安装 OpenClaw。
- [ ] `openclaw --version` 能正常输出。
- [ ] `openclaw agents list --bindings` 能正常输出。
- [ ] 本机已经存在阿里云 Agent。
- [ ] 钉钉开放平台已经创建“阿里云专家”机器人。
- [ ] 钉钉机器人已启用 Stream 模式或 Connector 所需能力。
- [ ] 钉钉机器人已经发布或可测试。
- [ ] 钉钉 Client ID / Client Secret 已放到桌面文件夹的 `key` 目录中。
- [ ] 当前阶段只绑定钉钉阿里云机器人，不绑定飞书，不绑定其他云厂商机器人。

---

## 8. Phase 0：只读预检

目标：只检查，不修改。

新建文件：

```text
~/Desktop/openclaw-dingtalk-aliyun/scripts/00_PRECHECK_DINGTALK_ALIYUN.command
```

内容如下：

```bash
#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Desktop/openclaw-dingtalk-aliyun"
REPORT_DIR="$ROOT/report"
mkdir -p "$REPORT_DIR"

REPORT="$REPORT_DIR/precheck-$(date +%Y%m%d-%H%M%S).txt"

{
  echo "# OpenClaw DingTalk Aliyun Precheck"
  echo "time: $(date)"
  echo "user: $(whoami)"
  echo "home: $HOME"
  echo

  echo "## 1. openclaw command"
  if command -v openclaw >/dev/null 2>&1; then
    command -v openclaw
  else
    echo "ERROR: openclaw command not found"
  fi
  echo

  echo "## 2. openclaw version"
  openclaw --version 2>&1 || true
  echo

  echo "## 3. openclaw status"
  openclaw status --all 2>&1 || true
  echo

  echo "## 4. agents list"
  openclaw agents list --bindings 2>&1 || true
  echo

  echo "## 5. agents json"
  openclaw agents list --bindings --json 2>&1 || true
  echo

  echo "## 6. config path candidates"
  for f in \
    "$HOME/.openclaw/openclaw.json" \
    "$HOME/.openclaw/config.json" \
    "$HOME/Library/Application Support/OpenClaw/openclaw.json"; do
    if [ -f "$f" ]; then
      echo "FOUND: $f"
      ls -l "$f"
    else
      echo "MISSING: $f"
    fi
  done
  echo

  echo "## 7. key directory candidates"
  for d in \
    "$ROOT/key" \
    "$HOME/Desktop/openclaw-bot-mapping/key" \
    "$HOME/Desktop/key"; do
    if [ -d "$d" ]; then
      echo "FOUND: $d"
      find "$d" -maxdepth 1 -type f -print | sed 's#^.*/#  - #' || true
    else
      echo "MISSING: $d"
    fi
  done
  echo

  echo "## 8. installed plugins / channels"
  openclaw plugins list 2>&1 || true
  openclaw channels list 2>&1 || true
  echo

  echo "## 9. doctor"
  openclaw doctor 2>&1 || true

} > "$REPORT" 2>&1

echo "Precheck report created: $REPORT"
open "$REPORT" 2>/dev/null || true
```

执行：

```bash
chmod +x ~/Desktop/openclaw-dingtalk-aliyun/scripts/00_PRECHECK_DINGTALK_ALIYUN.command
~/Desktop/openclaw-dingtalk-aliyun/scripts/00_PRECHECK_DINGTALK_ALIYUN.command
```

预检输出在：

```text
~/Desktop/openclaw-dingtalk-aliyun/report/
```

---

## 9. Phase 1：安装或确认钉钉 Connector

如果已经安装钉钉官方 Connector，则只检查版本。

如果未安装，执行：

```bash
npx -y @dingtalk-real-ai/dingtalk-connector install
```

然后检查：

```bash
openclaw plugins list
openclaw channels list
```

期望看到类似：

```text
dingtalk-connector
```

如果 Channel 名称不是 `dingtalk-connector`，必须以本机实际输出为准。

---

## 10. Phase 2：准备钉钉密钥

新建文件：

```text
~/Desktop/openclaw-dingtalk-aliyun/scripts/01_PREPARE_DINGTALK_SECRET.command
```

内容如下：

```bash
#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Desktop/openclaw-dingtalk-aliyun"
REPORT_DIR="$ROOT/report"
mkdir -p "$REPORT_DIR"

TARGET_DIR="$HOME/.openclaw/credentials/dingtalk/aliyun"
mkdir -p "$TARGET_DIR"
chmod 700 "$HOME/.openclaw" 2>/dev/null || true
chmod 700 "$HOME/.openclaw/credentials" 2>/dev/null || true
chmod 700 "$HOME/.openclaw/credentials/dingtalk" 2>/dev/null || true
chmod 700 "$TARGET_DIR"

KEY_DIR=""
for d in \
  "$ROOT/key" \
  "$HOME/Desktop/openclaw-bot-mapping/key" \
  "$HOME/Desktop/key"; do
  if [ -d "$d" ]; then
    KEY_DIR="$d"
    break
  fi
done

if [ -z "$KEY_DIR" ]; then
  echo "ERROR: key directory not found. Expected one of:"
  echo "  $ROOT/key"
  echo "  $HOME/Desktop/openclaw-bot-mapping/key"
  echo "  $HOME/Desktop/key"
  exit 1
fi

echo "Using key directory: $KEY_DIR"

CLIENT_ID_FILE=""
CLIENT_SECRET_FILE=""

# Common names
for f in \
  "$KEY_DIR/client_id" \
  "$KEY_DIR/client_id.txt" \
  "$KEY_DIR/clientId" \
  "$KEY_DIR/clientId.txt" \
  "$KEY_DIR/app_key" \
  "$KEY_DIR/app_key.txt" \
  "$KEY_DIR/appkey" \
  "$KEY_DIR/appkey.txt"; do
  if [ -f "$f" ]; then
    CLIENT_ID_FILE="$f"
    break
  fi
done

for f in \
  "$KEY_DIR/client_secret" \
  "$KEY_DIR/client_secret.txt" \
  "$KEY_DIR/clientSecret" \
  "$KEY_DIR/clientSecret.txt" \
  "$KEY_DIR/app_secret" \
  "$KEY_DIR/app_secret.txt" \
  "$KEY_DIR/appsecret" \
  "$KEY_DIR/appsecret.txt"; do
  if [ -f "$f" ]; then
    CLIENT_SECRET_FILE="$f"
    break
  fi
done

# If files are not named normally, try to infer by content labels from .env-like file.
if [ -z "$CLIENT_ID_FILE" ] || [ -z "$CLIENT_SECRET_FILE" ]; then
  ENV_FILE=""
  for f in "$KEY_DIR"/*.env "$KEY_DIR"/*.txt "$KEY_DIR"/*.key; do
    [ -f "$f" ] || continue
    if grep -Eiq 'CLIENT_ID|CLIENT_SECRET|APP_KEY|APP_SECRET|DINGTALK' "$f"; then
      ENV_FILE="$f"
      break
    fi
  done

  if [ -n "$ENV_FILE" ]; then
    echo "Parsing env-like key file: $(basename "$ENV_FILE")"
    CID=$(grep -E 'CLIENT_ID|APP_KEY|APPKEY' "$ENV_FILE" | head -n1 | sed -E 's/^[^=]+=[[:space:]]*//' | tr -d '"' | tr -d "'" || true)
    CSEC=$(grep -E 'CLIENT_SECRET|APP_SECRET|APPSECRET' "$ENV_FILE" | head -n1 | sed -E 's/^[^=]+=[[:space:]]*//' | tr -d '"' | tr -d "'" || true)
    if [ -n "${CID:-}" ]; then
      printf '%s' "$CID" > "$TARGET_DIR/client_id"
      CLIENT_ID_FILE="$TARGET_DIR/client_id"
    fi
    if [ -n "${CSEC:-}" ]; then
      printf '%s' "$CSEC" > "$TARGET_DIR/client_secret"
      CLIENT_SECRET_FILE="$TARGET_DIR/client_secret"
    fi
  fi
fi

if [ -z "$CLIENT_ID_FILE" ]; then
  echo "ERROR: Client ID file not found. Put it in key/client_id.txt or key/app_key.txt"
  exit 1
fi

if [ -z "$CLIENT_SECRET_FILE" ]; then
  echo "ERROR: Client Secret file not found. Put it in key/client_secret.txt or key/app_secret.txt"
  exit 1
fi

if [ "$CLIENT_ID_FILE" != "$TARGET_DIR/client_id" ]; then
  tr -d '\n\r' < "$CLIENT_ID_FILE" > "$TARGET_DIR/client_id"
fi

if [ "$CLIENT_SECRET_FILE" != "$TARGET_DIR/client_secret" ]; then
  tr -d '\n\r' < "$CLIENT_SECRET_FILE" > "$TARGET_DIR/client_secret"
fi

chmod 600 "$TARGET_DIR/client_id"
chmod 600 "$TARGET_DIR/client_secret"

echo "DingTalk credential files prepared:"
echo "  $TARGET_DIR/client_id"
echo "  $TARGET_DIR/client_secret"
echo "Client ID length: $(wc -c < "$TARGET_DIR/client_id" | tr -d ' ')"
echo "Client Secret length: $(wc -c < "$TARGET_DIR/client_secret" | tr -d ' ')"
echo "Secret values are not printed."
```

执行：

```bash
chmod +x ~/Desktop/openclaw-dingtalk-aliyun/scripts/01_PREPARE_DINGTALK_SECRET.command
~/Desktop/openclaw-dingtalk-aliyun/scripts/01_PREPARE_DINGTALK_SECRET.command
```

---

## 11. Phase 3：检测阿里云 Agent ID

优先按以下规则识别：

1. Agent ID 精确为 `aliyun`。
2. Agent ID 包含 `aliyun`。
3. Agent 名称包含 `阿里云`。
4. workspace 路径包含 `aliyun`。
5. agentDir 路径包含 `aliyun`。

如果识别到多个候选，必须人工确认，不能自动绑定。

手动查看：

```bash
openclaw agents list --bindings
```

你要找到类似：

```text
aliyun
aliyun-agent
阿里云专家
```

并记录真实 ID。

---

## 12. Phase 4：部署绑定

新建文件：

```text
~/Desktop/openclaw-dingtalk-aliyun/scripts/02_DEPLOY_DINGTALK_ALIYUN.command
```

内容如下：

```bash
#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Desktop/openclaw-dingtalk-aliyun"
BACKUP_DIR="$ROOT/backup/$(date +%Y%m%d-%H%M%S)"
REPORT_DIR="$ROOT/report"
mkdir -p "$BACKUP_DIR" "$REPORT_DIR"

CHANNEL="dingtalk-connector"
ACCOUNT_ID="aliyun-bot"
BOT_NAME="阿里云专家"
CRED_DIR="$HOME/.openclaw/credentials/dingtalk/aliyun"

REPORT="$REPORT_DIR/deploy-$(date +%Y%m%d-%H%M%S).txt"

log() {
  echo "$*" | tee -a "$REPORT"
}

fail() {
  log "ERROR: $*"
  exit 1
}

log "# Deploy DingTalk Aliyun Bot Binding"
log "time: $(date)"
log "root: $ROOT"
log "backup: $BACKUP_DIR"
log "channel: $CHANNEL"
log "accountId: $ACCOUNT_ID"
log "botName: $BOT_NAME"
log ""

command -v openclaw >/dev/null 2>&1 || fail "openclaw command not found"

[ -f "$CRED_DIR/client_id" ] || fail "missing $CRED_DIR/client_id"
[ -f "$CRED_DIR/client_secret" ] || fail "missing $CRED_DIR/client_secret"

log "## OpenClaw version"
openclaw --version 2>&1 | tee -a "$REPORT" || true
log ""

log "## Backup existing config"
CONFIG_FILE=""
for f in \
  "$HOME/.openclaw/openclaw.json" \
  "$HOME/.openclaw/config.json" \
  "$HOME/Library/Application Support/OpenClaw/openclaw.json"; do
  if [ -f "$f" ]; then
    CONFIG_FILE="$f"
    break
  fi
done

if [ -z "$CONFIG_FILE" ]; then
  fail "OpenClaw config file not found"
fi

cp "$CONFIG_FILE" "$BACKUP_DIR/$(basename "$CONFIG_FILE").bak"
log "Config backed up: $CONFIG_FILE"
log ""

log "## Capture current agents and bindings"
openclaw agents list --bindings > "$BACKUP_DIR/agents-bindings.before.txt" 2>&1 || true
openclaw agents list --bindings --json > "$BACKUP_DIR/agents-bindings.before.json" 2>&1 || true
log "Saved agent snapshots in backup dir"
log ""

log "## Detect Aliyun agent"
AGENTS_JSON="$BACKUP_DIR/agents-bindings.before.json"
AGENT_ID=""

if command -v jq >/dev/null 2>&1 && jq empty "$AGENTS_JSON" >/dev/null 2>&1; then
  # Try common JSON shapes.
  AGENT_ID=$(jq -r '
    [
      .. | objects | select((.id? // "") == "aliyun") | .id,
      .. | objects | select((.agentId? // "") == "aliyun") | .agentId,
      .. | objects | select((.id? // "") | test("aliyun|ali[-_]?cloud|alibaba"; "i")) | .id,
      .. | objects | select((.agentId? // "") | test("aliyun|ali[-_]?cloud|alibaba"; "i")) | .agentId,
      .. | objects | select((.name? // "") | test("阿里云|aliyun|alibaba"; "i")) | (.id? // .agentId? // empty),
      .. | objects | select((.workspace? // "") | test("aliyun|alibaba"; "i")) | (.id? // .agentId? // empty)
    ] | map(select(. != null and . != "")) | unique | .[]' "$AGENTS_JSON" | head -n 5 | tr '\n' ' ' | sed 's/[[:space:]]*$//')
fi

if [ -z "$AGENT_ID" ]; then
  log "Could not auto-detect Aliyun agent from JSON."
  log "Current agents:"
  cat "$BACKUP_DIR/agents-bindings.before.txt" | tee -a "$REPORT" || true
  log ""
  read -r -p "Please input exact Aliyun Agent ID: " AGENT_ID
fi

CANDIDATE_COUNT=$(printf '%s\n' $AGENT_ID | wc -l | tr -d ' ')
if [ "$CANDIDATE_COUNT" != "1" ]; then
  log "Multiple candidate Agent IDs detected: $AGENT_ID"
  read -r -p "Please input exact Aliyun Agent ID: " AGENT_ID
fi

[ -n "$AGENT_ID" ] || fail "empty Agent ID"
log "Using Aliyun Agent ID: $AGENT_ID"
log ""

log "## Install or verify DingTalk connector"
if openclaw plugins list 2>/dev/null | grep -Eiq 'dingtalk|ding'; then
  log "DingTalk connector appears installed."
else
  log "Installing DingTalk connector..."
  npx -y @dingtalk-real-ai/dingtalk-connector install 2>&1 | tee -a "$REPORT"
fi
log ""

log "## Configure DingTalk account"
log "This step depends on installed connector schema."
log "Preferred accountId: $ACCOUNT_ID"
log "Credential files: $CRED_DIR/client_id and $CRED_DIR/client_secret"
log ""

# First try official/openclaw CLI binding. It is safer than hand-editing JSON.
log "## Apply binding"
set +e
openclaw agents bind --agent "$AGENT_ID" --bind "$CHANNEL:$ACCOUNT_ID" 2>&1 | tee -a "$REPORT"
BIND_EXIT=${PIPESTATUS[0]}
set -e

if [ "$BIND_EXIT" -ne 0 ]; then
  log "Explicit account binding failed. Trying channel default binding only."
  log "This is acceptable only while there is one DingTalk account."
  set +e
  openclaw agents bind --agent "$AGENT_ID" --bind "$CHANNEL" 2>&1 | tee -a "$REPORT"
  BIND_EXIT=${PIPESTATUS[0]}
  set -e
fi

if [ "$BIND_EXIT" -ne 0 ]; then
  fail "openclaw agents bind failed. Check report: $REPORT"
fi

log ""
log "## Restart gateway"
set +e
openclaw gateway restart 2>&1 | tee -a "$REPORT"
GW_EXIT=${PIPESTATUS[0]}
set -e

if [ "$GW_EXIT" -ne 0 ]; then
  log "gateway restart command failed or is unsupported. Trying generic restart/status commands."
  openclaw restart 2>&1 | tee -a "$REPORT" || true
fi

log ""
log "## Post-deploy status"
openclaw agents list --bindings > "$BACKUP_DIR/agents-bindings.after.txt" 2>&1 || true
openclaw agents list --bindings --json > "$BACKUP_DIR/agents-bindings.after.json" 2>&1 || true
openclaw agents list --bindings 2>&1 | tee -a "$REPORT" || true
openclaw status --all 2>&1 | tee -a "$REPORT" || true

log ""
log "Deployment finished."
log "Report: $REPORT"
log "Backup: $BACKUP_DIR"
```

执行：

```bash
chmod +x ~/Desktop/openclaw-dingtalk-aliyun/scripts/02_DEPLOY_DINGTALK_ALIYUN.command
~/Desktop/openclaw-dingtalk-aliyun/scripts/02_DEPLOY_DINGTALK_ALIYUN.command
```

---

## 13. Phase 5：验收测试

新建文件：

```text
~/Desktop/openclaw-dingtalk-aliyun/scripts/03_VERIFY_DINGTALK_ALIYUN.command
```

内容如下：

```bash
#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Desktop/openclaw-dingtalk-aliyun"
REPORT_DIR="$ROOT/report"
mkdir -p "$REPORT_DIR"
REPORT="$REPORT_DIR/verify-$(date +%Y%m%d-%H%M%S).txt"

{
  echo "# Verify DingTalk Aliyun Binding"
  echo "time: $(date)"
  echo

  echo "## 1. version"
  openclaw --version 2>&1 || true
  echo

  echo "## 2. status"
  openclaw status --all 2>&1 || true
  echo

  echo "## 3. agents bindings"
  openclaw agents list --bindings 2>&1 || true
  echo

  echo "## 4. plugins"
  openclaw plugins list 2>&1 || true
  echo

  echo "## 5. channels"
  openclaw channels list 2>&1 || true
  echo

  echo "## 6. manual DingTalk test cases"
  cat <<'CASES'
在钉钉里对“阿里云专家”机器人发送：

1. 你是谁？你当前绑定的是哪个 Agent？
期望：回答自己是阿里云专家 / 阿里云 Agent。

2. 请只用一句话说明 ECS 安全组是什么。
期望：回答阿里云 ECS 安全组概念。

3. 请说明你不是 AWS/GCP/腾讯云/JDCloud 专家。
期望：不会自称 AWS 或 GCP Agent。

4. 连续追问：刚才说的安全组如何限制 22 端口？
期望：保持阿里云上下文。

5. 重启 OpenClaw 后再次发送：你是谁？
期望：仍然路由到阿里云 Agent。
CASES

} > "$REPORT" 2>&1

echo "Verify report created: $REPORT"
open "$REPORT" 2>/dev/null || true
```

执行：

```bash
chmod +x ~/Desktop/openclaw-dingtalk-aliyun/scripts/03_VERIFY_DINGTALK_ALIYUN.command
~/Desktop/openclaw-dingtalk-aliyun/scripts/03_VERIFY_DINGTALK_ALIYUN.command
```

---

## 14. 验收标准

必须全部通过：

- [ ] `openclaw agents list --bindings` 能看到钉钉绑定。
- [ ] 钉钉“阿里云专家”机器人能收到消息。
- [ ] 钉钉机器人能回复消息。
- [ ] 回答身份是阿里云专家。
- [ ] 不会路由到 main/default/AWS/GCP Agent。
- [ ] 重启 Gateway 后绑定仍然存在。
- [ ] Secret 没有出现在部署日志里。
- [ ] 原有 OpenClaw 配置有备份。
- [ ] 回滚脚本可执行。

---

## 15. 回滚方案

新建文件：

```text
~/Desktop/openclaw-dingtalk-aliyun/scripts/ROLLBACK_DINGTALK_ALIYUN.command
```

内容如下：

```bash
#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Desktop/openclaw-dingtalk-aliyun"
BACKUP_ROOT="$ROOT/backup"

if [ ! -d "$BACKUP_ROOT" ]; then
  echo "ERROR: backup directory not found: $BACKUP_ROOT"
  exit 1
fi

LATEST_BACKUP=$(find "$BACKUP_ROOT" -maxdepth 1 -type d | sort | tail -n 1)

if [ -z "$LATEST_BACKUP" ] || [ "$LATEST_BACKUP" = "$BACKUP_ROOT" ]; then
  echo "ERROR: no backup found"
  exit 1
fi

echo "Latest backup: $LATEST_BACKUP"
ls -l "$LATEST_BACKUP"

read -r -p "Restore latest OpenClaw config backup? Type YES to continue: " CONFIRM
if [ "$CONFIRM" != "YES" ]; then
  echo "Rollback cancelled."
  exit 0
fi

CONFIG_FILE=""
for f in \
  "$HOME/.openclaw/openclaw.json" \
  "$HOME/.openclaw/config.json" \
  "$HOME/Library/Application Support/OpenClaw/openclaw.json"; do
  if [ -f "$f" ]; then
    CONFIG_FILE="$f"
    break
  fi
done

if [ -z "$CONFIG_FILE" ]; then
  echo "ERROR: current OpenClaw config file not found"
  exit 1
fi

BACKUP_FILE=$(find "$LATEST_BACKUP" -maxdepth 1 -type f -name '*.bak' | head -n 1)
if [ -z "$BACKUP_FILE" ]; then
  echo "ERROR: backup .bak file not found in $LATEST_BACKUP"
  exit 1
fi

cp "$CONFIG_FILE" "$CONFIG_FILE.before-rollback-$(date +%Y%m%d-%H%M%S)"
cp "$BACKUP_FILE" "$CONFIG_FILE"

echo "Restored: $CONFIG_FILE"

openclaw gateway restart 2>&1 || openclaw restart 2>&1 || true
openclaw agents list --bindings 2>&1 || true
openclaw status --all 2>&1 || true

echo "Rollback finished."
```

执行：

```bash
chmod +x ~/Desktop/openclaw-dingtalk-aliyun/scripts/ROLLBACK_DINGTALK_ALIYUN.command
~/Desktop/openclaw-dingtalk-aliyun/scripts/ROLLBACK_DINGTALK_ALIYUN.command
```

---

## 16. 常见问题处理

### 16.1 `openclaw: command not found`

说明 OpenClaw CLI 不在 PATH。

检查：

```bash
ls -la /usr/local/bin/openclaw
ls -la /opt/homebrew/bin/openclaw
ls -la ~/.local/bin/openclaw
```

临时加入 PATH：

```bash
export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.local/bin:$PATH"
```

### 16.2 找不到阿里云 Agent

执行：

```bash
openclaw agents list --bindings
```

手动确认哪个是阿里云 Agent。

如果没有，需要先创建：

```bash
openclaw agents add aliyun \
  --workspace ~/.openclaw/workspace-aliyun \
  --non-interactive
```

### 16.3 钉钉 Connector 安装失败

检查 Node 和 npm：

```bash
node -v
npm -v
npx -v
```

重新安装：

```bash
npx -y @dingtalk-real-ai/dingtalk-connector install
```

### 16.4 钉钉机器人没回复

检查：

- 钉钉应用是否发布。
- 机器人能力是否启用。
- Stream 模式是否启用。
- Client ID 和 Secret 是否正确。
- OpenClaw Gateway 是否运行。
- Connector 是否显示在线。
- 群聊里是否需要 @机器人。
- 私聊是否需要 pairing。

### 16.5 回复到了错误 Agent

检查 bindings：

```bash
openclaw agents list --bindings
```

确认是否存在：

```text
dingtalk-connector:*
```

如果存在，删除或回滚。

正确绑定应该是：

```text
dingtalk-connector:aliyun-bot → aliyun
```

或者在单机器人默认账号阶段：

```text
dingtalk-connector → aliyun
```

---

## 17. 将来扩展到多个钉钉机器人

当你创建第二个钉钉机器人，比如 AWS 专家后，配置应该变成：

```json
{
  "channels": {
    "dingtalk-connector": {
      "accounts": {
        "aliyun-bot": {
          "name": "阿里云专家"
        },
        "aws-bot": {
          "name": "AWS专家"
        }
      }
    }
  },
  "bindings": [
    {
      "agentId": "aliyun",
      "match": {
        "channel": "dingtalk-connector",
        "accountId": "aliyun-bot"
      }
    },
    {
      "agentId": "aws",
      "match": {
        "channel": "dingtalk-connector",
        "accountId": "aws-bot"
      }
    }
  ]
}
```

不要使用：

```text
dingtalk-connector:*
```

---

## 18. 将来扩展到飞书

飞书也采用同样模型：

```text
feishu:aliyun-bot → aliyun
feishu:aws-bot → aws
feishu:gcp-bot → gcp
```

整体结构：

```text
aliyun Agent
  ├── 钉钉 aliyun-bot
  └── 飞书 aliyun-bot

aws Agent
  ├── 钉钉 aws-bot
  └── 飞书 aws-bot

gcp Agent
  ├── 钉钉 gcp-bot
  └── 飞书 gcp-bot
```

---

## 19. 推荐最终映射表

| Agent | 钉钉机器人 | 飞书机器人 | 当前状态 |
|---|---|---|---|
| aliyun | 阿里云专家 | 阿里云专家 | 本阶段实施 |
| tencent | 腾讯云专家 | 腾讯云专家 | 以后实施 |
| aws | AWS 专家 | AWS 专家 | 以后实施 |
| gcp | GCP 专家 | GCP 专家 | 以后实施 |
| jdcloud | 京东云专家 | 京东云专家 | 以后实施 |
| cloud-manager | 云平台总控 | 云平台总控 | 以后实施 |

---

## 20. 推荐安全策略

### 20.1 私聊

建议初始采用：

```text
只允许你本人使用
```

或者：

```text
pairing 模式
```

### 20.2 群聊

建议初始关闭群聊。

如果必须进群：

```text
必须 @机器人
只允许指定群
只允许指定成员触发高权限能力
```

### 20.3 本机权限

建议初始策略：

| 能力 | 默认策略 |
|---|---|
| 读文件 | 只允许知识库目录 |
| 写文件 | 需要确认 |
| 执行 shell | 默认禁止或每次确认 |
| 修改代码 | 默认禁止或每次确认 |
| 访问密钥 | 禁止 Agent 直接读取 |
| 操作浏览器 | 需要确认 |
| 调用外部 API | 按 Agent 白名单 |

---

## 21. 部署报告模板

部署完成后，在 `report` 目录中保存：

```text
部署时间：
机器：Mac mini
OpenClaw 版本：
钉钉 Connector 状态：
绑定前 Agent 列表：
绑定后 Agent 列表：
阿里云 Agent ID：
钉钉 Channel ID：dingtalk-connector
钉钉 accountId：aliyun-bot
Secret 存储位置：~/.openclaw/credentials/dingtalk/aliyun
是否通过私聊测试：
是否通过群聊测试：
是否通过重启持久化测试：
是否存在 dingtalk-connector:*：否
回滚备份目录：
```

---

## 22. 一次性执行顺序

完整顺序：

```bash
mkdir -p ~/Desktop/openclaw-dingtalk-aliyun/scripts
mkdir -p ~/Desktop/openclaw-dingtalk-aliyun/key
mkdir -p ~/Desktop/openclaw-dingtalk-aliyun/report
mkdir -p ~/Desktop/openclaw-dingtalk-aliyun/backup
```

把钉钉 key 放入：

```text
~/Desktop/openclaw-dingtalk-aliyun/key/client_id.txt
~/Desktop/openclaw-dingtalk-aliyun/key/client_secret.txt
```

然后依次执行：

```bash
~/Desktop/openclaw-dingtalk-aliyun/scripts/00_PRECHECK_DINGTALK_ALIYUN.command
~/Desktop/openclaw-dingtalk-aliyun/scripts/01_PREPARE_DINGTALK_SECRET.command
~/Desktop/openclaw-dingtalk-aliyun/scripts/02_DEPLOY_DINGTALK_ALIYUN.command
~/Desktop/openclaw-dingtalk-aliyun/scripts/03_VERIFY_DINGTALK_ALIYUN.command
```

若失败：

```bash
~/Desktop/openclaw-dingtalk-aliyun/scripts/ROLLBACK_DINGTALK_ALIYUN.command
```

---

## 23. 给 OpenClaw 执行的任务指令

如果你想把这件事直接交给本机 OpenClaw，可以把下面这段复制给它：

```text
请在本机执行“钉钉阿里云专家机器人绑定 OpenClaw 阿里云 Agent”的部署任务。

当前范围：
1. 只处理钉钉机器人“阿里云专家”。
2. 只绑定到本机 OpenClaw 的阿里云 Agent。
3. 不处理飞书。
4. 不处理 AWS/GCP/腾讯云/京东云机器人。
5. 不使用 dingtalk-connector:* 通配绑定。

安全要求：
1. 不在日志中打印任何 Secret。
2. 先备份 OpenClaw 配置。
3. 先做只读预检。
4. 自动识别阿里云 Agent ID；如存在多个候选，停止并要求人工确认。
5. 将钉钉 Client ID / Client Secret 从桌面 key 文件夹迁移到 ~/.openclaw/credentials/dingtalk/aliyun。
6. 设置目录权限 700，文件权限 600。
7. 绑定完成后重启 Gateway。
8. 输出部署报告。
9. 提供回滚脚本。

执行顺序：
Phase 0：只读预检。
Phase 1：准备钉钉密钥。
Phase 2：安装或确认钉钉 Connector。
Phase 3：识别阿里云 Agent ID。
Phase 4：绑定 dingtalk-connector:aliyun-bot 到阿里云 Agent。
Phase 5：重启 Gateway。
Phase 6：验收测试。
Phase 7：生成部署报告。

验收标准：
1. openclaw agents list --bindings 能看到钉钉绑定。
2. 钉钉“阿里云专家”机器人回复身份为阿里云专家。
3. 不路由到 main/default/AWS/GCP Agent。
4. 重启后绑定仍存在。
5. Secret 未出现在任何报告或日志中。
```

---

## 24. 参考资料

以下是本方案依赖的公开资料方向，执行时以你本机 `openclaw --version` 和 `openclaw config/schema` 为准：

- OpenClaw Multi-agent routing / Agent bindings
- OpenClaw CLI agents / `openclaw agents bind --agent <id> --bind <channel[:accountId]>`
- OpenClaw configuration agents / `agents.entries`
- DingTalk official OpenClaw connector
- DingTalk connector multi-agent setup

---

## 25. 最终结论

当前最稳方案是：

```text
只创建一条精确绑定：
钉钉“阿里云专家”机器人 → OpenClaw 阿里云 Agent
```

执行策略：

```text
只读预检
→ 准备 Secret
→ 安装/确认 Connector
→ 识别真实阿里云 Agent ID
→ 备份配置
→ 应用 binding
→ 重启 Gateway
→ 钉钉实测
→ 生成报告
→ 保留回滚
```

不要现在引入总控路由，不要使用通配绑定，不要把所有云厂商机器人一次性预配置到阿里云 Agent。

