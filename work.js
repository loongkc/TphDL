export default {
    async fetch(request) {
        // 处理 CORS 预检请求
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Max-Age': '86400',
        };

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        const url = new URL(request.url);

        // 从查询参数获取目标 URL
        let targetUrl = url.searchParams.get('url');
        if (!targetUrl) {
            return new Response('请提供目标URL参数: ?url=xxx', {
                status: 400,
                headers: corsHeaders,
            });
        }

        // 安全校验：只允许代理 Telegraph 图片域名
        try {
            const target = new URL(targetUrl);
            const allowedHosts = [
                'img1.teletype.media',
                'img2.teletype.media',
                'img3.teletype.media',
                'img4.teletype.media',
                'telegra.ph',
                'i3.wp.com',
            ];
            if (!allowedHosts.some(h => target.hostname === h || target.hostname.endsWith('.' + h))) {
                return new Response('不允许代理该域名', {
                    status: 403,
                    headers: corsHeaders,
                });
            }
        } catch (e) {
            return new Response('无效的URL', { status: 400, headers: corsHeaders });
        }

        // 转发请求
        try {
            const response = await fetch(targetUrl, {
                method: request.method,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': 'https://telegra.ph/',
                },
                redirect: 'follow',
            });

            // 复制响应头并注入 CORS 头
            const modifiedHeaders = new Headers(response.headers);
            modifiedHeaders.set('Access-Control-Allow-Origin', '*');
            modifiedHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
            modifiedHeaders.set('Access-Control-Max-Age', '86400');
            // 移除可能干扰的内容安全策略头
            modifiedHeaders.delete('Content-Security-Policy');
            modifiedHeaders.delete('X-Frame-Options');

            return new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: modifiedHeaders,
            });
        } catch (error) {
            return new Response('代理请求失败: ' + error.message, {
                status: 502,
                headers: corsHeaders,
            });
        }
    },
};
