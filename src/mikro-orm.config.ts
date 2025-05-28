import { FlushMode, Options, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";
import { Migrator } from "@mikro-orm/migrations";
import { User } from "./User";
import { Account } from "./Account";

const config: Options = {
  driver: PostgreSqlDriver,
  entities: [User, Account],
  dbName: "mikro-orm-reproduction",
  host: "localhost",
  port: 5432,
  user: "admin",
  password: "admin",
  metadataProvider: TsMorphMetadataProvider,
  flushMode: FlushMode.COMMIT,
  migrations: {
    snapshot: false,
  },
  extensions: [Migrator],
};
export default config;
