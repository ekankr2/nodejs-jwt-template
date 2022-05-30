import {Service} from "typedi";
import {InjectRepository} from "typeorm-typedi-extensions";
import {User} from "../../entities/User";
import {UserRepository} from "../../repositories/UserRepository";
import {PostRepository} from "../../repositories/PostRepository";
import {PostCommentRepository} from "../../repositories/PostCommentRepository";
import {CreateUserDto, UpdateUserDto} from "../../dtos/UserDto";

@Service()
export class UserService {
    constructor(
        @InjectRepository() private userRepository: UserRepository,
        @InjectRepository() private postRepository: PostRepository,
        @InjectRepository() private postCommentRepository: PostCommentRepository,
    ) {
    }

    /**
     * create user
     * @param createUserDto create user DTO
     */
    public async createUser(createUserDto: CreateUserDto): Promise<User> {
        const user = createUserDto.toEntity();
        return await this.userRepository.save(user);
    }

    /**
     * get user info
     * @param id user Id
     */
    public async getUserById(id: string): Promise<User> {
        return await this.userRepository.findOne({
            select: ["id", "email", "realName", "createdAt"],
            where: {id: id},
        });
    }

    /**
     * get posts of user
     * @param userId user Id
     */
    public async getPostsByUserId(userId: string) {
        return await this.postRepository.getPostsByUserId(userId);
    }

    /**
     * get comments of user that are not deleted
     * @param userId user Id
     */
    public async getCommentsByUserId(userId: string) {
        return await this.postCommentRepository.getCommentsByUserId(userId);
    }

    /**
     * edit user info.
     * @param userId requested user Id
     * @param targetUserId target user Id
     * @param updateUserDto update user DTO
     */
    public async updateUser(
        userId: string,
        targetUserId: string,
        updateUserDto: UpdateUserDto,
    ): Promise<User> {
        // check requesting userId and target user Id
        // prevent frontend modify attack
        if (userId !== targetUserId) {
            return null;
        }

        const userToUpdate = await this.userRepository.findOne({
            where: {id: userId},
        });

        if (userToUpdate?.id === userId) {
            userToUpdate.realName = updateUserDto.realName;
            return await this.userRepository.save(userToUpdate);
        }

        return null;
    }

    /**
     * check if there is a user with matching email
     * @param email email
     */
    public async isDuplicateUser(email: string): Promise<boolean> {
        const user = await this.userRepository.findOne({
            where: {email: email},
        });

        return !!user;
    }
}