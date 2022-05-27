import {PostService} from "../services/PostService";
import {
    Body,
    Delete,
    Get,
    HttpCode,
    JsonController,
    Param,
    Post,
    Put,
    QueryParams,
    Res,
    UseBefore,
} from "routing-controllers";
import {checkCookieAccessToken} from "../middlewares/AuthMiddleware";
import {Response} from "express";
import {OpenAPI, ResponseSchema} from "routing-controllers-openapi";
import {CreateBulkPostDto, CreatePostDto, PageablePostDto, UpdatePostDto} from "../dtos/PostDto";

@JsonController("/posts")
export class PostController {
    constructor(
        private postService: PostService,
    ) {
    }

    @HttpCode(201)
    @Post()
    @OpenAPI({
        summary: "create Post",
        statusCode: "201",
    })
    @UseBefore(checkCookieAccessToken)
    public async create(
        @Body() createPostDto: CreatePostDto,
        @Res() res: Response,
    ) {
        const {userId} = res.locals.jwtPayload;
        return await this.postService.createPost(createPostDto, userId);
    }

    @HttpCode(201)
    @Post()
    @OpenAPI({
        summary: "create bulk Post",
        description: "create many Posts in a row",
        statusCode: "201"
    })
    @UseBefore(checkCookieAccessToken)
    public async createBulk(
        @Body() createBulkPostDto: CreateBulkPostDto,
        @Res() res: Response
    ) {
        const {userId} = res.locals.jwtPayload;
        return await this.postService.createBulkPost(createBulkPostDto, userId)
    }

    @HttpCode(200)
    @Get("")
    @OpenAPI({
        summary: "get Post list",
        statusCode: "200",
        responses: {
            "204": {
                description: "No Content",
            },
        },
    })
    @ResponseSchema(PageablePostDto)
    public async getAll(
        @QueryParams() pageablePostDto: PageablePostDto,
        @Res() res: Response,
    ) {
        const posts = await this.postService.getPosts(
            pageablePostDto.offset,
            pageablePostDto.limit,
            pageablePostDto.sort,
        );

        if (posts.length === 0) {
            return res.status(204).send(posts);
        }

        return posts;
    }

    @HttpCode(200)
    @Get("/:id")
    @OpenAPI({
        summary: "get Post",
        statusCode: "200",
        responses: {
            "400": {
                description: "Bad request",
            },
        },
    })
    public async getOne(@Param("id") id: string, @Res() res: Response) {
        const post = await this.postService.getPostById(id);

        if(!post){
            return res.status(400).send({message: "no matching post."});
        }
        await this.postService.incrementPostView(post);

        return post;
    }

    @HttpCode(200)
    @Put("/:id")
    @OpenAPI({
        summary: "update Post",
        statusCode: "200",
        responses: {
            "403": {
                description: "Forbidden",
            },
        },
    })
    @UseBefore(checkCookieAccessToken)
    public async update(
        @Param("id") id: string,
        @Body() updatePostDto: UpdatePostDto,
        @Res() res: Response,
    ) {
        const {userId} = res.locals.jwtPayload;
        const updatedPost = await this.postService.updatePost(
            id,
            updatePostDto,
            userId,
        );

        if (!updatedPost) {
            return res
                .status(403)
                .send({message: "You have no permission to update post."});
        }

        return updatedPost;
    }

    @HttpCode(200)
    @Delete("/:id")
    @OpenAPI({
        summary: "delete Post",
        statusCode: "200",
        responses: {
            "403": {
                description: "Forbidden",
            },
        },
    })
    @UseBefore(checkCookieAccessToken)
    public async delete(@Param("id") id: string, @Res() res: Response) {
        const {userId} = res.locals.jwtPayload;

        const result = await this.postService.deletePost(id, userId);

        if (!result) {
            return res
                .status(403)
                .send({message: "You have no permission to delete post."});
        }

        return {
            postId: id,
            isDelete: result,
        };
    }


}
