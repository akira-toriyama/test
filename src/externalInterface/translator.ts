// TODO envは引数から

const makeUrl = (p: { txt: string }) =>
  `https://api-free.deepl.com/v2/translate?text=${
    encodeURI(p.txt)
  }&target_lang=${Deno.env.get("DEEPL_TARGET_LANG")}`;

type TranslateResponse =
  | null
  | {
    translations: Array<{
      detected_source_language: "EN";
      text: string;
    }>;
  };

export const translate = (p: { txt: string }) =>
  fetch(makeUrl(p), {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${Deno.env.get("DEEPL_AUTH_KEY")}`,
    },
  })
    .then<TranslateResponse>((v) => v.ok ? v.json() : null)
    .then((v) => v?.translations.at(0)?.text)
    .catch(console.error);
