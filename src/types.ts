import { Request as ExpressRequest } from 'express';
import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";

export interface MyRequest extends ExpressRequest {
    em: EntityManager<IDatabaseDriver<Connection>>;
}

export type MyContext = {
    em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
}
