import gitmojis from "https://raw.githubusercontent.com/carloscuesta/gitmoji/master~/src/data/gitmojis.json" assert {
  type: "json",
};

/**
 * @see https://raw.githubusercontent.com/carloscuesta/gitmoji/master~/src/data/gitmojis.json
 */
export const getGitmojis = () => gitmojis.gitmojis;
