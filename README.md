# PanSou Web

极简、纯净、无广告的高性能网盘资源搜索聚合 Web 前端。

专为搭配 [PanSou 后端](https://github.com/sunanzhi/pansou) 使用而设计，支持 **Cloudflare Pages 零服务器免费托管**（或使用 Docker 容器化部署）。

---

## ✨ 核心特性

- 🎯 **极简纯净**：无任何推广弹窗、暗链、打赏与流氓广告，专注于最纯粹的搜索体验。
- ⚡ **极致性能**：基于 Vue 3 + Vite + Tailwind CSS 构建，打包产物 Gzip 后仅约 **50KB**，Cloudflare Pages 全球 CDN 秒开，不消耗本机服务器上行带宽。
- 🛡️ **安全与隐私隔离**：
  - **未登录访客**：仅可见极简搜索框与网盘类型分类，彻底隐藏后端 API 地址、频道列表、插件内部配置等敏感元数据。
  - **登录用户（管理员/受邀者）**：右上角解锁“系统配置中心”，可在线切换后端 API 端点、测试延迟测速、调整搜索并发数、配置默认包含/排除词及自动存活检测。
- 🔍 **网盘分类 Tab**：聚合展示夸克、阿里、百度、115、迅雷、移动、123、天翼、UC、磁力等十余种网盘，支持数量统计与动态徽章筛选。
- 🧪 **网盘链接存活探测**：对接后端原生支持的 9 大网盘分享状态逆向校验，一键探测 🟢正常 / 🔴已失效 / 🟡需密码 / ⚪不支持，并支持批量探测。
- 📋 **一键复制与直达**：智能组合复制“链接 + 提取码”，支持一键直达网盘分享页。
- 🌗 **多端自适应**：深色 / 浅色自适应模式，完美适配移动端与桌面端。

---

## 🚀 推荐部署方式：Cloudflare Pages（首选）

将前端托管在 Cloudflare Pages 上，由 Cloudflare 负责全球静态资源加速，后端通过 Cloudflare Tunnel 穿透，实现**本机零静态资源带宽消耗**。

### 1. 导入仓库到 Cloudflare Pages
1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)，进入 **Workers & Pages** -> **Create application** -> **Pages**。
2. 选择 **Connect to Git**，选中你的 `pansou-web` 仓库。
3. 在构建配置（Build settings）中设置：
   - **Framework preset**：`Vite`
   - **Build command**：`npm run build`
   - **Build output directory**：`dist`
   - **Node.js Version**：`20` 或以上（可在 Environment variables 中添加 `NODE_VERSION=20`）

### 2. 配置后端 API 环境变量
在 Cloudflare Pages 项目的 **Settings -> Environment variables** 中添加：
```env
VITE_API_BASE_URL = https://api.yourdomain.com
```
*(将 `https://api.yourdomain.com` 替换为您通过 Cloudflare Tunnel 指向后端 8888 端口的公网域名)*

点击 **Save and Deploy**，十几秒后即可获得全球 HTTPS 加速的专属搜索站点！

---

## 🐳 可选部署方式：Docker 容器化

如果你希望通过 Docker 将前端部署在本地或 VPS 上：

```bash
# 1. 构建镜像
docker build -t pansou-web .

# 2. 运行容器
docker run -d --name pansou-web -p 80:80 pansou-web
```

---

## 💻 本地开发调试

```bash
# 1. 安装依赖
npm install

# 2. 启动本地开发服务 (默认监听 3000 端口，自动反代 /api 到 http://localhost:8888)
npm run dev

# 3. 生产环境构建检查
npm run build
```

---

## 🔐 账号与认证说明

PanSou 后端原生支持多账号密码配置（基于环境变量 `AUTH_USERS`，例如 `AUTH_USERS=admin:admin123,user1:pass1`）。
- 若后端未开启认证（`AUTH_ENABLED=false`），所有访客均可直接畅享搜索。
- 若后端开启认证（`AUTH_ENABLED=true`），访客点击搜索或登录入口时，将弹出轻量级登录模态框，输入账号密码成功后获得 JWT Token 并自动存入浏览器本地存储。

---

## 📄 开源许可

[MIT License](LICENSE)
