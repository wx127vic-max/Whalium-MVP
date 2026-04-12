# Whalium 部署指南
**从 demo 到真实上线 — 最低成本方案**

---

## 一、架构总览

```
用户浏览器（中国 / 海外）
       ↓
  Cloudflare CDN   ← 全球加速 + 中国可访问
       ↓
  GitHub Pages     ← 免费静态托管
       ↓
  whalium.com      ← 你的域名（约 $10/年）
```

**全年运营成本：域名 ~$10。其余全部免费。**

---

## 二、第一步：准备 GitHub 仓库

### 2.1 新建仓库

1. 登录 [github.com](https://github.com)，点击右上角 **New repository**
2. 仓库名：`whalium` （或任意名称）
3. 可见性：**Public**（GitHub Pages 免费版要求 Public）
4. 点击 **Create repository**

### 2.2 上传所有 HTML 文件

将以下文件全部上传到仓库根目录：

```
whalium_1_index.html       → 重命名为  index.html
whalium_2_login.html
whalium_3_register.html
whalium_4_firm-detail.html
whalium_5_payment.html
whalium_6_landing.html
whalium_7_submit-firm.html
whalium_8_dashboard.html
whalium_9_about.html
```

> ⚠️ **重要：`whalium_1_index.html` 必须重命名为 `index.html`**，
> 这样访问根域名时才会自动加载首页。

命令行上传方式：

```bash
git clone https://github.com/YOUR_USERNAME/whalium.git
cd whalium
cp /path/to/whalium_1_index.html index.html
cp /path/to/whalium_*.html .
git add .
git commit -m "Initial Whalium MVP"
git push
```

### 2.3 开启 GitHub Pages

1. 仓库页面 → **Settings** → **Pages**
2. Source：**Deploy from a branch**
3. Branch：`main`，文件夹：`/ (root)`
4. 点击 **Save**
5. 等待约 1 分钟，会显示 `https://YOUR_USERNAME.github.io/whalium/`

---

## 三、第二步：购买域名

推荐注册商（均支持国内支付）：

| 注册商 | 推荐原因 | .com 价格 |
|--------|----------|-----------|
| **Cloudflare Registrar** | 成本价，无续费加价，与后续 CDN 无缝集成 | ~$9.15/年 |
| Namesilo | 价格透明，支持支付宝 | ~$9/年 |
| 阿里云（万网） | 国内管理方便，支持微信支付 | ~¥69/年 |

**建议域名：** `whalium.com` 或 `whalium.cn`（两个都注册，约 $20 保护品牌）

---

## 四、第三步：配置 Cloudflare

### 4.1 为什么要用 Cloudflare

- **中国大陆可访问**：Cloudflare 的节点在香港、日本，绕过直连 GitHub Pages 在国内的不稳定
- **免费 SSL**：自动 HTTPS
- **DDoS 防护**：免费套餐已包含
- **零配置 CDN**：全球加速

### 4.2 配置步骤

1. 注册 [cloudflare.com](https://cloudflare.com)，点击 **Add a Site**
2. 输入你的域名（如 `whalium.com`），选择 **Free 套餐**
3. Cloudflare 会扫描现有 DNS 记录
4. 在域名注册商处将 **Nameservers 改为 Cloudflare 提供的两个 NS**
   - 例：`ada.ns.cloudflare.com` 和 `bob.ns.cloudflare.com`
5. 等待 DNS 传播（通常 5–30 分钟）

### 4.3 添加 DNS 记录（指向 GitHub Pages）

在 Cloudflare DNS 控制台添加以下记录：

```
类型    名称    内容                          代理状态
CNAME   www     YOUR_USERNAME.github.io      ✅ 已代理（橙色云）
CNAME   @       YOUR_USERNAME.github.io      ✅ 已代理（橙色云）
```

### 4.4 配置 GitHub Pages 自定义域名

1. GitHub 仓库 → **Settings** → **Pages**
2. Custom domain：填入 `www.whalium.com`
3. 勾选 **Enforce HTTPS**
4. 在仓库根目录新建文件 `CNAME`，内容只有一行：
   ```
   www.whalium.com
   ```

### 4.5 验证

访问 `https://www.whalium.com` ——出现首页即成功。

---

## 五、各页面 URL 对照表

上线后的完整链接：

| 页面 | 文件名 | URL |
|------|--------|-----|
| 首页 | `index.html` | `whalium.com/` |
| 登录 | `whalium_2_login.html` | `whalium.com/whalium_2_login.html` |
| 注册 | `whalium_3_register.html` | `whalium.com/whalium_3_register.html` |
| 律所详情 | `whalium_4_firm-detail.html` | `whalium.com/whalium_4_firm-detail.html` |
| 支付 | `whalium_5_payment.html` | `whalium.com/whalium_5_payment.html` |
| 律所入驻 | `whalium_6_landing.html` | `whalium.com/whalium_6_landing.html` |
| 提交信息 | `whalium_7_submit-firm.html` | `whalium.com/whalium_7_submit-firm.html` |
| 后台 | `whalium_8_dashboard.html` | `whalium.com/whalium_8_dashboard.html` |
| 关于我们 | `whalium_9_about.html` | `whalium.com/whalium_9_about.html` |

---

## 六、冷启动运营：上线第一天做什么

这是 GPT 建议里唯一值得采纳的一点——**先跑人工撮合，再自动化**。

### 6.1 询盘处理流程（手动版）

```
用户在 P4 点击"发送询盘" 或 "📧 免费询盘"
       ↓
邮件发送到 contact@morrison-ip.com（律所直接收到）
  + 抄送 support@whalium.com（你收到副本）
       ↓
你的工作：
  1. 48小时内确认律所是否回复
  2. 若未回复，手动联系律所催促
  3. 记录每次询盘来源、律所名称、是否成交
       ↓
积累真实成交数据 → 补充评价系统
```

### 6.2 用 Notion 或飞书做简单询盘台账

每行记录：

| 日期 | 用户邮箱 | 律所 | 需求类型 | 律所是否回复 | 是否成交 | 备注 |
|------|----------|------|----------|------------|----------|------|

这份数据是 6 个月后接融资时最有说服力的证明。

### 6.3 最低有效的获客实验（第 1–4 周）

**Week 1：** 在小红书/微信公众号发一篇干货文章
> 《收到美国USPTO驳回通知，我该怎么办？5步应对指南》
> 文末：「在 Whalium 免费搜索有经验的美国IP律所 → whalium.com」

**Week 2：** 进入 5 个"跨境电商"微信群，真诚回答法律问题，不打广告

**Week 3：** 直接联系 LinkedIn 上 10 家美国 IP 律所，告知平台正在上线，邀请免费入驻

**Week 4：** 统计询盘量，判断哪个获客渠道最有效，决定下月投入方向

---

## 七、后续技术升级路线（按优先级）

| 阶段 | 功能 | 技术选型 | 成本 |
|------|------|----------|------|
| **Month 1** | 真实支付（¥365 + ¥2,800） | Stripe + 支付宝 SDK | Stripe 2.9%+$0.3/笔 |
| **Month 2** | 用户账户系统 | Supabase Auth（免费额度） | 免费 |
| **Month 3** | 询盘后台管理 | Supabase + Next.js | Vercel 免费额度 |
| **Month 4** | 评价核验系统 | Supabase + 人工审核 Queue | 人力成本 |
| **Month 6** | 律所数据自动更新 | Python 爬虫 + Cron | 服务器 $5/月 |

---

## 八、中国可访问性检查清单

上线前确认以下项目：

- [x] 字体：使用 `fonts.loli.net`（loli.net 镜像），已配置
- [x] CDN：Cloudflare（香港节点，国内访问较稳定）
- [ ] 图片：不使用 Google Images、不使用 AWS S3 美国桶
- [ ] 第三方脚本：不加载 Google Analytics（改用 Plausible 或百度统计）
- [ ] 测速：上线后用 `ping0.cc` 或 `boce.w3ctech.com` 测试国内各地访问速度
- [ ] 备案：若面向中国大陆用户，`.cn` 域名需 ICP 备案（约 2–3 周）；`.com` 不要求

---

## 九、费用汇总

| 项目 | 费用 | 说明 |
|------|------|------|
| GitHub Pages | **免费** | 每月 100GB 流量 |
| Cloudflare CDN | **免费** | Free 套餐足够 |
| 域名 `whalium.com` | **~$10/年** | Cloudflare Registrar 成本价 |
| SSL 证书 | **免费** | Cloudflare 自动签发 |
| **合计** | **~$10/年** | |

---

*文档版本：v11 · 2025 · Whalium 华里安内部使用*
