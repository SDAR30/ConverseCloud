import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post.js";
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
import { createClient } from "redis"

const main = async () => {

    const orm = await MikroORM.init(microConfig);
    await orm.getMigrator().up();

    console.log(' ----------111---------')

    const em = orm.em.fork();

    //as explained here: https://stackoverflow.com/questions/66959888/i-want-to-insert-with-mikro-orm-but-it-dont-find-my-table-c-tablenotfoundexce/67951293#67951293
    const generator = orm.getSchemaGenerator();
    await generator.updateSchema();

    console.log(' ----------333---------')

    // const post = orm.em.create(Post, { title: "my first post" } as Post);
    // await orm.em.persistAndFlush(post);

    // extract all posts
    const posts = await em.find(Post, {});
    console.log(posts)

    const app = express();

    // Initialize client.
    const redisClient = createClient()
    redisClient.connect().catch(console.error)

    // Initialize store.
    const redisStore = new RedisStore({
        client: redisClient,
        prefix: "myapp:",
    })

    // Initialize sesssion storage.
    app.use(
        session({
            store: redisStore,
            resave: false, // required: force lightweight session keep alive (touch)
            saveUninitialized: false, // recommended: only save session when data exists
            secret: "keyboard cat",
        })
    )

    app.use((req, _, next) => {
        req.em = em.fork();
        next();
    });

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({ req }) => ({ em: req.em })
    })

    // You must await server.start() before calling server.applyMiddleware()
    await apolloServer.start();

    // create graphql endpoint on express
    apolloServer.applyMiddleware({ app })


    app.get('/', (_, res) => {
        res.send('home page')

    })

    app.listen(4000, () => {
        console.log('server started on 4000')
    })

}

main().catch((err) => {
    console.log("ERROR: ", err)
});

console.log('ending console log -----')
console.log("dirname:", __dirname)