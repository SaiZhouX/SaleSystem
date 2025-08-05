# Git提交脚本
# 请在PowerShell中运行此脚本

# 检查Git是否可用
try {
    $gitPath = (Get-Command git -ErrorAction Stop).Source
    Write-Host "找到Git: $gitPath"
} catch {
    Write-Host "未找到Git命令。请确保Git已正确安装并添加到PATH环境变量中。"
    Write-Host "您可以从 https://git-scm.com/downloads 下载Git。"
    exit 1
}

# 添加修改的文件
Write-Host "添加修改的文件..."
git add utils/managers/SecurityManager.js pages/index/index.js pages/index/index.wxml pages/index/index.wxss app.json

# 提交更改
Write-Host "提交更改..."
git commit -m "添加金额隐私保护功能，使用人脸识别验证"

# 推送到GitHub
Write-Host "推送到GitHub..."
git push -u origin master

Write-Host "完成！"