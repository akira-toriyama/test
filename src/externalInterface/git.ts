// import { join } from "https://deno.land/std/path/mod.ts";

type SetCommitMessage = (p: { message: string }) => Promise<void>;
/**
 * Set a Message for `./.git/COMMIT_EDITMSG`.
 */
export const setCommitMessage: SetCommitMessage = (p) =>
  Deno.writeTextFile(
    ".git/COMMIT_EDITMSG",
    p.message,
  ).catch(console.error);
