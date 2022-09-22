const matchesCombinationWithOrder = (
  combination: Array<string>,
  target: Array<string>
): boolean => {
  return combination.every((value, index) => value == target[index]);
};

const matchesCombinationWithoutOrder = (
  combination: Array<string>,
  target: Array<string>
): boolean => {
  return combination.reduce(
    (matches, value) => matches && target.includes(value),
    true
  );
};

export { matchesCombinationWithOrder, matchesCombinationWithoutOrder };
