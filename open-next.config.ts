import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Every route in this app is force-dynamic, so there is no incremental cache
// to configure — no R2 bucket and no self-referencing service binding needed.
export default defineCloudflareConfig();
