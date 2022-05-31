import {Service} from "typedi";
import {InjectRepository} from "typeorm-typedi-extensions";
import {Post} from "../entities/Post";
import {PostRepository} from "../repositories/PostRepository";
import {CreateBulkPostDto, CreatePostDto, UpdatePostDto} from "../dtos/PostDto";
import {InsertResult} from "typeorm";

@Service()
export class PostService {
  constructor(@InjectRepository() private postRepository: PostRepository) {}

  /**
   * create post.
   * @param createPostDto post create DTO
   * @param userId user Id
   */
  public async createPost(
    createPostDto: CreatePostDto,
    userId: string,
  ): Promise<Post> {
    const post = createPostDto.toEntity();
    post.userId = userId;
    post.previewContent = post.content.substring(0, 100);

    return await this.postRepository.save(post);
  }

  /**
   * create bulk post.
   * @param createBulkPostDto bulk post DTO
   * @param userId user Id
   */
  public async createBulkPost(
      createBulkPostDto: CreateBulkPostDto,
      userId: string
  ): Promise<InsertResult> {

    const modifyData = createBulkPostDto.posts.map((data)=>{
      return {userId: userId, ...data}
    })
    return await this.postRepository.bulkPost(modifyData);
  }

  /**
   * get post list.
   * @param offset offset
   * @param limit limit
   * @param sort best: weekly best post, not : general post.
   */
  public async getPosts(
    offset: number,
    limit: number,
    sort?: string,
  ): Promise<Post[]> {
    switch (sort) {
      case "best":
        const dateBeforeWeek = PostService.getDateBeforeWeek();

        return await this.postRepository.getBestPosts(
          offset,
          limit,
          dateBeforeWeek,
        );
      default:
        return await this.postRepository.getPosts(offset, limit);
    }
  }

  /**
   * get post info.
   * @param postId post Id
   */
  public async getPostById(postId: string): Promise<Post> {
    return await this.postRepository.getPostById(postId);
  }

  /**
   * increse post view
   * @param post post
   */
  public async incrementPostView(post: Post): Promise<void> {
    post.view = post.view + 1;
    await this.postRepository.save(post);
  }

  /**
   * modify post.
   * @param postId post Id
   * @param updatePostDto post modify DTO
   * @param userId user Id
   */
  public async updatePost(
    postId: string,
    updatePostDto: UpdatePostDto,
    userId: string,
  ): Promise<Post> {
    const postToUpdate = await this.postRepository.getPostById(postId);

    if (postToUpdate.user.id === userId) {
      postToUpdate.title = updatePostDto.title;
      postToUpdate.content = updatePostDto.content;
      postToUpdate.previewContent = updatePostDto.content.substring(0, 100);
      return await this.postRepository.save(postToUpdate);
    } else {
      return null;
    }
  }

  /**
   * delete post.
   * @param postId post Id
   * @param userId user Id
   */
  public async deletePost(postId: string, userId: string): Promise<boolean> {
    const postToDelete = await this.postRepository.getPostById(postId);

    if (postToDelete.user.id === userId) {
      await this.postRepository.delete({ id: postId });
      return true;
    }

    return false;
  }

  /**
   * check if post exists
   * @param postId post Id
   * @returns true : existing, not : not existing
   */
  public async isPostById(postId: string): Promise<boolean> {
    const post = await this.postRepository.findOne({
      where: {
        id: postId,
      },
    });

    return !!post;
  }

  /**
   * get date of a week before now.
   */
  private static getDateBeforeWeek(): Date {
    const date = new Date();
    date.setDate(date.getDate() - 7);

    return date;
  }
}
