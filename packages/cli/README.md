# @samuelfaj/distill

Install with:

```bash
npm i -g @samuelfaj/distill
```

Use:

```bash
logs | distill "summarize errors"
git diff | distill "what changed?"
terraform plan 2>&1 | distill "is this safe?"
```

Translate compressed `distill-talk` back to human language:

```bash
distill translate "X r=tests_passed ship"
distill translate "N r=missing_context ctx repo_state" pt-BR
```

The language argument is optional and defaults to `en-US`.

## distill-talk skill

This package ships `distill-talk` for both Codex and Claude:

- Codex skill: `skills/distill-talk/SKILL.md`
- Claude Code project skill: `.claude/skills/distill-talk/SKILL.md`

Both files use the `SKILL.md` frontmatter format with `name` and `description`, and both contain the same compact task DSL as `sam-compress-talk`, renamed for this package.

Install from the npm package:

```bash
npm i -g @samuelfaj/distill
DISTILL_PACKAGE="$(npm root -g)/@samuelfaj/distill"
mkdir -p ~/.codex/skills ~/.claude/skills
cp -R "$DISTILL_PACKAGE/skills/distill-talk" ~/.codex/skills/distill-talk
cp -R "$DISTILL_PACKAGE/.claude/skills/distill-talk" ~/.claude/skills/distill-talk
```
