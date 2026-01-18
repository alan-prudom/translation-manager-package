# Push TranslationManager to Standalone Repository
# Usage: .\push-standalone.ps1

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

# 2. Push subtree
Write-Host "[Subtree] Pushing $Prefix to $RemoteName $Branch..." -ForegroundColor Cyan
git subtree push --prefix=$Prefix $RemoteName $Branch

if ($LASTEXITCODE -eq 0) {
    Write-Host "[Subtree] Successfully pushed!" -ForegroundColor Green
} else {
    Write-Host "[Subtree] Push failed. Check if the standalone repository exists and is accessible." -ForegroundColor Red
}
