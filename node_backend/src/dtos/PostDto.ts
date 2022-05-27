import {
  IsNotEmpty,
  IsPositive,
  IsNumber,
  Max,
  IsString,
  IsOptional, ValidateNested, Length, IsArray, IsEmail,
} from "class-validator";
import { Post } from "../entities/Post";
import {Type} from "class-transformer";
import {JSONSchema} from "class-validator-jsonschema";

/**
 * create post DTO
 */
export class CreatePostDto {
  @IsNotEmpty()
  public title: string;

  @IsNotEmpty()
  public content: string;

  public toEntity(): Post {
    const { title, content } = this;

    const post = new Post();
    post.title = title;
    post.content = content;

    return post;
  }
}

/**
 * bulk create post DTO
 */
export class CreateBulkPostDto {
  @IsNotEmpty()
  @Length(1, 100)
  @IsEmail()
  public email: string;

  @IsArray()
  @JSONSchema({
    type: 'array',
    items: {
      $ref: '#/components/schemas/CreatePostDto'
    }
  })
  @ValidateNested({ each: true })
  @Type(() => CreatePostDto)
  posts: CreatePostDto[]
}

/**
 * post modify DTO
 */
export class UpdatePostDto {
  @IsNotEmpty()
  public title: string;

  @IsNotEmpty()
  public content: string;
}

/**
 * post pagination DTO
 */
export class PageablePostDto {
  @IsNumber()
  public offset: number;

  @IsNumber()
  @Max(20)
  @IsPositive()
  public limit: number;

  @IsOptional()
  @IsString()
  public sort: string;
}
