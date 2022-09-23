type GitmojiStruct = {
  emoji: string;
  entity: string;
  code: string;
  description: string;
  name: string;
  semver: null | "patch" | "minor" | "major";
};

const gitmojisPath =
  "https://raw.githubusercontent.com/carloscuesta/gitmoji/master/src/data/gitmojis.json";

export const fetchGitmojis = () =>
  fetch(gitmojisPath)
    .then<{ gitmojis: GitmojiStruct[] }>((v) =>
      v.ok ? v.json() : { gitmojis: [] }
    )
    .then((v) =>
      v.gitmojis.map((vv) => ({
        name: `${vv.emoji}: ${vv.description}`,
        value: vv.code,
      } as const))
    )
    .catch((e) => {
      console.error(e);
      return [];
    });
