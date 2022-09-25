type GitmojiStruct = {
  emoji: string;
  entity: string;
  code: string;
  description: string;
  name: string;
  semver: null | "patch" | "minor" | "major";
};

type FetchGitmojis = () => Promise<
  never[] | {
    name: string;
    value: string;
  }[]
>;

/**
 * @see https://raw.githubusercontent.com/carloscuesta/gitmoji/master/src/data/gitmojis.json
 */
export const fetchGitmojis: FetchGitmojis = () =>
  fetch(
    "https://raw.githubusercontent.com/carloscuesta/gitmoji/master/src/data/gitmojis.json",
  )
    .then<{ gitmojis: GitmojiStruct[] }>((v) =>
      v.ok ? v.json() : { gitmojis: [] }
    )
    .then((v) =>
      v.gitmojis.map((vv) => ({
        name: `${vv.emoji}: ${vv.description}`,
        value: vv.code,
      }))
    )
    .catch((e) => {
      console.error(e);
      return [];
    });
