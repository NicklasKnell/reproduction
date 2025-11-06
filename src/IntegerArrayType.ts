import { Type, ValidationError } from '@mikro-orm/postgresql';

export class IntegerArrayType extends Type<number[] | null, string | null> {
  private readonly length?: number;

  constructor(length?: number) {
    super();
    this.length = length;
  }

  static lengthValidationError(value: number[], mode: string, length: number) {
    return new ValidationError(
      `Could not convert ${mode} value of type ${IntegerArrayType.name}. Array length must be ${length} but received ${value.length}.`,
    );
  }

  convertToDatabaseValue(value: number[] | null): string | null {
    if (!value) {
      return value as null;
    }
    if (this.length && value.length !== this.length) {
      throw IntegerArrayType.lengthValidationError(value, 'JS', this.length);
    }
    return `{${value.join(',')}}`;
  }

  convertToJSValue(value: string | null): number[] | null {
    if (value == null) {
      return value as null;
    }
    if (!Array.isArray(value)) {
      throw ValidationError.invalidType(IntegerArrayType, value, 'database');
    }
    if (this.length && value.length !== this.length) {
      throw IntegerArrayType.lengthValidationError(value, 'database', this.length);
    }
    return value;
  }

  compareAsType(): string {
    return 'number[]';
  }

  getColumnType(): string {
    return 'int4[]';
  }
}

