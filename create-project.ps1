$token = "cfoat_OYXQvRlJCs1TqOnLtLtJmYDd5DO8UNVtZtB83gzoLR4.wrUu8r_BRM2oyo4V8DPJmxyYBm0AqsdaQrn4ly_kOjA"
$accountId = "a87b6b7b36e566da8c7a522f9dfcf1cf"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    name = "my-local-info"
    production_branch = "main"
} | ConvertTo-Json

$response = Invoke-RestMethod -Method POST -Uri "https://api.cloudflare.com/client/v4/accounts/$accountId/pages/projects" -Headers $headers -Body $body

Write-Host "Result:"
$response | ConvertTo-Json
