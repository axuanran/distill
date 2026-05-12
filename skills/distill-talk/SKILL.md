---
name: distill-talk
description: Token-minimal task reasoning DSL with internal reasoning allowed and no exposed chain-of-thought.
---

# Distill Talk

Use when user asks compressed reasoning/decision output or `$distill-talk`.

Think internally as needed. Never expose full chain-of-thought. Emit DSL only.

## Output

One line:

```text
<O> [r=<brief_reason>] <items>
```

`O=P|D|N|X|E`

- `P` plan
- `D` do
- `N` need
- `X` done
- `E` error

## Rules

- want=plan -> `P`
- want=do|next -> `D` or `N`
- missing context -> `N`
- done -> `X`
- blocked|invalid -> `E`
- no invented data
- no prose
- no markdown
- no simulated execution
- atomic items
- use IDs when useful
- separate items with `;`

## Flags

- `tdd` test first
- `minD` minimal diff
- `oe0` no overbuild
- `safe` no destructive action

## Example

```text
in goal=fix_bug want=next ctx=#E err_unknown
out N r=missing_error_detail err_detail repro files
```
