import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import microConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import 'reflect-metadata';

import RedisStore from "connect-redis"
import session from "express-session";
import { createClient } from "redis";
import cors from 'cors';
import { MyContext } from "./types";



const main = async () => {

    const orm = await MikroORM.init(microConfig);
    await orm.getMigrator().up();

    //const em = orm.em.fork();

    //as explained here: https://stackoverflow.com/questions/66959888/i-want-to-insert-with-mikro-orm-but-it-dont-find-my-table-c-tablenotfoundexce/67951293#67951293
    // const generator = orm.getSchemaGenerator();
    // await generator.updateSchema();

    console.log(' ----------333---------')

    // const post = orm.em.create(Post, { title: "my first post" } as Post);
    // await orm.em.persistAndFlush(post);

    // extract all posts
    // const posts = await em.find(Post, {});
    // console.log(posts)

    const app = express();

    app.set('trust proxy', 1);

    const redisClient = createClient({ legacyMode: true });
    // redisClient.on("connect", () => console.log('Connnected to Reddis locally!'))
    // redisClient.on("error", (err: Error) => console.log("redits Client Error", err))
    // redisClient.connect();
    redisClient.connect().catch(console.error)

    app.use(
        cors({
          origin: 'https://studio.apollographql.com',
          credentials: true,
        }),
      );
      

    // Initialize sesssion storage.
    app.use(
        session({
            name: 'qid',
            store: new RedisStore({
                client: redisClient,
                disableTouch: true,

            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10 years
                httpOnly: true, // can't access in frontend js code
                sameSite: 'lax',
                secure: __prod__ // cookie only works in https
            },
            resave: false, // required: force lightweight session keep alive (touch)
            saveUninitialized: false, // recommended: only save session when data exists
            secret: "keyboard cat", // keep this in .env
        })
    )

    // app.use((req, res, next) => {
    //     req.em = em.fork();
    //     next();
    // });

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({ req, res } : MyContext): MyContext => ({ em: orm.em, req, res })
    })

    // You must await server.start() before calling server.applyMiddleware()
    await apolloServer.start();

    // create graphql endpoint on express
    apolloServer.applyMiddleware({ app })


    // app.get('/', (_, res) => {
    //     res.send('home page')

    // })

    app.listen(4000, () => {
        console.log('server started on 4000')
    })

}

main().catch((err) => {
    console.log("ERROR: ", err)
});

// console.log('ending console log -----')
// console.log("dirname:", __dirname)