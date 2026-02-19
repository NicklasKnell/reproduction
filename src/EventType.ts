import { JsonType, Platform, Type } from '@mikro-orm/postgresql';
import { MyEvent } from './types/MyEvent';
import { CalendarDate } from 'calendar-date';

export class EventType extends JsonType {
  constructor() {
    super();
  }

  convertToDatabaseValue(value: MyEvent | null): string | null {
    if (!value) {
      return value as null;
    }

    return JSON.stringify(value);
  }

  convertToJSValue(value: MyEvent | null, platform: Platform): MyEvent | null {
    if (value == null) {
      return value as null;
    }

    if(platform.convertsJsonAutomatically()) {
      console.log(value, typeof value);
    }

    let parsedValue: MyEvent;
    if (typeof value === 'string') {
      console.log('Parsing JSON string:', value);
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

