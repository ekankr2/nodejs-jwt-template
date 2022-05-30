import {
    JsonController,
    Get,
    Res,
    HttpCode,
    Param,
    Put,
    Body,
    UseBefore,
} from "routing-controllers";
import {Response} from "express";
import {UserService} from "../services/serviceImpl/UserService";
import {OpenAPI} from "routing-controllers-openapi";
import {UpdateUserDto} from "../dtos/UserDto";
import {checkCookieAccessToken} from "../middlewares/AuthMiddleware";

@JsonController("/users")
export class UserController {
    constructor(private userService: UserService) {
    }

    @HttpCode(200)
    @Get("/:id")
    @OpenAPI({
        summary: "user info",
        description: "return user info with UserId",
        statusCode: "200",
        responses: {
            "400": {
                description: "Bad request",
            },
        },
    })
    public async getOne(@Param("id") id: string, @Res() res: Response) {
        const user = await this.userService.getUserById(id);

        if (!user) {
            return res.status(400).send({message: "No matching user."});
        }

        return user;
    }

    @HttpCode(200)
    @Get("/:id/posts")
    @OpenAPI({
        summary: "get Posts of user",
        description: "get posts written by user with UserId",
        statusCode: "200",
        responses: {
            "204": {
                description: "No Content",
            },
        },
    })
    public async getAllPosts(@Param("id") id: string, @Res() res: Response) {
        const posts = await this.userService.getPostsByUserId(id);

        if (posts.length === 0) {
            return res.status(204).send(posts);
        }

        return posts;
    }

    @HttpCode(200)
    @Get("/:id/comments")
    @OpenAPI({
        summary: "user comment list",
        description: "return comment list of user with userId",
        statusCode: "200",
        responses: {
            "204": {
                description: "No Content",
            },
        },
    })
    public async getAllComments(@Param("id") id: string, @Res() res: Response) {
        const comments = await this.userService.getCommentsByUserId(id);

        if (comments.length === 0) {
            return res.status(204).send(comments);
        }

        return comments;
    }

    @HttpCode(200)
    @Put("/:id")
    @OpenAPI({
        summary: "update user info",
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
        @Body() updateUserDto: UpdateUserDto,
        @Res() res: Response,
    ) {
        const {userId} = res.locals.jwtPayload;
        const updatedUser = await this.userService.updateUser(
            userId,
            id,
            updateUserDto,
        );

        if (!updatedUser) {
            return res.status(403).send({message: "You have no permission"});
        }

        return updatedUser;
    }
}