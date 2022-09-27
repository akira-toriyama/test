import { denoRun } from "./denoRun.ts";

type IssuesStruct = Array<{ body: string; number: number; title: string }>;
type FetchIssues = () => Promise<
  never[] | {
    name: string;
    value: string;
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
  }).then((v) => (
    v.map((vv) => ({
      name: `#${vv.number}
title: ${vv.title}
body: ${vv.body}`,
      value: `#${vv.number}`,
    }))
  )).catch((e) => {
    console.error(e);
    return [];
  });
