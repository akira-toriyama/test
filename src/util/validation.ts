import * as grammar from "/src/externalInterface/grammar.ts";

export const validateGrammar = (p: { input: string; grammarAuthKey: string }) =>
  grammar.grammarCheck({
    txt: p.input,
    grammarAuthKey: p.grammarAuthKey,
  })
    .then((r) => {
      if (!r) {
        return { type: "valid" } as const;
      }
      return {
        type: "error",
        reason: r,
      } as const;
    });
