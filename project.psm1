# Define cores globais
if (-not $global:green) { $global:green = "`e[32m" }
if (-not $global:reset) { $global:reset = "`e[0m" }

# Salva o prompt original (uma vez)
if (-not $global:originalPrompt) {
    $global:originalPrompt = (Get-Command prompt -CommandType Function).ScriptBlock
}

function activate {
    function global:prompt {
        "$global:green(project)$global:reset PS $($PWD)> "
    }
}

function route {
    param(
        [ValidateSet("create", "remove", "open")]
        [string] $mode,
        [string] $name
    )

    $htmlPath = "$name.html"
    $jsPath   = "scripts/$name.js"
    $cssPath  = "styles/$name.css"

    if ($mode -eq "create") {
        if (-not (Test-Path "scripts")) { New-Item "scripts" -ItemType Directory | Out-Null }
        if (-not (Test-Path "styles"))  { New-Item "styles"  -ItemType Directory | Out-Null }

        if (-not (Test-Path $htmlPath)) { New-Item $htmlPath -ItemType File -Force | Out-Null }
        if (-not (Test-Path $jsPath))   { New-Item $jsPath   -ItemType File -Force | Out-Null }
        if (-not (Test-Path $cssPath))  { New-Item $cssPath  -ItemType File -Force | Out-Null }

        $conteudo = @"
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="styles/$name.css">
</head>
<body>

    <script src="scripts/$name.js"></script>
</body>
</html>
"@
        $conteudo | Set-Content -Path $htmlPath -Encoding UTF8
    }
    elseif ($mode -eq "remove") {
        Remove-Item $htmlPath, $jsPath, $cssPath -ErrorAction SilentlyContinue
    }
    elseif ($mode -eq "open") {
        if (Test-Path $htmlPath) { code -r $htmlPath }
        if (Test-Path $jsPath)   { code -r $jsPath }
        if (Test-Path $cssPath)  { code -r $cssPath }
    }
}

function deactivate {
    # Remove as funções do módulo do escopo global
    foreach ($fn in @("route", "activate", "deactivate")) {
        if (Get-Command $fn -CommandType Function -ErrorAction SilentlyContinue) {
            Remove-Item "Function:\$fn" -ErrorAction SilentlyContinue
        }
    }

    # Restaura o prompt original
    if ($global:originalPrompt) {
        Set-Item "Function:\global:prompt" -Value $global:originalPrompt
        Remove-Variable -Name originalPrompt -Scope Global -ErrorAction SilentlyContinue
    }

    # Remove o módulo
    Remove-Module project -ErrorAction SilentlyContinue
}

# Ativa o prompt do projeto
activate