export class Byte {
  private _value: Uint8Array;

  public constructor(value: number) {
    if (value < 0 || value > 254)
      throw new TypeError(`Invalid Uint8 Value: ${value}`);

    this._value = new Uint8Array([value]);
  }

  get value(): number {
    return this._value[0];
  }
}
