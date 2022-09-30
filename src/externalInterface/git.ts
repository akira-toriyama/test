import { join } from "https://deno.land/std@0.157.0/path/mod.ts";
import { notify } from "./notification.ts";

const commitEditMsgPath = join(".git", "COMMIT_EDITMSG");
type SetCommitMessage = (p: { message: string }) => Promise<void>;
/**
 * Set a Message for `./.git/COMMIT_EDITMSG`.
 */
export const setCommitMessage: SetCommitMessage = (p) =>
  Deno.writeTextFile(commitEditMsgPath, p.message)
    .catch((e) => {
      notify({ title: "setCommitMessage", message: e });
      console.error(e);
    });
