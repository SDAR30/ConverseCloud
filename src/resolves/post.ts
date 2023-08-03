import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { Post } from '../entities/Post';
import { MyContext } from "src/types";

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    posts(@Ctx() { em }: MyContext): Promise<Post[]> {
        return em.find(Post, {})
    }

    @Query(() => Post, { nullable: true })
    post(
        @Arg('id') id: number,
        @Ctx() { em }: MyContext
    ): Promise<Post | null> {
        return em.findOne(Post, { id });
    }

    @Mutation(() => Post)
    async createPost(
        @Arg('title') title: string,
        @Ctx() { em }: MyContext
    ): Promise<Post> {
        const post = em.create(Post, { title } as Post);
        await em.persistAndFlush(post)
        return post
    }

    @Mutation(() => Post, { nullable: true })
    async updatePost(
        @Arg('id') id: number,
        @Arg('title', () => String, { nullable: true }) title: string,
        @Ctx() { em }: MyContext
    ): Promise<Post | null> {
        const post = await em.findOne(Post, { id });
        if (!post) {
            return null;
        }
        if (typeof title !== undefined) {
            post.title = title;
            await em.persistAndFlush(post);
        }
        return post
    }

    @Mutation(() => Boolean)
    async deletePost(
        @Arg('id') id: number,
        @Ctx() { em }: MyContext
    ): Promise<Boolean> {
        // First, check if the Post exists
        const post = await em.findOne(Post, { id });
        if (!post) {
            return false; // Return false or any value you desire if the Post does not exist
        }

        // If the Post exists, then delete it
        try {
            await em.nativeDelete(Post, { id });
        } catch (err) {
            return false; // Return false if an error occurs during deletion
        }

        return true; // Return true if the deletion is successful
    }



}