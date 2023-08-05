"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@mikro-orm/core");
const constants_1 = require("./constants");
const Post_js_1 = require("./entities/Post.js");
const mikro_orm_config_1 = __importDefault(require("./mikro-orm.config"));
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const hello_1 = require("./resolvers/hello");
const post_1 = require("./resolvers/post");
const user_1 = require("./resolvers/user");
require("reflect-metadata");
const connect_redis_1 = __importDefault(require("connect-redis"));
const express_session_1 = __importDefault(require("express-session"));
const redis_1 = require("redis");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const orm = yield core_1.MikroORM.init(mikro_orm_config_1.default);
    yield orm.getMigrator().up();
    const em = orm.em.fork();
    const generator = orm.getSchemaGenerator();
    yield generator.updateSchema();
    console.log(' ----------333---------');
    const posts = yield em.find(Post_js_1.Post, {});
    console.log(posts);
    const app = (0, express_1.default)();
    const redisClient = (0, redis_1.createClient)({ legacyMode: true });
    redisClient.on("connect", () => console.log('Connnected to Reddis locally!'));
    redisClient.on("error", (err) => console.log("redits Client Error", err));
    redisClient.connect();
    app.use((0, express_session_1.default)({
        name: 'qid',
        store: new connect_redis_1.default({
            client: redisClient,
            disableTouch: true,
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
            httpOnly: true,
            sameSite: 'lax',
            secure: constants_1.__prod__
        },
        resave: false,
        saveUninitialized: false,
        secret: "ompasfk",
    }));
    app.use((req, _, next) => {
        req.em = em.fork();
        next();
    });
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: yield (0, type_graphql_1.buildSchema)({
            resolvers: [hello_1.HelloResolver, post_1.PostResolver, user_1.UserResolver],
            validate: false
        }),
        context: ({ req, res }) => ({ em: req.em, req, res })
    });
    yield apolloServer.start();
    apolloServer.applyMiddleware({ app });
    app.get('/', (_, res) => {
        res.send('home page');
    });
    app.listen(4000, () => {
        console.log('server started on 4000');
    });
});
main().catch((err) => {
    console.log("ERROR: ", err);
});
console.log('ending console log -----');
console.log("dirname:", __dirname);
//# sourceMappingURL=index.js.map