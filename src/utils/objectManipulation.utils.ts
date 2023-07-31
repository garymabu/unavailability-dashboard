import _ from 'lodash';

function isNonNullObject(value: unknown): value is Record<any, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// eslint-disable-next-line import/prefer-default-export
export function deepRemoveUndefinedProperties<T extends {}>(
  obj: T
): Partial<T> {
  return Object.entries(obj).reduce((accumulator: Partial<T>, [key, value]) => {
    if (value !== undefined) {
      const newAccumulator = { ...accumulator };

      if (isNonNullObject(value)) {
        newAccumulator[key as keyof T] = deepRemoveUndefinedProperties(
          value
        ) as T[keyof T];
      } else {
        newAccumulator[key as keyof T] = value as T[keyof T];
      }

      return newAccumulator;
    }
    return accumulator;
  }, {});
}

export function deepClone<T extends {}>(obj: T): T {
  return _.cloneDeep(obj);
}
