# Whalium · 华里安 — 部署指南

> 全球律所导航平台 · 出海企业的法律寻路工具

## 一分钟上线方案

**技术栈：静态 HTML + GitHub Pages + Cloudflare**
- 域名费用：约 ¥70/年（.com）
- 服务器：**完全免费**（GitHub Pages 免费托管）
- CDN/中国访问：**完全免费**（Cloudflare 免费层）

---

## Step 1：上传到 GitHub

```bash
# 新建仓库（建议命名：whalium-site 或直接用 username.github.io）
git init
git add .
git commit -m "Whalium MVP v1"
git remote add origin https://github.com/YOUR_USERNAME/whalium-site.git
git push -u origin main
```

然后在 GitHub 仓库 → Settings → Pages → Source 选择 `main` 分支。
等 1-2 分钟后访问：`https://YOUR_USERNAME.github.io/whalium-site/`

---

## Step 2：绑定域名（如 whalium.com）

在域名注册商（阿里云/Namecheap）添加 DNS 记录：

| 类型   | 主机名 | 值                        |
|--------|--------|---------------------------|
| A      | @      | 185.199.108.153           |
| A      | @      | 185.199.109.153           |
| A      | @      | 185.199.110.153           |
| A      | @      | 185.199.111.153           |
| CNAME  | www    | YOUR_USERNAME.github.io   |

在 GitHub Pages 设置中填入 Custom Domain：`whalium.com`

---

## Step 3：接入 Cloudflare（中国访问优化）

1. 在 [cloudflare.com](https://cloudflare.com) 注册免费账号
2. Add Site → 输入 `whalium.com`
3. 将域名的 NS（名称服务器）改为 Cloudflare 提供的两个 NS 地址
4. SSL/TLS → Full（strict）
5. Speed → Optimization → 开启 Auto Minify（HTML/CSS/JS）

完成后中国大陆用户访问速度大幅提升，且走 HTTPS。

---

## Step 4：询盘收件配置（冷启动关键）

当前询盘采用 **mailto 机制** 作为冷启动桥接：
- 用户提交询盘 → 系统通知用户"24小时内转发"
- 实际上询盘内容需要从 **inquiries@whalium.com** 收件箱人工转发给律所

**推荐配置收件方式（按优先级）：**

### 方案A：Tally 表单（推荐，完全免费，中国可访问）
1. 注册 [tally.so](https://tally.so)（免费）
2. 创建一个询盘表单，字段：姓名/公司/邮箱/预算/需求类型/描述
3. 复制 Form ID（如 `wABcde`）
4. 在 `whalium_4_firm-detail.html` 中，将 `submitInquiry()` 函数末尾改为：

```javascript
// 替换 mailto 部分，改为 POST 到 Tally
fetch('https://tally.so/r/FORM_ID', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    name: nameEl.value,
    email: emailEl.value,
    company: compEl.value,
    budget: budgetEl.value,
    body: bodyEl.value
  })
});
```

Tally 会自动发邮件通知到你的收件箱，并可导出为 CSV。

### 方案B：Google Forms（备选，中国需 VPN）
适合律所端收集申请，不适合中国用户端。

### 方案C：Airtable API（进阶）
需要后端，适合 MVP 跑通后的第二阶段。

---

## Step 5：设置邮件域名（专业度提升）

在 Cloudflare → Email Routing 设置，将以下地址转发到你的个人邮箱：

| 收件地址                      | 转发到               | 用途                |
|-------------------------------|----------------------|---------------------|
| inquiries@whalium.com         | your@gmail.com       | 用户询盘汇总        |
| hello@whalium.com             | your@gmail.com       | 一般咨询            |
| support@whalium.com           | your@gmail.com       | 退款/投诉           |
| firms@whalium.com             | your@gmail.com       | 律所申请入驻        |

完全免费，无需邮件服务器。

---

## 冷启动操作手册

### 第一周目标：获取第一家律所入驻

1. **找 5 家已服务中国客户的律所**（LinkedIn 搜 "China outbound legal"）
2. **邮件模板：**

```
Subject: Whalium — Free listing for China-focused law firms

Dear [Firm Name],

I'm building Whalium (whalium.com), a directory specifically for 
Chinese companies seeking overseas legal counsel.

We noticed your firm has strong China practice experience. 
I'd like to offer you a free featured listing.

Takes 10 minutes. No commitment. Full removal anytime.

Profile page: whalium.com/whalium_7_submit-firm.html

Would you be open to a quick 15-min call?

Best,
[Your name]
Whalium Founder
```

### 第一周目标：获取第一个中国企业询盘

1. **微信群/知识星球分享**（出海电商群/跨境卖家群）
2. **发帖内容：**

```
分享一个我们正在做的工具：Whalium（华里安）
帮出海企业找靠谱的境外律所，透明报价、真实评价、中文服务。

目前覆盖美国/新加坡/英国等主要出海目的地。
还在早期，欢迎试用提反馈：[网址]

如果你用过境外律所有踩坑经验，也可以来写评价，
帮更多人避开同样的坑。
```

---

## 文件清单

| 文件                          | 功能                   |
|-------------------------------|------------------------|
| whalium_1_index.html          | 首页（律所搜索）        |
| whalium_2_login.html          | 登录                   |
| whalium_3_register.html       | 注册                   |
| whalium_4_firm-detail.html    | 律所详情页             |
| whalium_5_payment.html        | 支付（会员/入驻）      |
| whalium_6_landing.html        | 律所入驻落地页          |
| whalium_7_submit-firm.html    | 律所入驻表单            |
| whalium_8_dashboard.html      | 律所后台               |
| whalium_9_about.html          | 关于/信任页            |

---

## 后续路线图

### 第1个月：跑通冷启动
- [ ] 上线 whalium.com
- [ ] 入驻 5 家真实律所（人工审核）
- [ ] 收到 10 条真实询盘
- [ ] 完成第一笔对接（0佣金，积累案例）

### 第2个月：验证付费意愿
- [ ] 对 20 个询盘用户推送会员功能
- [ ] 首批会员目标：10人 × ¥365 = ¥3,650
- [ ] 律所付费入驻：2家 × ¥2,800 = ¥5,600
- [ ] 月收入验证：≥¥9,000

### 第3个月：接入真实支付
- [ ] 对接微信支付/支付宝（推荐：Ping++/YungouOS）
- [ ] 接入 Stripe（海外律所付款）
- [ ] 后端选型：Supabase（Auth + DB + Storage，免费层够用）
- [ ] 真实评价系统上线（合同验证）

---

*Whalium · 华里安 — 洞察全球律所，安行海外航路*
*Contact: hello@whalium.com*
