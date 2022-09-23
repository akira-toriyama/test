const denoRun = async (pa: { cmd: Array<string> }) => {
  const p = Deno.run({
    cmd: pa.cmd,
    stdout: "piped",
    stderr: "piped",
  });

  await p.status();
  p.close();

  return p.output()
    .then((v) => new TextDecoder().decode(v));
};

type Issues = Array<{ body: string; number: number; title: string }>;

export const fetchIssues = () =>
  denoRun({
    cmd: ["gh", "issue", "list", "--assignee=@me", "--json=number,title,body"],
  }).then<Issues>((v) => JSON.parse(v)).then((v) => (
    v.map((vv) => ({
      name: `#${vv.number}
title: ${vv.title}
body: ${vv.body}`,
      value: vv.number.toString(),
    }))
  ));
