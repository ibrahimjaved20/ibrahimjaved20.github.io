# Portfolio analytics

Connected 4 November 2026 to Ibrahim's PostHog project 708155 (US Cloud). The browser project token is intentionally public and write-only; there is no personal API key in this website.

## What to view in PostHog

- Activity: received events and their properties.
- Web analytics: visitors, pages, referrers, countries and devices.
- People and groups: anonymous browser histories, not verified real-world identities.
- Product analytics: custom insights built from the events below.

Filter environment=production for the GitHub Pages website. The private demo uses environment=demo; local checks use environment=test. Exclude demo/test from real visitor reports.

| Event | Meaning / useful properties |
| --- | --- |
| $pageview | Page visit; page, sanitized URL/referrer, device/browser/geography SDK properties |
| project_click | Project card/menu destination and placement |
| section_view | A section entered the viewport; section class/ID |
| page_engagement | Active seconds since last flush, plus section_seconds map |
| scroll_depth | 25, 50, 75 or 100 percent of page scroll |
| navigation_click | Internal link destination and placement |
| outbound_click | External link destination and placement |
| contact_click | Email action; actual address is not collected |
| resume_open / resume_download / resume_print | Résumé actions |
| chat_opened / chat_question / chat_answer / chat_fallback | Chat usage counts; answer mode only, no transcript |
| illustration_changed / theme_changed | Homepage illustration and theme interactions |

Active time is approximate: visible tab, activity within 30 seconds, sampled every 5 seconds. Engagement sends deltas every 30 seconds and on hide/leave; sum active_seconds to aggregate. Section time is estimated from the most visible observed section and is not eye tracking. Anonymous browser IDs may change with cleared storage or a different device.

Privacy: autocapture, session recordings, heatmaps, exception capture and typed-text collection are off. URLs have query strings/fragments removed, including nested SDK person properties. The direct privacy.html page explains collection and offers an opt-out; its footer link is hidden. Do Not Track and Global Privacy Control are respected. Ad blockers and disabled tracking will reduce counts. No visitor identification form has been added.

## Recommended dashboard

1. Unique visitors: $pageview, unique users, environment=production.
2. Popular projects: project_click count, breakdown destination.
3. Reading time: page_engagement sum active_seconds, breakdown page.
4. Project reach: $pageview count, breakdown page.
5. Contact funnel: $pageview → project_click → contact_click (across pages).
6. Résumé intent: resume_open / resume_download / resume_print counts.
7. Chat usage: chat_opened → chat_question → chat_answer.

No authenticated access to the PostHog dashboard was provided, so these dashboard widgets are instructions rather than already-created account objects.

## Verified

The real JavaScript SDK loaded in the cloud browser. Its pageview, chatbot-usage and engagement batches received HTTP 200 responses from PostHog (/e/ and /i/v0/e/). Local test traffic was labelled environment=test. This confirms ingestion acceptance; visibility in the authenticated dashboard was not inspected. Browser opt-out reloaded the privacy page with the disabled state visible. Node checks cover payload sanitization, SDK replacement, hidden-tab time exclusion, opt-out/DNT, event allowlisting and one installation per HTML page.

## GitHub upload

Extract Ibrahim_Javed_Portfolio_Redesigned.zip first. Upload its website contents to the repository root so index.html is at the root, not inside an extra folder. Keep GitHub Pages configured to main / (root). The assistant-server folder contains the separately deployed Cloudflare backend source; GitHub Pages does not run it. The frontend is already configured to call the live workers.dev endpoint.

## Chat recording update
Chat notice links to privacy.html. Optional name/email fields are submitted with a question. chat_question and chat_answer include chat_message. A supplied email is used with PostHog identify; visitor_name and visitor_email are profile properties. Names alone appear on chat_details_shared without claiming a verified identity. Visitors without details remain unidentified. Opt-out/DNT/GPC disable these analytics too. Prior statements above about transcript exclusion describe the earlier version and are superseded by this section. Live ingestion for this update has not been verified.
