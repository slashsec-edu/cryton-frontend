export const compareArrays = <T>(arrayOne: T[], arrayTwo: T[], compareFn: (a: T, b: T) => boolean): boolean => {
  const arrayTwoCopy = [...arrayTwo];

  if (arrayOne.length !== arrayTwo.length) {
    return false;
  }

  for (const item of arrayOne) {
    const matchingItem = arrayTwoCopy.find(arrayTwoItem => compareFn(item, arrayTwoItem));

    if (!matchingItem) {
      return false;
    }

    removeArrayItem(arrayTwoCopy, matchingItem);
  }

  return true;
};

export const removeArrayItem = <T>(array: T[], item: T): void => {
  const itemIndex = array.indexOf(item);

  if (itemIndex === -1) {
    return;
  }

  array.splice(itemIndex, 1);
};
