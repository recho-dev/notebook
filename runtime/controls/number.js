export function number(value, {min, max, step} = {}) {
  if (typeof min === "number" && value < min) value = min;
  if (typeof max === "number" && value > max) value = max;
  return value;
}
