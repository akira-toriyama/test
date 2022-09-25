import gitmojis from "https://raw.githubusercontent.com/carloscuesta/gitmoji/master/src/data/gitmojis.json" assert {
  type: "json",
};

type FetchGitmojis = () => {
  name: string;
  value: string;
}[];

/**
 * @see https://raw.githubusercontent.com/carloscuesta/gitmoji/master/src/data/gitmojis.json
 */
export const getGitmojis: FetchGitmojis = () =>
  gitmojis.gitmojis.map((v) => ({
    name: `${v.emoji}: ${v.description}`,
    value: v.code,
  }));
