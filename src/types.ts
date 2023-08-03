import { Request } from 'express';
import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";

export interface MyRequest extends Request {
  em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
}

export type MyContext = {
    em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>
}
