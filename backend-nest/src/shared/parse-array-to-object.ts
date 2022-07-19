export const parseArrayToObject = (array: any[]) =>
  array.reduce((accumulatedObject, currentItem) => {
    const { _id, ...rest } = currentItem;
    return { ...accumulatedObject, [_id]: rest };
  }, {});
