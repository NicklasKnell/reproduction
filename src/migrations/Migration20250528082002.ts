import { Migration } from '@mikro-orm/migrations';

export class Migration20250528082002 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "user" ("id" serial primary key, "accounts" jsonb not null default );`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "user" cascade;`);
  }

}
