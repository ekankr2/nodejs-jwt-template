import {LoginUserDto} from "../dtos/UserDto";
import {User} from "../entities/User";

export interface AuthService {

    /**
     * validate user info. If valid return user info
     * @param loginUserDto user login DTO
     */
    validateUser(loginUserDto: LoginUserDto): Promise<User>

    /**
     * get RefreshToken matching user info.
     * @param userId user Id
     * @param refreshToken RefreshToken
     */
    validateUserToken(userId: string, refreshToken: string): Promise<User>

    /**
     * save RefreshToken to user.
     * @param user User
     * @param token RefreshToken
     */
    saveRefreshToken(user: User, token: string): Promise<void>
}