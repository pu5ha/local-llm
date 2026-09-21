This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Model recommendations

`/setup` asks how much RAM the reader has (8/16/32/64GB) and recommends one
local model per tier. The roster lives in
`src/lib/catalog/data/curated.json`; `src/lib/catalog/curated.ts` is just a
typed loader over it.

Two rules make the tiers behave:

- **Sizes are measured, never estimated.** `weightsGB` on each entry is the
  real byte size of that exact Ollama tag, read from the registry manifest.
  `ramRequiredGB` is then the *total system RAM* the model needs — weights,
  plus 25% for KV cache and runtime, plus a 3GB OS allowance. So it can be
  compared against a machine's RAM directly.
- **Tier assignment is explicit, via `recommendedForRamGB`.** It is not derived
  from parameter counts. A Mixture-of-Experts model with 3B active parameters
  outranks a dense 27B on total params while being a weaker model, and ranking
  by footprint instead lands the 35B MoE at exactly 32GB — which a `<= 32` test
  admits, collapsing the 32GB and 64GB tiers into one answer.

`src/__tests__/catalog.curatedData.test.ts` validates the real JSON: one model
per tier, each actually fits its tier, sizes measured, and strictly bigger
models for bigger machines. That suite is the gate that makes automated edits
safe, so keep it green.

### Keeping it current

```bash
npm run models:watch              # report only, writes nothing
npm run models:watch -- --apply   # also rewrite curated.json + the snapshot
```

`.github/workflows/model-watch.yml` runs this weekly. It discovers what's new
on Ollama, measures it, and decides:

- **routine version bump** (newer release of a family already recommended, same
  size class, same tier, reviewed by Gemini, tests pass) → committed to `main`
- **anything else** (new family, new size class, first-time tier fill, no
  `GEMINI_API_KEY`, unreadable upstream, failing tests) → opens a pull request
- **a downgrade** → reported only, never offered

Data sources, all unauthenticated:

| What | Where |
|---|---|
| What exists, and how popular | `ollama.com/library?sort=popular` + `?sort=newest` (scraped HTML — there is no JSON API) |
| Exact size, vision support, and whether it runs locally at all | `registry.ollama.ai/v2/library/<m>/manifests/<tag>` with the Docker v2 `Accept` header |
| Adoption and license | `huggingface.co/api/models/<id>` |

Two traps worth knowing before changing any of this:

- `ollama.com/api/tags` looks like the way to exclude cloud-only models, but its
  entries collide with real local tags — it lists `gemma4:31b`, which is also a
  genuine 19.9GB local download. Filter on a failed manifest lookup instead.
- Hugging Face 307-redirects to a canonical casing (`gemma-4-12b-it` becomes
  `gemma-4-12B-it`), and a gated repo answers **200** with `{"error":...}` rather
  than 404. Both silently produce factless models if unhandled.

`src/lib/modelwatch/data/watch-snapshot.json` is the audit trail: every
candidate considered and, in plain words, why it lost.
