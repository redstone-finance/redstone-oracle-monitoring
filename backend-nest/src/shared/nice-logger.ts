import util from "util";

export const log = (val: any) => {
  console.log(util.inspect(val, { depth: null, colors: true }));
};
