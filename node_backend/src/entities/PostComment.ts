import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { IsNotEmpty } from "class-validator";
import { User } from "./User";
import { Post } from "./Post";

@Entity({ name: "post_comment" })
export class PostComment {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ name: "post_id" })
  postId: string;

  @Column({ name: "user_id" })
  userId: string;

  @ManyToOne((type) => Post, (post) => post.id, {
    cascade: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "post_id" })
  post: Post;

  @ManyToOne((type) => User, (user) => user.id, {
    cascade: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ nullable: true, comment: "parent comment uuid" })
  parent: string;

  @Column({ default: 0, comment: "0: comment, 1: reply" })
  depth: number;

  @IsNotEmpty()
  @Column({ type: "text" })
  text: string;

  @Column({
    name: "is_replies",
    default: false,
    comment: "true: replies, false: no replies",
  })
  isReplies: boolean;

  @Column({ name: "is_deleted", default: false })
  isDeleted: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
