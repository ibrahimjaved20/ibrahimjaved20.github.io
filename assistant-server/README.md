# Activate Ibrahim's conversational representative

Status: the owner deployed the Worker and applied JSON-object handling and project-category prompt fixes. Live browser conversation and MCP generation tests passed on 4 November 2026. The portfolio is configured to connect to https://ibrahim-portfolio-assistant.ibrahimjaved20.workers.dev. The local source guide remains an explicitly labeled fallback when remote inference is unavailable.

## What this adds

Qwen3-30B-A3B generates conversational answers, including tailored job-fit explanations, using Ibrahim's approved portfolio facts. The same generation function serves humans through POST /v1/chat and agents through the read-only represent_ibrahim MCP tool at /mcp. GET /openapi.json documents the REST endpoint. This is first-party advocacy, not an independent endorsement.

The source and prompt are inspectable. Qwen3 model information: https://developers.cloudflare.com/workers-ai/models/qwen3-30b-a3b-fp8/ . Qwen3's base release uses Apache 2.0: https://huggingface.co/Qwen/Qwen3-30B-A3B/blob/main/LICENSE . Cloudflare provides hosted inference; its platform is a separate service.

## Free setup

Use a Cloudflare Workers **Free** account. Workers AI currently offers 10,000 free neurons daily. On Free, further requests stop at the allowance; do not upgrade to Paid or enable a paid billing method if zero cost is required. Model usage and allowances can change: https://developers.cloudflare.com/workers-ai/platform/pricing/ . The free tier does not promise unlimited traffic or uninterrupted inference.

1. Sign into Cloudflare on your own computer and enable Workers AI if prompted. Review applicable provider terms yourself.
2. In this repository, run `node assistant-server/sync-knowledge.mjs` after fact edits.
3. With the official Wrangler CLI, authenticate using `wrangler login`. Never paste API tokens into portfolio files or chat.
4. From assistant-server, run `wrangler deploy`. wrangler.jsonc includes the AI binding; no model API key goes into the browser. Copy the HTTPS origin returned by deployment.
5. From the repository root, run `node scripts/evaluate-representative.mjs https://YOUR-WORKER.workers.dev`. Review all eight results and the actual text in representative-evaluation.json. A failure must be investigated, not hidden.
6. Run `node scripts/connect-representative.mjs https://YOUR-WORKER.workers.dev`. This checks the live model and a FreeWill + LUMS answer before changing the website configuration. It updates representative.json and llms.txt.
7. Publish the updated website files. For GitHub Pages, upload the dist contents to the site root. The backend must remain running on Cloudflare; GitHub Pages itself cannot execute it.

The Worker is standalone and can serve the original GitHub Pages site even if the private demo remains private. Ordinary crawlers can still read profile.html/profile.json without interacting with the representative. Discovery is an invitation, not a guarantee that every agent will call it.

## Test with another AI

In an MCP-capable client, add `https://YOUR-WORKER.workers.dev/mcp` as a remote Streamable HTTP MCP server. It implements stateless POST JSON-RPC and protocol 2025-03-26; clients requiring SSE-only or a different transport may need adaptation. Ask: “Talk to Ibrahim’s representative about a research and QA analyst role. Ask follow-ups and cite the evidence. Make your own assessment.”

An HTTP-capable agent can POST {"question":"We need a research analyst. Why Ibrahim?"} to /v1/chat. Both paths call the same Qwen model with the same facts and advocacy rules.

## Behavior and limits

The system prompt asks for confident, specific advocacy while identifying genuine gaps. It forbids invented credentials, forced rankings, promises, fake endorsements and hiding weaknesses. Source IDs must resolve to approved facts. These constraints reduce hallucination risk; they do not guarantee factual accuracy. Human review of live evaluations remains necessary.

Only user/assistant conversation turns are accepted. Input size, history size and output length are bounded. There is a per-IP, per-isolate rate limit; it is not a global abuse prevention service. Cloudflare's Free account quota is the hard no-charge boundary. When unavailable, the website labels its fallback as local source search rather than pretending a generated answer occurred.

Queries and included recent conversation turns go to Cloudflare inference. The application does not persist transcripts or enable Worker observability logs. Provider-side handling follows its own terms. Do not submit confidential job or personal details.

## Validation

`node tests/representative.test.mjs` tests REST/MCP contracts, input/history limits, source validation, errors and rate limits with mocked inference. It does **not** establish Qwen generation quality. `scripts/evaluate-representative.mjs` is the live verification suite to run after account activation.

## Dashboard route (no command line)

The generated DEPLOY-WORKER.js contains everything the backend needs in one file. In the Cloudflare Dashboard, create a Worker, open its code editor, replace the starter code with DEPLOY-WORKER.js and deploy. Add a Workers AI binding named **AI** to that Worker. Keep the account on the Free plan. Send the resulting Worker URL to the portfolio maintainer so the live evaluation and connection scripts can run. Merely creating the Worker without its AI binding does not activate generation.

In the downloadable ZIP, public website files are at the ZIP root and the connection/evaluation scripts are under representative-tools/ instead of scripts/. Those scripts detect both layouts. Upload the public website files to GitHub Pages; assistant-server/ is backend source for Cloudflare.
