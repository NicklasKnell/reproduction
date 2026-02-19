import { JsonType, Platform, Type } from '@mikro-orm/postgresql';
import { MyEvent } from './types/MyEvent';
import { CalendarDate } from 'calendar-date';

type MyEventRaw = Omit<MyEvent, 'date'> & { date: string };

export class EventType extends JsonType {
  constructor() {
    super();
  }

  convertToDatabaseValue(value: MyEvent): string {
    return JSON.stringify(value);
  }

  convertToJSValue(rawValue: MyEventRaw, platform: Platform): MyEvent {
    const value = super.convertToJSValue(rawValue, platform) as MyEventRaw; // Am i supposed to call that? Doesn't seem to make a difference

    if (typeof value === 'string') {
      console.warn("Manually parsing value because it is still a string.");
      const parsedValue = JSON.parse(value) as MyEventRaw;
      return  {
        title: parsedValue.title,
        date: CalendarDate.parse(parsedValue.date.toString()),
      };
    }

    return {
      title: value.title,
      date: CalendarDate.parse(value.date.toString()),
    };
  }
}

