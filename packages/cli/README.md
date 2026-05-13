# @samuelfaj/distill

Install:

```bash
npm i -g @samuelfaj/distill
```

Run onboarding:

```bash
distill
```

Then pipe command output into `distill`:

```bash
bun test 2>&1 | distill "Did tests pass? Return PASS or FAIL, followed by failing test names if any."
git diff | distill "What changed? Return only files changed and one-line summary for each."
```
