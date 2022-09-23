// import * as mod from "https://deno.land/x/at_test@0.0.5/src/externalInterface/gitHub.ts";
// import * as mod from "https://deno.land/x/at_test/src/externalInterface/gitHub.ts";

import * as mod from "https://deno.land/x/at_test@0.0.8/externalInterface/gitHub.ts";

mod.fetchIssues().then(console.log);
