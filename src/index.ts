import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post.js";
import microConfig from './mikro-orm.config';
import express from 'express';
import {ApolloServer} from 'apollo-server-express';
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolves/hello";
import { PostResolver } from "./resolves/post";
import 'reflect-metadata';

const main = async () => {
    
    
    const orm = await MikroORM.init(microConfig);
    await orm.getMigrator().up();
    console.log('--------sql-----1-----')
    const em = orm.em.fork();
    
    // create a post
    // const post = em.create(Post, {title: "seecond post"} as Post)
    // await em.persistAndFlush(post)
    

    console.log('--------sql----2------')
    
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
            resolvers: [HelloResolver, PostResolver],
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