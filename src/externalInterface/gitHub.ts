import { denoRun } from "./denoRun.ts";

type IssuesStruct = Array<{ body: string; number: number; title: string }>;
type FetchIssues = () => Promise<
  never[] | {
    number: number;
    title: string;
    body: string;
  }[]
>;
/**
 * `gh` to get the issues.
 */
export const fetchIssues: FetchIssues = () =>
  denoRun({
    cmd: ["gh", "issue", "list", "--assignee=@me", "--json=number,title,body"],
  }).then<IssuesStruct>((v) => {
    if (typeof v === "string") {
      return JSON.parse(v);
    }
    return [];
  })
    .catch((e) => {
      console.error(e);
      return [];
    });
