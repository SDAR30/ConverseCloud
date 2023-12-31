import { User } from '../entities/User';
import { MyContext } from "src/types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Resolver } from "type-graphql";
import argon2 from 'argon2';


@InputType()
class UsernamePassowrdInput {
    @Field()
    username: string
    @Field()
    password: string

}

@ObjectType()
class FieldError {
    @Field()
    field: string;
    @Field()
    message: string;

}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]

    @Field(() => User, { nullable: true })
    user?: User
}

@Resolver()
export class UserResolver {
    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePassowrdInput,
        @Ctx() { em }: MyContext
    ): Promise<UserResponse>{

        if(options.username.length < 3){
            return {
                errors: [
                    {
                        field: "username",
                        message: "username is too short",
                    },
                ],
            }
        }

        if(options.password.length < 3){
            return {
                errors: [
                    {
                        field: "password",
                        message: "password is too short",
                    },
                ],
            }
        }

        const hashedPassword = await argon2.hash(options.password);
        const user = em.create(User, { username: options.username, password: hashedPassword } as User)
        try{
            await em.persistAndFlush(user)

        }catch(err){
            if(err.code === '23505' || err.detail.includes('already exists')){
                return {
                    errors: [{
                        field: "username",
                        message: "username is already taken"
                    }]
                }
            }
             console.log('message', err.message)
        }
        return {user};
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('options') options: UsernamePassowrdInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        const user = await em.findOne(User, { username: options.username.toLowerCase() });
        if (!user) {
            return {
                errors: [
                    {
                        field: "username",
                        message: "that username doesn't exist"
                    },
                ],
            };
        }
        const valid = await argon2.verify(user.password, options.password);
        if(!valid){
            return {
                errors: [
                    {
                        field: "password",
                        message: "passsword is incorrectt"
                    },
                ],
            };
        }


        req.session.userId = user.id;

        return {user,};
    }

}