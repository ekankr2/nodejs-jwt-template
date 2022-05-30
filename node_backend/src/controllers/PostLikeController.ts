import {
  JsonController,
  Get,
  Param,
  Post,
  UseBefore,
  Res,
  Delete,
  HttpCode,
} from "routing-controllers";
import { PostLikeService } from "../services/serviceImpl/PostLikeService";
import { Post as PostEntity } from "../entities/Post";
import {checkCookieAccessToken} from "../middlewares/AuthMiddleware";
import { Response } from "express";
import { OpenAPI } from "routing-controllers-openapi";

@JsonController("/posts")
export class PostLikeController {
  constructor(private postLikeService: PostLikeService) {}

  @HttpCode(200)
  @Get("/:id/like")
  @OpenAPI({
    summary: "check Post Like status",
    description: `Check whether the user has liked or not liked the Post corresponding to the PostId.\n
        return { isPostLiked: true } is the Post where the user clicked Like.\n
        return { isPostLiked: false } is a Post for which the user did not click Like.`,
    statusCode: "200",
  })
  @UseBefore(checkCookieAccessToken)
  public async checkLike(@Param("id") id: string, @Res() res: Response) {
    const { userId } = res.locals.jwtPayload;
    const isPostLiked = await this.postLikeService.isPostLike(id, userId);

    return {
      isPostLiked,
    };
  }

  @HttpCode(200)
  @Post("/:id/like")
  @OpenAPI({
    summary: "Post like",
    description: "The user likes the Post corresponding to the PostId.",
    statusCode: "200",
  })
  @UseBefore(checkCookieAccessToken)
  public like(
    @Param("id") id: string,
    @Res() res: Response,
  ): Promise<PostEntity> {
    const { userId } = res.locals.jwtPayload;

    return this.postLikeService.likePost(id, userId);
  }

  @HttpCode(200)
  @Delete("/:id/like")
  @OpenAPI({
    summary: "cancel Post Like",
    description: "The user unlikes the Post corresponding to the PostId.",
    statusCode: "200",
  })
  @UseBefore(checkCookieAccessToken)
  public unlike(
    @Param("id") id: string,
    @Res() res: Response,
  ): Promise<PostEntity> {
    const { userId } = res.locals.jwtPayload;

    return this.postLikeService.unlikePost(id, userId);
  }
}
