[CmdletBinding()]
param(
  [Parameter(Mandatory = $true, Position = 0)]
  [ValidateNotNullOrEmpty()]
  [string]$Task
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$localModel = 'qwopus3.5-27b-v3'
$workspace = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$lmsCommand = Get-Command lms -ErrorAction Stop
$codexCommand = Get-Command codex -ErrorAction Stop

$serverStatus = (& $lmsCommand.Source status 2>&1 | Out-String)
if ($LASTEXITCODE -ne 0 -or $serverStatus -notmatch 'Server:\s+ON') {
  throw 'LM Studio is niet bereikbaar. Start de lokale server en probeer opnieuw.'
}

$answerPath = [System.IO.Path]::GetTempFileName()
$logPath = [System.IO.Path]::GetTempFileName()
$localPrompt = @"
You are the local read-only helper for this repository.
Do not call tools/local-ai.ps1, Codex, another model, or another agent.
Do not edit files, run git mutations, use credentials, or make network requests.
Inspect only the files needed for the task. Return a concise, evidence-based answer
with relevant file paths or line numbers. State uncertainty instead of guessing.

Task:
$Task
"@

$arguments = @(
  'exec',
  '--ignore-user-config',
  '--oss',
  '--local-provider', 'lmstudio',
  '-m', $localModel,
  '-s', 'read-only',
  '--ephemeral',
  '--skip-git-repo-check',
  '-C', $workspace,
  '-o', $answerPath,
  $localPrompt
)

try {
  $previousErrorActionPreference = $ErrorActionPreference
  try {
    $ErrorActionPreference = 'Continue'
    & $codexCommand.Source @arguments *> $logPath
    $exitCode = $LASTEXITCODE
  } finally {
    $ErrorActionPreference = $previousErrorActionPreference
  }

  if ($exitCode -ne 0) {
    $details = Get-Content -Raw -Encoding UTF8 -LiteralPath $logPath
    throw "Lokale AI-taak mislukt (exitcode $exitCode).`n$details"
  }

  $answer = Get-Content -Raw -Encoding UTF8 -LiteralPath $answerPath
  if ([string]::IsNullOrWhiteSpace($answer)) {
    throw 'De lokale AI gaf geen antwoord terug.'
  }

  $answer.Trim()
} finally {
  foreach ($temporaryPath in @($answerPath, $logPath)) {
    if (Test-Path -LiteralPath $temporaryPath) {
      Remove-Item -LiteralPath $temporaryPath -Force
    }
  }
}
