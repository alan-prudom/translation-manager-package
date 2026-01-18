# Pull TranslationManager from Standalone Repository
# Usage: .\pull-standalone.ps1

$Prefix = "Shared/TranslationManager"
$RemoteName = "translation-mgr-standalone"
$RemoteUrl = "https://github.com/alan-prudom/translation-manager-package.git"
$Branch = "main"

# 1. Check if remote exists, add if not
$remotes = git remote
if ($remotes -notcontains $RemoteName) {
    Write-Host "[Subtree] Adding remote $RemoteName..." -ForegroundColor Cyan
    git remote add $RemoteName $RemoteUrl
}

# 2. Pull subtree
Write-Host "[Subtree] Pulling $RemoteName $Branch into $Prefix..." -ForegroundColor Cyan
git subtree pull --prefix=$Prefix $RemoteName $Branch --squash

if ($LASTEXITCODE -eq 0) {
    Write-Host "[Subtree] Successfully pulled and squashed!" -ForegroundColor Green
} else {
    Write-Host "[Subtree] Pull failed. Resolve conflicts if necessary." -ForegroundColor Red
}
