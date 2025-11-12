# Free VIP Video 用户脚本

Free VIP Video 是一个Tampermonkey用户脚本，使用户能够免费观看来自各种中国视频平台的VIP视频。该脚本通过在支持的网站上拦截视频播放并提供替代解析服务来解锁付费内容。

## 📋 目录
- [功能](#-功能)
- [支持的平台](#-支持的平台)
- [安装](#-安装)
- [使用方法](#-使用方法)
- [配置](#-配置)
- [从源码构建](#-从源码构建)
- [开发](#-开发)
- [免责声明](#-免责声明)

## ✨ 功能

- **多平台支持**：支持主要的中国视频平台，包括腾讯视频、爱奇艺、优酷、芒果TV、PP视频、乐视等
- **多个解析源**：提供多个VIP视频解析服务以确保可靠性
- **用户友好界面**：提供一个可拖动的VIP按钮悬浮在屏幕上
- **自动播放**：可选择自动解析和播放视频
- **SPA支持**：处理单页应用程序导航和URL变化
- **移动版支持**：为支持站点的移动版提供优化视图

## 📺 支持的平台

该脚本支持以下视频平台：

- 腾讯视频 (v.qq.com, m.v.qq.com)
- 爱奇艺 (www.iqiyi.com, m.iqiyi.com, www.iq.com)
- 优酷 (v.youku.com, m.youku.com)
- 芒果TV (www.mgtv.com, m.mgtv.com, w.mgtv.com)
- 哔哩哔哩 (www.bilibili.com, m.bilibili.com)
- 搜狐视频 (tv.sohu.com, film.sohu.com)
- 乐视 (www.le.com)
- 土豆视频 (video.tudou.com)
- PP视频 (v.pptv.com, vip.pptv.com)
- 1905电影网 (vip.1905.com, www.1905.com)
- AcFun (www.acfun.cn)
- 华数 (www.wasu.cn)

## 🛠️ 安装

1. 为您的浏览器安装 [Tampermonkey](https://www.tampermonkey.net/) 浏览器扩展
2. 从[release](https://github.com/eacheat53/free-vip-vedeo/releases/)下载最新构建版本或自行构建
3. 点击Tampermonkey扩展图标并选择"创建新脚本"
4. 用 `main.user.js` 文件的内容替换脚本内容
5. 保存脚本

## 🎮 使用方法

1. 访问任何支持的视频平台
2. 在页面上查找浮动的VIP按钮
3. 点击按钮以显示视频解析选项
4. 选择一个解析服务来解锁VIP内容
5. 可选择启用自动播放以获得无缝体验

## ⚙️ 配置

该脚本包含用户可选择的多个解析服务：

- JSON Player
- CK Player
- YangTu
- Player JY
- YParse
- 8090
- 剖元
- 虾米
- 全民
- 爱豆
- 夜幕
- m1907
- M3U8TV
- 冰豆
- playm3u8

配置在 `src/config.ts` 文件中处理，您可以在其中修改支持的站点和解析服务。

## 🔨 从源码构建

### 前提条件

- Node.js
- pnpm

### 步骤

1. 克隆仓库：
   ```bash
   git clone https://github.com/your-username/free-vip-video.git
   cd free-vip-video
   ```

2. 安装依赖：
   ```bash
   pnpm install
   ```

3. 构建项目：
   ```bash
   pnpm run build
   ```

4. 开发模式下带监听：
   ```bash
   pnpm run dev
   ```

构建过程会在 `dist/` 目录中生成一个用户脚本文件 (`free-vip-video.user.js`)，可以在Tampermonkey中安装。

## 🧑‍💻 开发

### 架构

该项目构建为TypeScript用户脚本，包含以下主要组件：

- **index.ts**: 初始化主要功能的入口点
- **main.ts**: 核心逻辑模块，处理UI生成、事件绑定和视频解析
- **config.ts**: 包含支持的视频平台和解析服务的配置文件
- **utils.ts**: 用于元素查找、URL监控和HTTP请求的实用函数


### 测试
该项目目前没有自动化测试。主要的测试方法是在支持的视频平台上进行手动验证。

## ⚠️ 免责声明

- 该项目使用户能够访问通常需要付费的版权内容
- 使用此脚本可能违反视频平台的服务条款
- 功能依赖于外部解析服务，这些服务可能会更改或变得不可用
- 可能需要定期更新以维持与目标网站的兼容性
- 作为用户脚本，它只能在Tampermonkey等浏览器扩展中工作

该项目仅供参考和教育目的提供。