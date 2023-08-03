import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post.js";
import microConfig from './mikro-orm.config'

const main = async () => {

    const orm = await MikroORM.init(microConfig);
    await orm.getMigrator().up();
    console.log('--------sql-----1-----')
   
    const em = orm.em.fork();

    console.log('--------sql----2------')
    const posts = await em.find(Post, {});
    console.log(posts)

}

main().catch((err) => {
    console.log("ERROR: ", err)
});

console.log('ending console log -----')