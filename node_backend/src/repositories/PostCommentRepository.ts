import { EntityRepository, Repository } from "typeorm";
import { PostComment } from "../entities/PostComment";

@EntityRepository(PostComment)
export class PostCommentRepository extends Repository<PostComment> {
  /**
   * get post Id and comment Id matching comment
   * @param postId post Id
   * @param commentId comment Id
   */
  public async getCommentById(postId: string, commentId: string) {
    return this.createQueryBuilder("comment")
      .where("comment.id = :commentId", { commentId })
      .andWhere("comment.postId = :postId", { postId })
      .getOne();
  }

  /**
   * get postId matching comment without replies
   * @param postId post Id
   */
  public async getCommentsByPostId(postId: string) {
    return this.createQueryBuilder("comment")
      .select([
        "comment.id",
        "comment.text",
        "comment.createdAt",
        "comment.postId",
        "comment.isReplies",
        "comment.isDeleted",
      ])
      .leftJoinAndSelect("comment.user", "user")
      .where("comment.postId = :postId", { postId })
      .andWhere("comment.depth = :value", { value: 0 })
      .orderBy("comment.createdAt", "ASC")
      .getMany();
  }

  /**
   * get user comments and replies that are not deleted
   * @param userId user Id
   */
  public async getCommentsByUserId(userId: string) {
    return this.createQueryBuilder("comment")
      .select([
        "comment.id",
        "comment.text",
        "comment.createdAt",
        "comment.postId",
      ])
      .where("comment.userId = :userId", { userId })
      .andWhere("comment.isDeleted = :value", { value: false })
      .orderBy("comment.createdAt", "DESC")
      .getMany();
  }

  /**
   * get replies to comments whose post ID and comment ID match.
   * @param postId post Id
   * @param commentId comment Id
   */
  public async getCommentReplies(postId: string, commentId: string) {
    return this.createQueryBuilder("comment")
      .select([
        "comment.id",
        "comment.parent",
        "comment.depth",
        "comment.text",
        "comment.createdAt",
        "comment.postId",
        "comment.isDeleted",
      ])
      .leftJoinAndSelect("comment.user", "user")
      .where("comment.postId = :postId", { postId })
      .andWhere("comment.parent = :commentId", { commentId })
      .orderBy("comment.createdAt", "ASC")
      .getMany();
  }
}
