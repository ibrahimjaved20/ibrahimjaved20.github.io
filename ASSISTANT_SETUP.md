# Ibrahim's portfolio guide

The guide uses open-source Transformers.js 3.8.1 and the Apache-2.0 MiniLM-L6-v2 embedding model. It runs in a Web Worker on the visitor's CPU through ONNX WebAssembly. No API key, paid inference service or WebGPU is required. The model and runtime are bundled locally. Roughly 45 MB loads only when chat opens, then browser caching applies.

It is semantic retrieval, not a generative conversational model: natural questions are matched to source facts and the relevant text is returned with links. Follow-ups retain the previous topic. Known current-activity and contact questions use precise fact selection. The guide cannot guarantee an answer to every question. Missing facts receive an honest fallback; it cannot promise availability or invent qualifications.

Source of truth: dist/profile.json. Keep dist/portfolio-knowledge.js and visible dist/profile.html synchronized when editing facts. Update the date only after confirming current facts. The current entry combines FreeWill and LUMS, with SloRush secondary. The auto-update entry records three GitHub test websites, each with 20 branches/test cases, completed in three days.

## Human tests
Open Ask about Ibrahim and wait for Local AI ready. Ask:
- What is Ibrahim doing nowadays? Expect FreeWill + MS Technology Management and Entrepreneurship at LUMS.
- How does he spend his time away from his desk? Expect sports, chai and travel.
- And what is he studying? Expect education.
- Has he done anything to check whether information stays accurate when a website changes? Expect auto-update testing.
- How long did those test websites take? Expect three days, three websites, 20 branches per website.
- What is his hourly rate? Expect direct contact, no invented rate.
- Does he have a PhD? Expect no PhD listed, with published education.
- What is the weather in Tokyo? Expect no reliable portfolio answer.
Repeat with your own phrasing. Matching is imperfect; review both the answer and linked evidence.

## Agent discovery tests
Publish the ZIP contents at the public GitHub Pages root first. The private Sites preview cannot establish public search visibility. Ask an external browsing-enabled assistant:
“Read https://ibrahimjaved20.github.io/profile.html and https://ibrahimjaved20.github.io/profile.json. Summarize Ibrahim’s current work and education, his auto-update testing deliverable and turnaround, and which projects are professional versus university work. Cite the pages. Mark information you cannot verify.”
Expected: FreeWill + LUMS, three sites in three days with 20 branches/test cases each; professional and university work kept separate. Then ask about an unpublished rate or PhD and check that no unsupported claim is made.

profile.html is crawlable HTML, profile.json is structured first-party evidence, and llms.txt is a convenience index. An optional read-only WebMCP tool registers only in supporting browsers. External assistants normally read pages rather than chatting with the widget. These formats do not guarantee crawling, rankings, recommendations or endorsements.

## Validation performed 3 November 2026
CPU model initialized in the cloud Chrome browser without GPU inference. Nine live embedding queries covered paraphrases, education, hobbies, workflow tests, turnaround, rates, forecasting and unrelated questions. Main chat verified current activities, a non-keyword hobby paraphrase, study follow-up and unknown-question fallback. Desktop and 390px mobile layouts inspected. Node source/boundary checks passed. Third-party crawling and WebMCP execution are not verified in this environment.

## Résumé printing
The résumé has an external-script print handler with visible fallback instructions plus a direct one-page PDF download. Embedded browsers may suppress the native print dialog. scripts/build-resume-pdf.py regenerates the PDF from current résumé HTML. PDF content and render validated; native OS print dialogs cannot be verified in the cloud browser.

## Conversational representative upgrade (activation pending)

assistant-server/ contains a Gemma 4 generative backend for Cloudflare Workers AI. It shares the verified profile knowledge between POST /v1/chat and POST /mcp, where represent_ibrahim provides tailored, sourced first-party advocacy. This is a separate hosted inference service; it cannot run on GitHub Pages itself.

The frontend reads representative.json and switches to the hosted conversation only after an activated endpoint is configured. Before that, the existing local semantic guide remains available and is not relabeled as generated conversation. Hosted questions disclose transmission to Cloudflare. Source rendering uses textContent. The remote model can make errors; source-ID validation does not prove every generated claim.

Activation requires the owner's Cloudflare Free account and the AI binding. No account or credentials were supplied in this session. REST/MCP contract tests passed with mocked inference. Live Gemma inference and third-party MCP clients are not verified until activation. Use assistant-server/README.md and scripts/evaluate-representative.mjs; connect-representative.mjs checks a live answer before updating discovery and configuration.

## Live activation check — 4 November 2026
Browser GET /health on the owner's Worker reported configured. A browser POST /v1/chat returned HTTP 503 inference_unavailable. No successful live generation or agent conversation is claimed. Direct executor HTTP requests received Cloudflare 403 / 1010; do not treat that as a universal outage. Website endpoint remains null pending successful inference tests.
Cloudflare JSON-mode documentation shows response can be a parsed object. Fixed decodeAnswer to support objects as well as strings; added the corresponding regression test. This compatibility fix is prepared locally but still needs deployment to the owner's Cloudflare Worker. Dashboard authentication could not be verified in the cloud browser. The small manual patch is replacing const result=JSON.parse(text) with object-or-string handling.

## Live retest after owner JSON-object patch — 4 November 2026
Browser POST /v1/chat returned 200 generated answers for current activities, QA fit, turnaround follow-up, hobby paraphrase, qualification gap, fabrication resistance and availability. Browser MCP initialize and tools/list returned 200, and represent_ibrahim generated a sourced answer. One material factual-category error remained: the agent answer called market sizing university work. Added an explicit professional/university project map to SYSTEM locally. This prompt adjustment still requires owner deployment and targeted live retest. Endpoint remains unconfigured in the portfolio until that correction is verified. Direct non-browser client access was blocked by Cloudflare 1010; the browser MCP test does not prove compatibility with every external agent client.

## Activated after live category retest — 4 November 2026
The owner deployed the category correction. Browser tests returned HTTP 200 generated answers for current activities and project categories. Healthy Herbals market sizing and Revcloud campaign analytics were correctly described as professional work. MCP initialization returned 200, and represent_ibrahim generated a job-fit response keeping professional and university work separate. The earlier category finding is resolved for these tested prompts, not a guarantee of universal accuracy.
The endpoint in dist/representative.json is now active. dist/llms.txt advertises REST/MCP/OpenAPI endpoints. Activation was written after reviewing actual browser results rather than using connect-representative.mjs because direct executor requests receive Cloudflare 403/1010. That client restriction remains a limit on broad external-agent compatibility. Source page links remain absent from visible navigation. Analytics is still pending a provider/project setup; no visitor tracking has been installed.

## Analytics connected — 4 November 2026
PostHog tracking is installed once per HTML page. Replay is enabled in code; the public project configuration returned sessionRecording=false during this audit. Enable recording in the PostHog account before expecting replays. Chat questions/answers and optional identity details are collected separately. The notice can be dismissed and reopened. DNT/GPC and opt-out are respected. See ANALYTICS_SETUP.md and QA_REPORT.txt for current validation limits.
