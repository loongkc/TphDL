# 使用 Cloudflare 解决跨域问题

## 方案概述

Cloudflare Workers 是 Cloudflare 提供的边缘计算平台，可以免费搭建 CORS 反向代理。核心思路是：**前端请求经过 Worker 转发到 Telegraph CDN，Worker 在响应中注入 `Access-Control-Allow-Origin` 头后再返回给浏览器**。

免费额度：每天 **100,000 次请求**，单次 CPU 时间上限 **10ms**，内存上限 128MB，对于个人下载漫画场景完全够用。

## 部署步骤

**步骤 1：注册 Cloudflare 账号**

访问 [cloudflare](https://dash.cloudflare.com) 注册账号（免费）。

**步骤 2：创建 Worker**

登录后进入 **Workers & Pages** → 点击 **Create application** → **Create Worker** → 给 Worker 起个名字（如 `telegraph-proxy`）→ 点击 **Deploy**。

**步骤 3：编写代理脚本**

在 Worker 编辑器中，将默认代码替换为[work.js](https://raw.githubusercontent.com/loongkc/TphDL/refs/heads/main/work.js)中的内容：


**步骤 4：部署并测试**

点击 **Save and Deploy**，部署完成后访问：

```
https://你的worker名称.你的子域.workers.dev/?url=图片直链
```

如果能正常返回图片内容，说明代理配置成功。

**步骤 5：在前端界面中填入代理**

在前端界面的高级设置中，将 `PROXY_PREFIX` 设为你的 CORS 代理前缀：

```javascript
PROXY_PREFIX = 'https://你的worker名称.你的子域.workers.dev/?url=';
```

## 进阶：绑定自定义域名

如果希望使用自己的域名，可以按以下步骤操作：

1. 在 Cloudflare DNS 中添加 CNAME 记录：`proxy` → `你的worker名称.workers.dev`
2. 进入 Worker 的 **Settings** → **Triggers** → 添加 **Custom Domain**：`proxy.你的域名.com`
3. 将 `PROXY_PREFIX` 改为 `https://proxy.你的域名.com/?url=`


# 注意事项

1. **Cloudflare Workers 免费额度**：每天 100,000 次请求。如果一次下载 200 张图片，每天可支持约 500 次完整下载，个人使用完全足够。

2. **429 限流**：Telegraph 的 IPFS 网关（`i3.wp.com`）容易触发 429，优化后的指数退避策略可以有效缓解。

3. **代理安全性**：Worker 脚本中已限制只代理 Telegraph 相关域名，防止被滥用为开放代理。

4. **浏览器兼容性**：`AbortSignal.timeout()` 在旧版浏览器中不支持，可降级为 `setTimeout` + `AbortController`。

5. **国内访问**：Cloudflare Workers 的 `*.workers.dev` 域名在国内可能被墙，建议绑定自定义域名（通过 Cloudflare 代理）。


# 觉得好用的话可以请我喝瓶水哦>
> <img width="20%" alt="wx" src="https://github.com/user-attachments/assets/5a2c648b-249f-4377-9da4-a1a99447594e" />
