import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType} from "type-graphql";

@ObjectType()
@Entity()
export class Post {
    @Field()
    @PrimaryKey()
    id!: number;

    @Field(()=> Date)
    @Property({type: "date"})
    createdAt = new Date();

    @Field(()=> Date)
    @Property({type: "date", onUpdate: () => new Date() })
    updatedAt = new Date();

    //keep @field commented out if you don't want to expose title
    @Field()
    @Property({type: 'text'})
    title!: string;
  
}