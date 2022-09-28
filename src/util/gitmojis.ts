import * as gitmoji from "../externalInterface/gitmoji.ts";

const findSemver = (p: string | null) => {
  if (p === null) {
    return "x.x.x";
  }

  if (p === "patch") {
    return "x.x.o";
  }

  if (p === "minor") {
    return "x.o.x";
  }

  if (p === "major") {
    return "o.x.x";
  }

  return "?.?.?";
};

export const gitmojis = gitmoji.getGitmojis()
  .map((v) => ({
    ...v,
    semver: findSemver(v.semver),
  }))
  .map((v) => ({
    name: `${v.emoji}(${v.semver.replaceAll(".", "")}): ${v.description}`,
    value: `${v.code}(${v.semver})`,
  }));
