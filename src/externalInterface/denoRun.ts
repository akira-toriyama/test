type DenoRun = (pa: {
  cmd: Array<string>;
}) => Promise<string | void>;

export const denoRun: DenoRun = async (pa) => {
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
