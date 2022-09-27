import { main } from "./conventionalCommits.ts";
import * as git from "../../externalInterface/git.ts";

main({
  userInterFace: {
    template: `{{type}}: {{subject}}
  
{{body}}
BREAKING CHANGE: {{breakingChange}}`,
  },
  question: {
    type: {
      options: [
        {
          value: "build",
          name:
            "build: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)",
        },
        {
          value: "ci",
          name:
            "ci: Changes to our CI configuration files and scripts (examples: CircleCi, SauceLabs)",
        },
        { value: "docs", name: "docs: Documentation only changes" },
        { value: "feat", name: "feat: A new feature" },
        { value: "fix", name: "fix: A bug fix" },
        {
          value: "perf",
          name: "perf: A code change that improves performance",
        },
        {
          value: "refactor",
          name:
            "refactor: A code change that neither fixes a bug nor adds a feature",
        },
        {
          value: "test",
          name: "test: Adding missing tests or correcting existing tests",
        },
      ],
    },
  },
})
  .then((v) => git.setCommitMessage({ message: v }))
  .catch(console.error);
