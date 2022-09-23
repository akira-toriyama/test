// const denoRun = async (pa: { cmd: Array<string> }) => {
//   const p = Deno.run({
//     cmd: pa.cmd,
//     stdout: "piped",
//     stderr: "piped",
//   });

//   await p.status();
//   p.close();

//   return p.output()
//     .then((v) => new TextDecoder().decode(v));
// };

// export const fn = (p: { message: string }) =>
//   denoRun({
//     cmd: ["echo", "piyo", ">", "/Volumes/workspace/tmp/im/.git/COMMIT_EDITMSG"],
//   });

export const fn = (p: { message: string }) =>
  Deno.writeTextFile(
    "./.git/COMMIT_EDITMSG",
    p.message,
  );
