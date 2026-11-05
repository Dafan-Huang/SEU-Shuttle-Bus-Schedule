# 🚌 东南大学接驳车时刻表

东南大学兰台公寓接驳车实时查询应用，支持 Web、Windows 桌面端和 Android 移动端。

## ✨ 特性

- 🌐 **跨平台支持**: Web、Windows桌面、Android移动端
- 🎯 **实时查询**: 智能显示当前时间最近的班车信息
- 📅 **节假日智能**: 自动识别工作日/节假日，显示对应时刻表
- 🔄 **循环班车**: 支持循环发车时间段的智能显示
- 📱 **响应式设计**: 适配各种屏幕尺寸
- 📲 **PWA 与离线查询**: 添加到手机桌面，缓存后无需联网即可查询
- 🎨 **自定义配色**: 支持预设色、自由选色、亮度和深浅模式

## 📦 下载使用

- **Web**：可本地启动，也可按[部署指南](./部署指南.md)发布到 GitHub Pages。
- **Windows 与 Android**：已发布的安装包见[本仓库 Releases](https://github.com/Dafan-Huang/SEU-Shuttle-Bus-Schedule/releases)，也可以按[打包说明](./打包说明.md)自行构建。

配置 GitHub Pages 后，推送到 `main` 会触发 GitHub Actions 校验、构建和发布。节假日和配色偏好保存在当前浏览器中。

### 添加到手机桌面与离线使用

1. 联网打开部署后的网页版，等待页面底部显示 **“已缓存，可离线查询”**。完整时刻表、校历、两套布局和图标会一起缓存，无需逐个打开。
2. Android：使用 Chrome 或 Edge，点击网页的安装按钮（浏览器支持时显示），或在浏览器菜单中选择 **“安装应用 / 添加到主屏幕”**。
3. iPhone：使用 Safari，点击 **“分享 → 添加到主屏幕”**。
4. 此后可从桌面图标打开并离线查询。联网重新打开或切回应用时会检查新版本，出现 **“更新应用”** 后点击更新即可。

离线时使用最近一次缓存的时刻表和校历；实时倒计时仍按手机时间计算。自定义节假日继续保存在本地。清除网站数据、卸载或系统回收缓存后，需联网重新缓存；首次安装到手机桌面后建议联网打开一次并确认缓存状态。

## 🚀 开发

### 环境要求
- Node.js 24（与 GitHub Actions 一致）
- Rust（桌面版）
- Android Studio（移动版）

### 快速开始
```bash
# 安装依赖
npm install

# Web开发
npm run dev

# 桌面版开发
npm run tauri-dev

# Android开发
npm run android-dev
```

### 构建
```bash
# Web版本
npm run build

# 桌面版
npm run build-tauri

# Android版
npm run build-android
```

## 🏗️ 技术栈

| 用途 | 技术 |
| --- | --- |
| 界面 | React 19、TypeScript 5.8、Tailwind CSS 3 和原生 CSS |
| 网页构建 | Vite 6、PostCSS 和 Autoprefixer |
| 安装与离线查询 | vite-plugin-pwa、Workbox、Web App Manifest 和 Service Worker |
| 本地数据 | TypeScript 时刻表、JSON 校历及用于保存个人设置的 localStorage |
| Windows 桌面 | Tauri 2（Rust 和系统 WebView），另提供 Electron 打包脚本 |
| Android | Capacitor 7 和 Android Studio |
| 网页发布 | GitHub Actions（Node.js 24）和 GitHub Pages |

## 📂 项目结构

```
接驳车查询/
├── App.desktop.tsx         # 桌面布局
├── App.mobile.tsx          # 手机布局
├── components/             # React组件
├── data/                   # 校历数据
├── utils/                  # 工具函数
├── src-tauri/             # Tauri桌面应用
├── android/               # Android应用
├── release/               # 发布版本
└── dist/                  # Web构建输出
```

## 📚 文档

- [打包说明](./打包说明.md) - 构建和打包指南
- [部署指南](./部署指南.md) - 生产环境部署
- [版本说明](./release/版本说明.md) - 发布版本信息

