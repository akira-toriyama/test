import { join } from "https://deno.land/std/path/mod.ts";

const commitEditmsgPath = join(".git", "COMMIT_EDITMSG");
type SetCommitMessage = (p: { message: string }) => Promise<void>;
/**
 * Set a Message for `./.git/COMMIT_EDITMSG`.
 */
export const setCommitMessage: SetCommitMessage = (p) =>
  Deno.writeTextFile(commitEditmsgPath, p.message).catch(console.error);
