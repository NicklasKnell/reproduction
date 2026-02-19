import { Platform, Type } from '@mikro-orm/postgresql';
import { MyEvent } from './types/MyEvent';
import { CalendarDate } from 'calendar-date';

export class EventType extends Type<MyEvent | null, string | null> {
  private readonly length?: number;

  constructor(length?: number) {
    super();
    this.length = length;
  }


  convertToDatabaseValue(value: MyEvent | null): string | null {
    if (!value) {
      return value as null;
    }

    return JSON.stringify(value);
  }

  convertToJSValue(value: string | MyEvent | null, platform: Platform): MyEvent | null {
    if (value == null) {
      return value as null;
    }

    if(platform.convertsJsonAutomatically()) {
      console.log(value, typeof value);
    }

    let parsedValue: MyEvent;
    if (typeof value === 'string') {
      parsedValue = JSON.parse(value);
    } else {
      parsedValue = value;
    }

    return {
      title: parsedValue.title,
      date: CalendarDate.parse(parsedValue.date.toString()),
    };
  }

  getColumnType(): string {
    return 'jsonb';
  }
}

