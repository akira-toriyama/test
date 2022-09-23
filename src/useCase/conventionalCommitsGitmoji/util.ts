export const subject = {
  isValid: (p: unknown[] | void) => {
    if (p === undefined) {
      return true;
    }
    return p?.length === 0;
  },
  fmt: (p: unknown) => JSON.stringify(p, null, 2),
};
