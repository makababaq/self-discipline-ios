# 自律日记

自律日记是一款纯本地的饮食、饮水、训练、睡眠和体重记录应用。首次启动时从当天开始一个 60 天周期，记录和自定义食物为空。内置库提供 113 种食物和 18 项运动预设。iOS 数据保存在 Capacitor Preferences，浏览器预览使用该浏览器的 `localStorage`。设置页提供 JSON 备份与恢复。

## 本地预览

使用 Node.js 22 或更新版本。在项目目录运行以下命令，并打开终端显示的地址。

```powershell
npm.cmd ci
npm.cmd run dev
```

检查生产构建时，运行 `npm.cmd run build` 和 `npm.cmd run preview`。

## GitHub 自动打包

在 GitHub 创建空仓库，将以下 URL 替换为该仓库地址，再从项目目录执行。

```powershell
git add .
git commit -m "Initialize Self Discipline iOS app"
git branch -M main
git remote add origin 'https://github.com/YOUR_ACCOUNT/YOUR_REPO.git'
git push -u origin main
```

推送 `main` 后，GitHub Actions 会运行 **Build Unsigned iOS IPA**。也可在该工作流页面点击 **Run workflow**。运行成功后，从 **Artifacts** 下载 `SelfDiscipline-unsigned-ipa` 并解压取得 `SelfDiscipline-unsigned.ipa`。安装到 iPhone 需要签名。

## 在 Mac 上打开原生工程

安装 Xcode 和 CocoaPods 后，从项目目录运行以下命令。

```sh
npm ci
npm run ios:sync
npm run ios:open
```
