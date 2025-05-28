import { Embeddable, Property } from "@mikro-orm/core";

@Embeddable()
export class Account {
  @Property()
  accountName: string;

  @Property()
  accountPassword: string;

  constructor(args: { accountName: string; accountPassword: string }) {
    this.accountName = args.accountName;
    this.accountPassword = args.accountPassword;
  }
}
