# Script PowerShell pour retirer toutes les permissions

Write-Host "🔓 Retrait du système de permissions..." -ForegroundColor Cyan

# Liste des fichiers à modifier
$files = @(
    "src/app/pages/villes/villes.component.html",
    "src/app/pages/villes/villes.component.ts",
    "src/app/pages/users/users.component.html",
    "src/app/pages/users/users.component.ts",
    "src/app/pages/stades/stades.component.html",
    "src/app/pages/stades/stades.component.ts",
    "src/app/pages/saisons/saisons.component.html",
    "src/app/pages/saisons/saisons.component.ts",
    "src/app/pages/roles/roles.component.html",
    "src/app/pages/roles/roles.component.ts",
    "src/app/pages/team-categories/team-categories.component.html",
    "src/app/pages/team-categories/team-categories.component.ts",
    "src/app/pages/matchs/matchs.component.html",
    "src/app/pages/matchs/matchs.component.ts",
    "src/app/pages/ligues/ligues.component.html",
    "src/app/pages/ligues/ligues.component.ts",
    "src/app/pages/club-details/club-details.component.html",
    "src/app/pages/club-details/club-details.component.ts"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "📝 Traitement de $file..." -ForegroundColor Yellow
        
        # Lire le contenu
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # Retirer les directives *hasPermission dans les HTML
        if ($file -like "*.html") {
            # Retirer *hasPermission="'...'"
            $content = $content -replace '\s*\*hasPermission="[^"]*"', ''
            # Retirer les <ng-container *hasPermission> en gardant le contenu
            $content = $content -replace '<ng-container\s*\*hasPermission="[^"]*">', ''
            $content = $content -replace '</ng-container>\s*<!--\s*Fin hasPermission\s*-->', ''
        }
        
        # Retirer les imports dans les TS
        if ($file -like "*.ts") {
            # Retirer l'import
            $content = $content -replace "import\s*\{\s*HasPermissionDirective\s*\}\s*from\s*'[^']*';\r?\n?", ''
            # Retirer de l'array imports (avec virgule avant)
            $content = $content -replace ',\s*HasPermissionDirective\s*', ''
            # Retirer de l'array imports (sans virgule, dernier élément)
            $content = $content -replace '\s*HasPermissionDirective\s*,?\s*\n', "`n"
        }
        
        # Écrire le nouveau contenu
        $content | Set-Content $file -Encoding UTF8 -NoNewline
        
        Write-Host "✅ $file modifié" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $file n'existe pas" -ForegroundColor Red
    }
}

Write-Host "`n✨ Terminé ! Les permissions ont été retirées." -ForegroundColor Cyan
Write-Host "💡 Pour vérifier, lancez: npm start" -ForegroundColor Yellow
