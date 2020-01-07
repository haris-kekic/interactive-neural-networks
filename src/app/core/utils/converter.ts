export class Converter {
  static floatOrZero(str: string) {
    const result = parseFloat(str);
    return result != NaN ? result : 0;
  }
}
