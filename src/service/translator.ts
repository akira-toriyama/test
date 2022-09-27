import * as translator from "../externalInterface/translator.ts";

type Translate = (p: {
  messages: Array<{
    description: {
      en: string;
    };
  }>;
  translate: {
    targetLang: string;
    authKey: string;
  };
}) => Promise<{
  description: {
    en: string;
  };
}[]>;

export const translate: Translate = async (p) => {
  const translatedTxt = await Promise.all(
    p.messages.map((e) =>
      translator.translate({
        txt: e.description.en,
        targetLang: p.translate.targetLang,
        translateAuthKey: p.translate.authKey,
      })
    ),
  );

  return p.messages.map((e, i) => ({
    ...e,
    description: {
      ...e.description,
      [p.translate?.targetLang]: translatedTxt.at(i),
    },
  }));
};

// export const validateGrammar = (p: { input: string }) => {
//   if (!p.input) {
//     return Promise.resolve(
//       {
//         type: "error",
//         reason: {
//           description: [{
//             en: "Please input.",
//           }],
//         },
//       } as const,
//     );
//   }

//   return grammar.grammarCheck({
//     txt: p.input,
//     grammarAuthKey: Deno.env.get("GRAMMAR_API_KEY"),
//   })
//     .then(async (v) => {
//       if (!v) {
//         return Promise.resolve({ type: "valid" } as const);
//       }

//       const r = await translator.translate({
//         messages: v,
//         translate: {
//           targetLang: Deno.env.get("DEEPL_TARGET_LANG"),
//           authKey: Deno.env.get("DEEPL_AUTH_KEY"),
//         },
//       });

//       if (r.length === 0) {
//         return Promise.resolve({ type: "valid" } as const);
//       }

//       return {
//         type: "error",
//         reason: r,
//       } as const;
//     });
// };
