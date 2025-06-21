function isObject(arg: unknown): arg is { [key: string]: unknown } {
  return typeof arg === "object" && arg != null;
}

export default isObject;
