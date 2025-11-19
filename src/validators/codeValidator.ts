export function isValidCode(code: string): boolean {
  // Must be 6-8 alphanumeric characters
  const codeRegex = /^[A-Za-z0-9]{6,8}$/;
  return codeRegex.test(code);
}
