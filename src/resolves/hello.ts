import { Query, Resolver } from "type-graphql";

@Resolver()
export class HelloResolver {
    @Query(()=> String)
    hello() {
        return "return value of hello() sent back to client as response for 'hello' query"
    }
}