import { Embedded, Entity, PrimaryKey } from "@mikro-orm/postgresql";
import { Account } from "./Account";

@Entity()
export class User {
  @PrimaryKey()
  id: number;

  @Embedded({ array: true, default: [] })
  accounts: Account[] = [];

  constructor(id: number) {
    this.id = id;
  }
}
