import { denoRun } from "./denoRun.ts";

export const notify = (p: { title: string; message: string }) =>
  denoRun({
    cmd: ["terminal-notifier", "-title", p.title, "-message", p.message],
  });
