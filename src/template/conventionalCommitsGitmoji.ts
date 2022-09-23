import {
  Input,
  prompt,
  Select,
} from "https://deno.land/x/cliffy@v0.25.0/prompt/mod.ts";

import * as gitmoji from "../externalInterface/gitmoji.ts";
import * as grammar from "../externalInterface/grammar.ts";
// import * as gitHub from "../externalInterface/gitHub.ts";
import * as gitHub from "https://github.com/akira-toriyama/test/blob/main/src/externalInterface/gitHub.ts";

import * as zzz from "../userInterface/x.ts";
import * as git from "../externalInterface/git.ts";

const initialization = async () => {
  const gitmojis = await gitmoji.fetchGitmojis();
  const issues = await gitHub.fetchIssues();

  return { gitmojis, issues };
};

const subjectUtil = {
  isValid: (p: unknown[] | void) => {
    if (p === undefined) {
      return true;
    }
    return p?.length === 0;
  },
  fmt: (p: unknown) => JSON.stringify(p, null, 2),
};

const main = async (p: { tpl: string }) => {
  const { gitmojis, issues } = await initialization();

  let _tpl = p.tpl;

  const xxx = await prompt([
    {
      name: "type",
      message: "Select a type.",
      type: Select,
      options: [
        { name: "xxx: No release", value: "xxx" },
        { name: "xxo: Patch", value: "xxo" },
        { name: "xox: Minor", value: "xox" },
        { name: "oxx: Major", value: "oxx" },
      ],
      search: true,
      before: async (x, next) => {
        _tpl = zzz.cococo({ tpl: _tpl, keyValue: x });

        // TODO name を自動で取得
        const r = zzz.co({ tpl: _tpl, name: "type" });

        zzz.ui({ value: r });

        await next();
      },
    },
    {
      name: "gitmoji",
      message: "Select a gitmoji.",
      type: Select,
      options: gitmojis,
      search: true,
      before: async (x, next) => {
        _tpl = zzz.cococo({ tpl: _tpl, keyValue: x });

        // TODO name を自動で取得
        const r = zzz.co({ tpl: _tpl, name: "gitmoji" });

        zzz.ui({ value: r });

        await next();
      },
    },
    {
      name: "subject",
      message: "Enter subject.",
      type: Input,
      hint:
        "Surrounding it with an ` allows it. example: Add myFunc -> Add `myFunc`",
      validate: (input) => {
        if (!input) {
          return true;
        }

        return grammar.grammarCheck({ txt: input }).then((r) => {
          if (subjectUtil.isValid(r)) {
            return true;
          }
          // TODO 調整
          console.error(subjectUtil.fmt(r));
          // error
          return "";
        });
      },
      before: async (x, next) => {
        _tpl = zzz.cococo({ tpl: _tpl, keyValue: x });

        // TODO name を自動で取得
        const r = zzz.co({ tpl: _tpl, name: "subject" });

        zzz.ui({ value: r });

        await next();
      },
    },
    {
      name: "issue",
      message: "Select a issue.",
      type: Select,
      options: [{ name: "_", value: "_" }, ...issues],
      search: true,
      before: async (x, next) => {
        _tpl = zzz.cococo({ tpl: _tpl, keyValue: x });

        // TODO name を自動で取得
        const r = zzz.co({ tpl: _tpl, name: "issue" });

        zzz.ui({ value: r });

        await next();
      },
      after: async (x, next) => {
        _tpl = zzz.cococo({ tpl: _tpl, keyValue: x }).replace(
          / Close #_\r?\n/,
          "\n",
        ).trim();

        await next();
      },
    },
    {
      name: "body",
      message: "Enter body.",
      type: Input,
      before: async (x, next) => {
        const n = zzz.cococo({ tpl: _tpl, keyValue: x });

        // TODO name を自動で取得
        const r = zzz.co({ tpl: n, name: "body" });
        zzz.ui({ value: r });
        await next();
      },
      after: async (x, next) => {
        _tpl = zzz.cococo({ tpl: _tpl, keyValue: x }).trim().trim();

        await next();
      },
    },
  ]);

  return _tpl;
  //   console.log(_tpl);
  //   const n = zzz.cococo({ tpl: p.tpl, keyValue: xxx });
  //   // TODO name を自動で取得
  //   const r = zzz.co({ tpl: n, name: "body" });
  //   zzz.ui({ value: r });
};

main({ tpl: zzz.template }).then((v) => git.fn({ message: v }));
