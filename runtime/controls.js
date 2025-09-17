export function toggle(value) {
  return value;
}

export function number(value, min, max, step) {
  if (typeof min === "number" && value < min) value = min;
  if (typeof max === "number" && value > max) value = max;
  return value;
}

export function radio(index, ...values) {
  return values[index];
}
