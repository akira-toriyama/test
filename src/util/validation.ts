import * as grammar from "../externalInterface/grammar.ts";

export const validateGrammar = (p: { input: string; grammarApiKey: string }) =>
  grammar.grammarCheck({
    txt: p.input,
    grammarApiKey: p.grammarApiKey,
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
