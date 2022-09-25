type DenoRun = (pa: {
  cmd: Array<string>;
}) => Promise<string | void>;
const denoRun: DenoRun = async (pa) => {
  const p = Deno.run({
    cmd: pa.cmd,
    stdout: "piped",
    stderr: "piped",
  });

  await p.status().catch(console.error);
  p.close();

  return p.output()
    .then((v) => new TextDecoder().decode(v)).catch(console.error);
};

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
      value: vv.number.toString(),
    }))
  )).catch((e) => {
    console.error(e);
    return [];
  });
