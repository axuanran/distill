---
name: distill
description: Compress prompts into Military English using short command lines, explicit constraints, pass criteria, and a per-conversation alias dict.
---

# Distill

Use when user invokes `/distill` or wants fewer tokens in prompts, task specs, commands, or agent instructions.

## Rule

Compress meaning, not characters.

Target: shortest prompt where correct behavior stays obvious.

Use Military English:

- short commands
- one idea per line
- common words
- explicit constraints
- explicit pass criteria
- no cryptic code

## Tool Calls

CRITICAL: Pipe every non-interactive shell command through `distill` unless raw output is explicitly required.

CRITICAL: Your prompt to `distill` must be fully explicit. State exactly what you want to know and exactly what the output must contain. If you want only filenames, say `Return only the filenames.` If you want JSON, say `Return valid JSON only.` Do not ask vague questions.

Bad:

- `distill "Which files are shown?"`

Good:

- `distill "Which files are shown? Return only the filenames."`

Examples:

- `bun test 2>&1 | distill "Did the tests pass? Return only: PASS or FAIL, followed by failing test names if any."`
- `git diff 2>&1 | distill "What changed? Return only the files changed and a one-line summary for each file."`
- `terraform plan 2>&1 | distill "Is this safe? Return only: SAFE, REVIEW, or UNSAFE, followed by the exact risky changes."`
- `npm audit 2>&1 | distill "Extract the vulnerabilities. Return valid JSON only."`
- `rg -n "TODO|FIXME" . 2>&1 | distill "List files containing TODO or FIXME. Return only file paths, one per line."`
- `ls -la 2>&1 | distill "Which files are shown? Return only the filenames."`

You may skip `distill` only in these cases:

- Exact uncompressed output is required.
- Using `distill` would break an interactive or TUI workflow.

CRITICAL: Wait for `distill` to finish before continuing.

## Default Output

When compressing:

```text
Best:
<compressed prompt>
More aggressive:
<shorter prompt>
Tradeoff:
<brief risk>
```

If user asks max compression or output only, return only the compressed prompt.

## Conversation Dict

Keep an internal dict per conversation. Do not create files.

On first skill use in a conversation:

1. infer likely repeated terms from user prompt and visible context
2. define short aliases for repeated or likely repeated terms
3. prefer common aliases first: `be`, `fe`, `db`, `e2e`, `cfg`, `docs`, `env`, `deps`, `repo`, `impl`, `ref`, `err`
4. add custom aliases only for long stable terms
5. use aliases only after they are defined

When aliases help the user or future turns, output one compact line:

```text
Dict: api=backend-service ui=web-app perm=authorization
```

Later additions:

```text
Dict+: pay=payment retry
```

Avoid aliases for rare, short, temporary, or ambiguous terms. Avoid `auth` when `login` versus `perm` matters.

## Compression Steps

1. Find main task.
2. Keep needed context.
3. Keep actions.
4. Keep constraints.
5. Keep pass criteria.
6. Keep required output.
7. Remove filler.
8. Split into short commands.
9. Use dict aliases only when clear.

Remove filler: please, carefully, make sure, try to, generally, successfully, correctly, as needed.

## Keep Explicit

- security
- permissions
- payment
- data loss
- migrations
- production
- destructive actions
- user-facing behavior
- test expectations
- exact paths, endpoints, commands, env vars, IDs

## Good Forms

Default:

```text
Fix auth bug.
Add failing test first.
Backend only.
Do not change frontend.
Run tests.
Report files and result.
```

Complex task:

```text
T: fix auth bug
C: backend rejects valid user
Do: repro, add failing test, patch backend, run tests
No: frontend change, broad refactor
Pass: valid user allowed, tests pass
Out: summary, files, tests
```

Use labels only when they reduce ambiguity. Do not label tiny tasks.

Bad:

```text
fix auth no fe only be test pass
```

Better:

```text
Fix auth bug.
Backend only.
No frontend change.
Run tests.
```

## Quality Gate

Before returning, check:

- Can agent execute without guessing?
- Are constraints explicit?
- Is success defined?
- Did compression remove meaning?
- Are aliases obvious or defined?
- Is shorter text still safe?

If not, use more words.
