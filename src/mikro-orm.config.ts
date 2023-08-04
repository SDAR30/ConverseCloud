import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { Options } from "@mikro-orm/core";
import path from "path";
import { User } from "./entities/User";

const microConfig: Options = {
    migrations: {
        path: path.join(__dirname, './migrations'), // path to the folder with migrations
        glob: '/^[\w]+\d+\.[tj]s$/',
    },
    entities: [Post, User],
    dbName: 'forum1',
    // user: "postgres",
    // password: "postgres",
    type: 'postgresql',
    debug: !__prod__,
};

export default microConfig;
