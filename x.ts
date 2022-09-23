// /Volumes/workspace/tmp/im/piyo.ts

// export const fn = (p: { message: string }) =>
//   Deno.writeTextFile(
//     "./.git/COMMIT_EDITMSG",
//     p.message,
//   );

const n = "/Volumes/workspace/tmp/im/piyo.ts";

const load = (xx) => import(xx) as Promise<{ x: { foo: string } }>;

const v = await load(n);
console.log(v.x.foo);
