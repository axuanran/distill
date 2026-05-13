# distill

`distill` compresses command output into the exact answer an LLM needs.

Use it for logs, test results, diffs, plans, audits, and other noisy terminal output.

## How to use

Install:

```bash
npm i -g @samuelfaj/distill
```

Run onboarding:

```bash
distill
```

Onboarding asks for:

- `host`
- `model`
- optional `api-key`
- optional `timeout-ms`
- whether to install `/distill` for Codex and Claude (default: yes)

After onboarding, pipe command output into `distill`:

```bash
bun test 2>&1 | distill "Did tests pass? Return PASS or FAIL, followed by failing test names if any."
git diff | distill "What changed? Return only files changed and one-line summary for each."
terraform plan 2>&1 | distill "Is this safe? Return SAFE, REVIEW, or UNSAFE, followed by risky changes."
```

`distill` uses any OpenAI-compatible endpoint. Onboarding stores your local defaults, and CLI flags can override them:

```bash
distill --host http://127.0.0.1:1234/v1 --model your-model "what failed?"
```

You can also expand compressed `/distill` output back to normal language:

```bash
distill translate "Best: Fix auth bug. Add failing test first. No frontend change. Pass: tests pass."
distill translate "Dict: be=backend
T: corrigir auth
Do: repro, teste falhando, patch be
Pass: testes passam" pt-BR
```

## How it works

`distill` reads stdin, sends the command output plus your explicit question to your configured model, and prints only the useful result.

It keeps the original command behavior simple: interactive prompts pass through, and normal shell `pipefail` still works when you enable it.

## Example

```sh
rg -n "terminal|PERMISSION|permission|Permissions|Plan|full access|default" desktop --glob '!**/node_modules/**' | distill "find where terminal and permission UI are implemented in chat screen"
```

- **Before:** [7648 tokens 30592 characters 10218 words](./examples/1/BEFORE.md)
- **After:** [99 tokens 396 characters 57 words](./examples/1/AFTER.md)

Saved ~98.7% tokens.
