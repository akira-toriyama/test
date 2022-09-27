import { main } from "./gitmojiCommits.ts";
import * as git from "../../externalInterface/git.ts";
import { colors } from "https://deno.land/x/cliffy@v0.25.0/ansi/colors.ts";

main({
  userInterFace: {
    targetHighlighter: colors.bold.bgGreen,
    borderColorSetter: colors.green.bold,
    template: `{{gitmoji}} {{subject}}
  
{{body}}`,
  },
  question: {},
})
  .then((v) => git.setCommitMessage({ message: v }))
  .catch(console.error);
