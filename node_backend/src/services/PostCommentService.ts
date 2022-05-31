import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { PostComment } from "../entities/PostComment";
import { PostCommentRepository } from "../repositories/PostCommentRepository";
import {
  CreatePostCommentDto,
  UpdatePostCommentDto,
  CreateCommentReplyDto,
} from "../dtos/PostCommentDto";

@Service()
export class PostCommentService {
  constructor(
    @InjectRepository()
    private postCommentRepository: PostCommentRepository,
  ) {}

  /**
   * create post comment
   * @param postId post Id
   * @param createPostCommentDto create post comment  DTO
   * @param userId user Id
   */
  public async createPostComment(
    postId: string,
    createPostCommentDto: CreatePostCommentDto,
    userId: string,
  ): Promise<PostComment> {
    const postComment = createPostCommentDto.toEntity(postId, userId);

    return await this.postCommentRepository.save(postComment);
  }

  /**
   * Create a reply to a comment.
   * @param postId post Id
   * @param createCommentReplyDto create comment reply DTO
   * @param userId user Id
   * @param commentId comment Id
   */
  public async createCommentReply(
    postId: string,
    createCommentReplyDto: CreateCommentReplyDto,
    userId: string,
    commentId: string,
  ): Promise<PostComment> {
    const postCommentToUpdate = await this.postCommentRepository.getCommentById(
      postId,
      commentId,
    );

    if (postCommentToUpdate) {
      postCommentToUpdate.isReplies = true;
      await this.postCommentRepository.save(postCommentToUpdate);
    } else {
      return null;
    }

    const commentReply = createCommentReplyDto.toEntity(
      postId,
      userId,
      commentId,
    );

    return await this.postCommentRepository.save(commentReply);
  }

  /**
   * get the total number of comments and comments (excluding replies) of a post.
   * @param postId post Id
   */
  public async getCommentByPostId(postId: string) {
    const count = await this.postCommentRepository.count({
      where: {
        postId: postId,
        isDeleted: false,
      },
    });

    const comments = await this.postCommentRepository.getCommentsByPostId(
      postId,
    );

    return {
      count,
      comments,
    };
  }

  /**
   * Search for replies to comment.
   * @param postId post Id
   * @param commentId comment Id
   */
  public async getCommentReplies(
    postId: string,
    commentId: string,
  ): Promise<PostComment[]> {
    const postComment = await this.postCommentRepository.getCommentById(
      postId,
      commentId,
    );

    if (!postComment) {
      return null;
    }

    return await this.postCommentRepository.getCommentReplies(
      postId,
      commentId,
    );
  }

  /**
   * update comment
   * @param postId post Id
   * @param commentId comment Id
   * @param updatePostCommentDto update post comment DTO
   * @param userId user Id
   */
  public async updatePostComment(
    postId: string,
    commentId: string,
    updatePostCommentDto: UpdatePostCommentDto,
    userId: string,
  ): Promise<PostComment> {
    const postCommentToUpdate = await this.postCommentRepository.getCommentById(
      postId,
      commentId,
    );

    if (postCommentToUpdate?.userId === userId) {
      postCommentToUpdate.text = updatePostCommentDto.text;
      return await this.postCommentRepository.save(postCommentToUpdate);
    }

    return null;
  }

  /**
   * delete comment
   * @param postId post Id
   * @param commentId comment Id
   * @param userId user Id
   */
  public async deletePostComment(
    postId: string,
    commentId: string,
    userId: string,
  ): Promise<boolean> {
    const postCommentToDelete = await this.postCommentRepository.getCommentById(
      postId,
      commentId,
    );

    if (postCommentToDelete?.userId === userId) {
      postCommentToDelete.text = "comment deleted by writer";
      postCommentToDelete.isDeleted = true;
      await this.postCommentRepository.save(postCommentToDelete);
      return true;
    }

    return false;
  }
}
