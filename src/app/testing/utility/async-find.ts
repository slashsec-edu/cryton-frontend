export const findAsync = async <T extends unknown>(arr: T[], asyncCallback: (t: T) => Promise<boolean>): Promise<T> => {
  const promises = arr.map(asyncCallback);
  const results = await Promise.all(promises);
  const index = results.findIndex(result => result);
  return arr[index];
};
