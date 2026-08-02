# Signal subscriber automation

The website accepts newsletter opt-ins at `POST /api/subscribe`. Every email is stored in `data/subscribers.json` locally and, when configured, posted to your n8n webhook. This setup does **not** require Docker.

## Start locally

1. Run the website server: `npm run dev` (the app runs on `http://127.0.0.1:3000`).
2. Run n8n locally and open `http://localhost:5678`.
3. Import `workflows/sentiment-pipeline.json` again after this update.

## n8n setup

1. Create a new workflow with a **Webhook** trigger using `POST` and path `signal-subscriber`.
2. In the Webhook node, optionally verify the `X-Subscriber-Secret` header against your `N8N_SUBSCRIBER_WEBHOOK_SECRET` value.
3. Add a **Data Store** or **Google Sheets** node. Save `{{$json.subscriber.email}}` and `{{$json.subscriber.subscribed_at}}`; use the email as the unique key to avoid duplicates.
4. The existing `sentiment-pipeline.json` now has **Fetch Signal Subscribers** and **Attach Subscriber Recipients** nodes. It fetches the protected subscriber list and sends the daily email to every registered address rather than a hard-coded recipient.
5. In **Step 3A: Fetch Signal Subscribers**, replace `REPLACE_WITH_N8N_SUBSCRIBER_SECRET` with the same secret used for `N8N_SUBSCRIBER_WEBHOOK_SECRET` in the website environment. The node uses `http://127.0.0.1:3000`, not `$env`, so the “access to env vars denied” error is fixed. It retries three times and waits up to 15 seconds.
6. If n8n runs on another machine or n8n Cloud, `127.0.0.1` points to that n8n host—not your computer. Replace the URL with a publicly reachable HTTPS URL for this app.

The public endpoint deliberately has no list/read route, so subscriber email addresses are not exposed by the app.
