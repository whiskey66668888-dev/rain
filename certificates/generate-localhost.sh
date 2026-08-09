#!/bin/bash
# 生成支持 localhost 的 SSL 证书

# 检查 mkcert 是否安装
if ! command -v mkcert &> /dev/null; then
    echo "❌ mkcert 未安装，请先安装："
    echo "   brew install mkcert  # macOS"
    echo "   或访问: https://github.com/FiloSottile/mkcert"
    exit 1
fi

# 生成证书
echo "🔐 正在生成 localhost SSL 证书..."
mkcert -key-file private.key -cert-file certificate.crt localhost 127.0.0.1 ::1

if [ $? -eq 0 ]; then
    echo "✅ 证书生成成功！"
    echo "📁 证书文件："
    echo "   - private.key"
    echo "   - certificate.crt"
    echo ""
    echo "⚠️  如果浏览器提示证书不受信任，请运行："
    echo "   mkcert -install"
else
    echo "❌ 证书生成失败"
    exit 1
fi

