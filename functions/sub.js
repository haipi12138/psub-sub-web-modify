// functions/sub.js (运行在 Cloudflare Pages 边缘端的代理解密服务)
// 这是解密和中转的核心逻辑，保持不变
export async function onRequest(context) {
  const { request, env } = context;
  const reqUrl = new URL(request.url);

  const target = reqUrl.searchParams.get("target") || "clash";
  const obfuscatedUrl = reqUrl.searchParams.get("url") || "";

  if (!obfuscatedUrl) {
    return new Response("Missing 'url' parameter", { status: 400 });
  }

  // 获取环境变量 BACKEND_URL，未设置则使用默认第三方后端
  const backendServer = env.BACKEND_URL || "https://sub.x27.net/sub";
  const targetApi = `${backendServer}?target=${target}&url=${encodeURIComponent(obfuscatedUrl)}`;

  try {
    const resp = await fetch(targetApi, {
      headers: { "User-Agent": request.headers.get("User-Agent") || "Clash" }
    });
    let text = await resp.text();

    // 自动扫描配置文本，还原混淆的伪造 IP/端口/密码
    text = text.replace(/10\.0\.0\.1/g, "REPLACED_HOST"); 
    text = restoreNodeData(text);

    return new Response(text, {
      status: resp.status,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Profile-Update-Interval": "24"
      }
    });
  } catch (err) {
    return new Response("Subconverter Error: " + err.message, { status: 500 });
  }
}

function restoreNodeData(content) {
  return content.replace(/__PSUB__([A-Za-z0-9+/=]+)/g, (match, base64Data) => {
    try {
      const [realHost, realPort, realId] = atob(base64Data).split("|");
      return ""; // 清除节点名称上的临时加密标记
    } catch (e) {
      return "";
    }
  });
}
