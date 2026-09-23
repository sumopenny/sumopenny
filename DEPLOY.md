# 部署到 GitHub 个人主页

这个项目的目标仓库是公开的 `sumopenny/sumopenny`。GitHub 只有在仓库公开、仓库名与用户名一致，并且根目录存在非空 `README.md` 时，才会把 README 显示在个人主页。

## 1. 本地准备

需要：

- Git
- Node.js 18 或更高版本
- 已登录 GitHub CLI（推荐），或准备好 GitHub 账号的 SSH/HTTPS 推送方式

在 PowerShell 中进入项目目录：

~~~powershell
Set-Location 'C:\Users\GYKJ_Robot_001\Desktop\github-profile-sumopenny'
npm run render
~~~

`profile.config.json` 是唯一需要长期编辑的个人资料入口。修改昵称、简介、链接或项目后，再运行一次 `npm run render` 即可同步 README。

## 2. 创建同名公开仓库并推送

### 方式 A：使用 GitHub CLI

~~~powershell
git init -b main
git add .
git commit -m "feat: create pastel GitHub profile"
gh repo create sumopenny/sumopenny --public --source . --remote origin --push
~~~

### 方式 B：先在网页创建仓库

在 GitHub 创建一个名为 `sumopenny` 的公开空仓库，不要先添加 README、`.gitignore` 或 License，然后执行：

~~~powershell
git init -b main
git add .
git commit -m "feat: create pastel GitHub profile"
git remote add origin https://github.com/sumopenny/sumopenny.git
git push -u origin main
~~~

如果你使用 SSH，把最后两行的远程地址替换为 `git@github.com:sumopenny/sumopenny.git`。

## 3. 开启蛇图 Actions 写权限

进入仓库的 **Settings → Actions → General**：

1. 找到 **Workflow permissions**。
2. 选择 **Read and write permissions**。
3. 保存设置。

然后进入 **Actions → Refresh contribution snake**，点击 **Run workflow** 手动执行一次。工作流会生成浅色和深色 SVG，并把它们发布到 `output` 分支。

README 已经通过 `<picture>` 引用：

~~~text
https://raw.githubusercontent.com/sumopenny/sumopenny/output/github-contribution-grid-snake.svg
https://raw.githubusercontent.com/sumopenny/sumopenny/output/github-contribution-grid-snake-dark.svg
~~~

## 4. 后续更新

修改资料或项目后：

~~~powershell
npm run render
git add .
git commit -m "docs: refresh profile content"
git push
~~~

蛇图会在推送到 `main`、手动运行或每日定时任务时重新生成。

## 常见问题

- **README 没出现在个人主页**：确认仓库名严格为 `sumopenny`，仓库可见性为 Public，且根目录的 README 非空。
- **Actions 报 403**：回到 Workflow permissions，确认已选择 Read and write permissions。
- **蛇图图片 404**：先检查 Actions 是否成功完成，并确认 `output` 分支已经出现；第一次运行完成后等待几秒再刷新 README。
- **蛇图颜色或内容没有变化**：GitHub 和浏览器可能缓存 raw SVG，可以稍后刷新，或在 URL 后临时添加查询参数测试缓存。
- **本地渲染失败**：确认 Node.js 版本至少为 18，并在项目根目录执行 `npm run render`。
