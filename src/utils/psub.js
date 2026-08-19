// src/utils/psub.js
// 这是混淆加密的核心逻辑，保持不变
export function obfuscateSub(sourceText) {
  if (!sourceText) return "";
  const lines = sourceText.split(/\r?\n/);
  
  const obfuscated = lines.map(line => {
    line = line.trim();
    if (!line) return "";
    try {
      // 1. 处理 VMess 节点
      if (line.startsWith("vmess://")) {
        const rawJson = atob(line.replace("vmess://", ""));
        const config = JSON.parse(rawJson);
        const realData = btoa(`${config.add}|${config.port}|${config.id || ''}`);
        
        config.add = "10.0.0.1"; // 伪造 IP
        config.port = 443;       // 伪造 端口
        if (config.id) config.id = "00000000-0000-0000-0000-000000000000";
        config.ps = (config.ps || "Node") + "__PSUB__" + realData;
        return "vmess://" + btoa(JSON.stringify(config));
      }
      
      // 2. 处理 VLESS / Trojan / SS 节点
      if (line.startsWith("vless://") || line.startsWith("trojan://") || line.startsWith("ss://")) {
        const url = new URL(line);
        const realData = btoa(`${url.hostname}|${url.port}|${url.username || ''}`);
        
        url.hostname = "10.0.0.1";
        url.port = "443";
        if (url.username) url.username = "obfuscated-user";
        url.hash = (url.hash || "#Node") + "__PSUB__" + realData;
        return url.toString();
      }
    } catch (e) {
      return line;
    }
    return line;
  });

  return obfuscated.filter(Boolean).join("\n");
}

