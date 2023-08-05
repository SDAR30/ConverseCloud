import { Request, Response } from 'express';
import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";

// export interface MyRequest extends Request {
//   em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
// }

import "express-session";
import { Session } from 'inspector';
import { SessionData } from 'express-session';

declare module 'express-session' {
    export interface Session {
        userId: number;
    }
}
export type MyContext = {
    em: EntityManager<IDatabaseDriver<Connection>>;
    req: Request & { session: Session & Partial<SessionData> };
    res: Response;
}