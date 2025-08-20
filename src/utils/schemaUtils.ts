// Recursive function to flatten the object keys
export function flattenObject(
  obj: any,
  parentKey = "",
  separator = "."
): Record<string, any> {
  return Object.keys(obj).reduce((acc, key) => {
    const newKey = parentKey ? `${parentKey}${separator}${key}` : key;
    if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      Object.assign(acc, flattenObject(obj[key], newKey, separator));
    } else {
      acc[newKey] = obj[key];
    }
    return acc;
  }, {} as Record<string, any>);
}

export const generateFields = (sampleData: Record<string, any>) => {
  const flattened = flattenObject(sampleData);
  return Object.keys(flattened).map((key) => ({
    name: key,
    label: key, // e.g., "Composite.MidPrice"
  }));
};
