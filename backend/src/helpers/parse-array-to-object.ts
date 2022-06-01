export const parseArrayToObject = (array: any[]) =>
  array.reduce((object, item) => {
    const { _id, ...rest } = item;
    return { ...object, [_id]: rest };
  }, {});
