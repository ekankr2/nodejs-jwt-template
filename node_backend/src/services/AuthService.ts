import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { User } from "../entities/User";
import { UserRepository } from "../repositories/UserRepository";
import {LoginUserDto} from "../dtos/UserDto";

@Service()
export class AuthService{
  constructor(@InjectRepository() private userRepository: UserRepository) {}

  public async validateUser(loginUserDto:LoginUserDto): Promise<User> {
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

  public async saveRefreshToken(user: User, token: string): Promise<void> {
    user.refreshToken = token;
    await this.userRepository.save(user);
  }
}
