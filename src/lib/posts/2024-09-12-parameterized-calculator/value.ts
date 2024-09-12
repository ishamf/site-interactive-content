import Fraction from 'fraction.js';

export class Value {
  fraction: Fraction;

  invalidReason?: string;

  constructor(fraction: Fraction) {
    this.fraction = fraction;
  }

  static fromNumber(x: number) {
    return new Value(new Fraction(x));
  }

  static invalid(reason: string) {
    const value = new Value(new Fraction(1));
    value.invalidReason = reason;

    return value;
  }

  checkInvalid(other?: Value): Value | null {
    if (this.invalidReason) {
      return this;
    }

    if (other?.invalidReason) {
      return other;
    }

    return null;
  }

  add(other: Value) {
    const invalidCheck = this.checkInvalid(other);
    if (invalidCheck) return invalidCheck;

    return new Value(this.fraction.add(other.fraction));
  }

  subtract(other: Value) {
    const invalidCheck = this.checkInvalid(other);
    if (invalidCheck) return invalidCheck;

    return this.add(other.neg());
  }

  mul(other: Value) {
    const invalidCheck = this.checkInvalid(other);
    if (invalidCheck) return invalidCheck;

    return new Value(this.fraction.mul(other.fraction));
  }

  div(other: Value) {
    const invalidCheck = this.checkInvalid(other);
    if (invalidCheck) return invalidCheck;

    if (other.fraction.equals(0)) {
      return Value.invalid('Cannot divide by zero');
    }

    return new Value(this.fraction.div(other.fraction));
  }

  neg() {
    const invalidCheck = this.checkInvalid();
    if (invalidCheck) return invalidCheck;

    return new Value(this.fraction.neg());
  }

  expNumber(other: number) {
    return this.exp(Value.fromNumber(other));
  }

  exp(other: Value) {
    const invalidCheck = this.checkInvalid(other);
    if (invalidCheck) return invalidCheck;

    let fractionResult = this.fraction.pow(other.fraction);

    if (!fractionResult) {
      // fallback to floating point multiplication
      fractionResult = new Fraction(Math.pow(this.fraction.valueOf(), other.fraction.valueOf()));
    }

    return new Value(fractionResult);
  }

  toString() {
    if (this.invalidReason) {
      return this.invalidReason;
    }

    return this.fraction
      .valueOf()
      .toFixed(5)
      .replace(/\.?0+$/, '');
  }
}
