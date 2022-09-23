type MakeUrl = (p: {
  txt: string;
  grammarAuthKey: string;
}) => string;
const makeUrl: MakeUrl = (p) =>
  `https://api.textgears.com/grammar?key=${p.grammarAuthKey}&text=${
    encodeURI(p.txt)
  }`;

type GrammarCheckResponse = null | {
  status: boolean;
  response: {
    result: boolean;
    errors: Array<
      {
        id: string;
        offset: number;
        length: number;
        description: {
          en: string;
        };
        bad: string;
        better: Array<string>;
        type: "spelling";
      }
    >;
  };
};
type GrammarCheck = (p: {
  txt: string;
  grammarAuthKey: string;
}) => Promise<
  void | {
    description: {
      en: string;
    };
    bad: string;
    better: string[];
  }[]
>;

/**
 * @see https://textgears.com/api#grammar
 */
export const grammarCheck: GrammarCheck = (p) =>
  fetch(makeUrl(p))
    .then<GrammarCheckResponse>((v) => v.ok ? v.json() : null)
    .then((v) => {
      if (v === null) {
        return [];
      }

      const allowTexts = p.txt.match(/`(.*?)`/g) || [];
      return v.response.errors
        .map((vv) => ({
          description: {
            en: vv.description.en,
          },
          bad: vv.bad,
          better: vv.better,
        }))
        .filter((o) => !allowTexts.some((txt) => txt === `\`${o.bad}\``)) || [];
    })
    .catch(console.error);
