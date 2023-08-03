import { Resolver } from "type-graphql";

@Resolver()
export class HelloResolver {
    @Query()
    hello(){
        return "hello world"
    }
}