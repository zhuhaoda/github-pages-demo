# Hello, Pages.

一个可以直接发布到 GitHub Pages 的中文示范网站。包含手机适配、名字问候、四种配色；不需要构建、安装依赖、API 密钥或后端。

## 本地查看

直接用浏览器打开 `index.html`，页面和交互都可以使用。也可以在这个文件夹中运行：

```bash
python3 -u -m http.server 0 --bind 127.0.0.1
```

然后打开终端输出的本地 HTTP 地址（端口自动选择，避免与已有服务冲突）。用 Ctrl+C 停止服务器。

## 免费发布到 GitHub Pages

1. 登录 GitHub，创建名为 `github-pages-demo` 的 **Public（公开）仓库**，勾选添加 README，让默认分支 `main` 存在。请勿把已有的私有研究仓库改成公开。
2. 在新仓库选择 **Add file → Upload files**，上传本文件夹中的 `index.html` 和 `.nojekyll` 到仓库根目录（不要套一层文件夹），点击 **Commit changes**。这个 README 可选择上传或不上传。
3. 打开仓库的 **Settings → Pages**。
4. 在 **Build and deployment** 下，将 **Source** 设为 **Deploy from a branch**；Branch 选 `main`，文件夹选 `/(root)`，点击 **Save**。
5. 等待 GitHub 发布。完成后 Pages 设置中会出现 **Visit site**。官方说明发布可能需要最多约 10 分钟。

地址通常为 `https://你的用户名.github.io/github-pages-demo/`。本仓库配置 Pages 后的网址为 [Hello, Pages.](https://zhuhaoda.github.io/github-pages-demo/)。

## 是否收费？

- GitHub Free 可以免费为公开仓库启用 GitHub Pages。
- 默认 `github.io` 地址不需要购买域名。
- 自购域名、其他第三方后端等服务的费用另算；本示范不使用这些服务。
- 这不是无限容量的通用服务器；GitHub Pages 有使用限制，适合静态页面和项目文档。
- 网站公开可访问，免费方案的网站源码也公开；不要上传密码、密钥或私密研究数据。

## 如何修改

- 网站文案：修改 `index.html` 中的 HTML。
- 布局与配色：修改文件内的 `<style>`。
- 问候与换色：修改文件底部的 `<script>`。
- 问候名字和计数只在当前页面内存中存在，刷新后清空。没有发送给后端，也没有存进浏览器本地存储。GitHub 托管服务自身仍可能按其政策记录访问者 IP。

## 官方参考

- [GitHub Pages 介绍与适用方案](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [创建 GitHub Pages 网站](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)

## 查看部署状态

在仓库的 **Settings → Pages** 查看网站地址，在 **Actions** 查看 `pages build and deployment` 的构建与发布结果。修改 `main` 分支上的网页文件后，GitHub 会自动重新发布。
