import * as translator from "~/src/externalInterface/translator.ts";

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
