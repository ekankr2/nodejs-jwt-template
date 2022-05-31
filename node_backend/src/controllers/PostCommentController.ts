import {PostService} from "../services/PostService";
import {PostCommentService} from "../services/PostCommentService";
import {
    JsonController,
    Get,
    Param,
    Body,
    Post,
    Put,
    UseBefore,
    Res,
    Delete,
    HttpCode,
} from "routing-controllers";
import {checkCookieAccessToken} from "../middlewares/AuthMiddleware";
import {Response} from "express";
import {OpenAPI} from "routing-controllers-openapi";
import {
    CreatePostCommentDto,
    UpdatePostCommentDto,
    CreateCommentReplyDto,
} from "../dtos/PostCommentDto";

@JsonController("/posts")
export class PostCommentController {
    constructor(
        private postService: PostService,
        private postCommentService: PostCommentService,
    ) {
    }

    @HttpCode(201)
    @Post("/:postId/comments")
    @OpenAPI({
        summary: "create post comment",
        statusCode: "201",
        responses: {
            "400": {
                description: "Bad request",
            },
        },
    })
    @UseBefore(checkCookieAccessToken)
    public async create(
        @Param("postId") postId: string,
        @Body() createPostCommentDto: CreatePostCommentDto,
        @Res() res: Response,
    ) {
        const {userId} = res.locals.jwtPayload;

        const isPost = await this.postService.isPostById(postId);

        if (!isPost) {
            return res.status(400).send({message: "No matching post."});
        }

        return await this.postCommentService.createPostComment(
            postId,
            createPostCommentDto,
            userId,
        );
    }

    @HttpCode(200)
    @Get("/:postId/comments")
    @OpenAPI({
        summary: "get post comments",
        responses: {
            "400": {
                description: "Bad request",
            },
        },
        statusCode: "200",
    })
    public async getAll(@Param("postId") postId: string, @Res() res: Response) {
        const isPost = await this.postService.isPostById(postId);

        if (!isPost) {
            return res.status(400).send({message: "No matching post."});
        }

        return this.postCommentService.getCommentByPostId(postId);
    }

    @HttpCode(200)
    @Put("/:postId/comments/:id")
    @OpenAPI({
        summary: "update post comment",
        statusCode: "200",
        responses: {
            "403": {
                description: "Forbidden",
            },
        },
    })
    @UseBefore(checkCookieAccessToken)
    public async update(
        @Param("postId") postId: string,
        @Param("id") commentId: string,
        @Body() updatePostCommentDto: UpdatePostCommentDto,
        @Res() res: Response,
    ) {
        const {userId} = res.locals.jwtPayload;
        const updatedPostComment = await this.postCommentService.updatePostComment(
            postId,
            commentId,
            updatePostCommentDto,
            userId,
        );

        if (!updatedPostComment) {
            return res
                .status(403)
                .send({message: "You have no permission to edit comment."});
        }

        return updatedPostComment;
    }

    @HttpCode(200)
    @Delete("/:postId/comments/:id")
    @OpenAPI({
        summary: "delete post comment",
        statusCode: "200",
        responses: {
            "403": {
                description: "Forbidden",
            },
        },
    })
    @UseBefore(checkCookieAccessToken)
    public async delete(
        @Param("postId") postId: string,
        @Param("id") commentId: string,
        @Res() res: Response,
    ) {
        const {userId} = res.locals.jwtPayload;

        const result = await this.postCommentService.deletePostComment(
            postId,
            commentId,
            userId,
        );

        if (!result) {
            return res
                .status(403)
                .send({message: "You have no permission to delete comment."});
        }

        return {
            postId: postId,
            postCommentId: commentId,
            isDelete: result,
        };
    }

    @HttpCode(201)
    @Post("/:postId/comments/:id/replies")
    @OpenAPI({
        summary: "create post reply",
        statusCode: "201",
        responses: {
            "400": {
                description: "Bad request",
            },
        },
    })
    @UseBefore(checkCookieAccessToken)
    public async createReply(
        @Param("postId") postId: string,
        @Param("id") commentId: string,
        @Body() createCommentReplyDto: CreateCommentReplyDto,
        @Res() res: Response,
    ) {
        const {userId} = res.locals.jwtPayload;

        const commentReply = await this.postCommentService.createCommentReply(
            postId,
            createCommentReplyDto,
            userId,
            commentId,
        );

        if (commentReply) {
            return commentReply;
        }

        return res.status(400).send({message: "Bad request."});
    }

    @HttpCode(200)
    @Get("/:postId/comments/:id/replies")
    @OpenAPI({
        summary: "get replies of post comment",
        responses: {
            "400": {
                description: "Bad request",
            },
        },
        statusCode: "200",
    })
    public async getReply(
        @Param("postId") postId: string,
        @Param("id") commentId: string,
        @Res() res: Response,
    ) {
        const comments = await this.postCommentService.getCommentReplies(
            postId,
            commentId,
        );

        if (!comments) {
            return res.status(400).send({message: "Bad request."});
        }

        return comments;
    }
}
