import * as grammar from "../externalInterface/grammar.ts";
import * as translator from "../service/translator.ts";

export const validate = (input: string) => {
  if (!input) {
    return Promise.resolve(
      {
        type: "error",
        reason: "Please input.",
      } as const,
    );
  }

  return grammar.grammarCheck({
    txt: input,
    grammarAuthKey: Deno.env.get("GRAMMAR_API_KEY"),
  })
    .then(async (v) => {
      if (!v) {
        return Promise.resolve({ type: "valid" } as const);
      }

      const r = await translator.translate({
        messages: v,
        translate: {
          targetLang: Deno.env.get("DEEPL_TARGET_LANG"),
          authKey: Deno.env.get("DEEPL_AUTH_KEY"),
        },
      });

      if (r.length === 0) {
        return Promise.resolve({ type: "valid" } as const);
      }

      return {
        type: "error",
        reason: r,
      } as const;
    });
};
