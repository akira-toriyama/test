import * as translator from "../externalInterface/translator.ts";

type Translate = (p: {
  messages: Array<{
    description: {
      en: string;
    };
  }>;
  translate: {
    deeplTargetLang: string;
    deeplAuthKey: string;
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
        deeplTargetLang: p.translate.deeplTargetLang,
        translateAuthKey: p.translate.deeplAuthKey,
      })
    ),
  );

  return p.messages.map((e, i) => ({
    ...e,
    description: {
      ...e.description,
      [p.translate?.deeplTargetLang]: translatedTxt.at(i),
    },
  }));
};
