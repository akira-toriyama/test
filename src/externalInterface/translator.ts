type MakeUrl = (p: {
  txt: string;
  targetLang: string;
}) => string;
const makeUrl: MakeUrl = (p) =>
  `https://api-free.deepl.com/v2/translate?text=${
    encodeURI(p.txt)
  }&target_lang=${p.targetLang}`;

type TranslateResponse =
  | null
  | {
    translations: Array<{
      detected_source_language: "EN";
      text: string;
    }>;
  };

type Translate = (p: {
  txt: string;
  targetLang: string;
  translateAuthKey: string;
}) => Promise<string | void | undefined>;
/**
 * @see https://www.deepl.com/docs-api/translate-text/translate-text/
 */
export const translate: Translate = (p) =>
  fetch(makeUrl(p), {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${p.translateAuthKey}`,
    },
  })
    .then<TranslateResponse>((v) => v.ok ? v.json() : null)
    .then((v) => v?.translations.at(0)?.text)
    .catch(console.error);
