$file = 'e:\Rep Dev Projects\repute-projects\faculty-web\app\jobs\page.tsx'
$content = Get-Content $file -Raw

# Fix wrong typeof check - should be item?.type === "list"
$content = $content.Replace(
  '(item?.type === "list" || typeof item === "paragraph")',
  'item?.type === "list"'
)

Set-Content $file -Value $content -NoNewline
Write-Host "Done"
