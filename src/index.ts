import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post.js";
import microConfig from './mikro-orm.config';
import express from 'express';
import {ApolloServer} from 'apollo-server-express';
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import 'reflect-metadata';

const main = async () => {
    
    const orm = await MikroORM.init(microConfig);
    await orm.getMigrator().up();

    const em = orm.em.fork();
    
    // create a post
    // const post = em.create(Post, {title: "seecond post"} as Post)
    // await em.persistAndFlush(post)
    
    // extract all posts
    const posts = await em.find(Post, {});
    console.log(posts)

    const app = express();

    app.use((req, _, next) => {
        req.em = em.fork();
        next();
      });

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({req}) => ({em: req.em})
    })

    // You must await server.start() before calling server.applyMiddleware()
    await apolloServer.start();

    // create graphql endpoint on express
    apolloServer.applyMiddleware({app})


    app.get('/', (_, res)=>{
        res.send('home page')

    })

    app.listen(4000, ()=>{
        console.log('server started on 4000')
    })

}

main().catch((err) => {
    console.log("ERROR: ", err)
});

console.log('ending console log -----')