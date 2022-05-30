import {Service} from "typedi";
import {InjectRepository} from "typeorm-typedi-extensions";
import {Post} from "../../entities/Post";
import {PostLike} from "../../entities/PostLike";
import {PostRepository} from "../../repositories/PostRepository";
import {PostLikeRepository} from "../../repositories/PostLikeRepository";

@Service()
export class PostLikeService {
  constructor(
    @InjectRepository() private postRepository: PostRepository,
    @InjectRepository() private postLikeRepository: PostLikeRepository,
  ) {}

  /**
   * check if the user liked the post
   * @param postId post Id
   * @param userId user Id
   * @returns true : liked, false : no
   */
  public async isPostLike(postId: string, userId: string): Promise<boolean> {
    const postLike = await this.postLikeRepository.findOne({
      where: {
        postId: postId,
        userId: userId,
      },
    });

    return !!postLike;
  }

  /**
   * like post
   * @param postId post Id
   * @param userId user Id
   */
  public async likePost(postId: string, userId: string): Promise<Post> {
    const post = await this.postRepository.findOne(postId);

    const alreadyPostLiked = await this.postLikeRepository.findOne({
      where: {
        postId: postId,
        userId: userId,
      },
    });

    if (alreadyPostLiked) {
      return post;
    }

    const postLike = new PostLike();
    postLike.postId = postId;
    postLike.userId = userId;
    await this.postLikeRepository.save(postLike);

    post.like = await this.postLikeRepository.count({
      where: {
        postId: postId,
      },
    });
    await this.postRepository.save(post);

    return post;
  }

  /**
   * cancel post like
   * @param postId post Id
   * @param userId user Id
   */
  public async unlikePost(postId: string, userId: string): Promise<Post> {
    const post = await this.postRepository.findOne(postId);

    const postLike = await this.postLikeRepository.findOne({
      where: {
        postId: postId,
        userId: userId,
      },
    });

    if (!postLike) {
      return post;
    }

    await this.postLikeRepository.remove(postLike);

    post.like = await this.postLikeRepository.count({
      where: {
        postId: postId,
      },
    });
    await this.postRepository.save(post);

    return post;
  }
}
