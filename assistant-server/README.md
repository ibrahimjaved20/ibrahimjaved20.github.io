# Cloudflare Gemma deployment

The backend source now uses @cf/google/gemma-4-26b-a4b-it, the Cloudflare-supported Gemma 4 variant selected by the owner. This is not the exact Gemma 4 12B release.

Prepared, not deployed. Uploading files to GitHub does not update a Cloudflare Worker.

1. Open the existing ibrahim-portfolio-assistant Worker in Cloudflare.
2. Choose Edit code. Replace its code with DEPLOY-WORKER.js from this folder.
3. Keep its existing Workers AI binding named AI. Deploy. Do not upgrade the plan or add billing automatically.
4. Open /health on the existing Worker origin; model must be @cf/google/gemma-4-26b-a4b-it and status configured.
5. From the repository root run node representative-tools/evaluate-representative.mjs https://YOUR-WORKER.workers.dev and review every response.
6. Run node representative-tools/connect-representative.mjs https://YOUR-WORKER.workers.dev only after successful evaluation. This updates representative.json to the live health model.

Mocked tests validate model selection, JSON decoding, source validation, REST errors and MCP contracts. They do not establish live Gemma response quality or latency. The frontend allows 45 seconds; the Worker bounds inference at 40 seconds. The local search fallback remains available.

Model documentation: https://developers.cloudflare.com/workers-ai/models/gemma-4-26b-a4b-it/
