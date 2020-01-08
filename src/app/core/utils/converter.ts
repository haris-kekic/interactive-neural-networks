export class Converter {
  static floatOrZero(str: string) {
    const result = parseFloat(str);
    return !isNaN(result) ? result : 0;
  }
}
