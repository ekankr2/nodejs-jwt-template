import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { User } from "../../entities/User";
import { UserRepository } from "../../repositories/UserRepository";
import {LoginUserDto} from "../../dtos/UserDto";
import {AuthService} from "../AuthService";

@Service()
export class AuthServiceImpl implements AuthService{
  constructor(@InjectRepository() private userRepository: UserRepository) {}

  /**
   * validate user info. If valid return user info
   * @param loginUserDto user login DTO
   */
  public async validateUser(loginUserDto: LoginUserDto): Promise<User> {
    const user = await this.userRepository.findOne({
      select: ["id", "email"],
      where: {
        email: loginUserDto.email,
      },
    });

    if(user) {
      return user
    }

    return undefined;
  }

  /**
   * get RefreshToken matching user info.
   * @param userId user Id
   * @param refreshToken RefreshToken
   */
  public async validateUserToken(
    userId: string,
    refreshToken: string,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      select: ["id", "email"],
      where: {
        id: userId,
        refreshToken: refreshToken,
      },
    });

    if (user) {
      return user;
    }

    return undefined;
  }

  /**
   * save RefreshToken to user.
   * @param user User
   * @param token RefreshToken
   */
  public async saveRefreshToken(user: User, token: string): Promise<void> {
    user.refreshToken = token;
    await this.userRepository.save(user);
  }
}
