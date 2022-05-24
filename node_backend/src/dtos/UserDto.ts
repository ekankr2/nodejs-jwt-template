import { IsNotEmpty, Length, IsEmail } from "class-validator";
import { User } from "../entities/User";

/**
 * user generate DTO
 */
export class CreateUserDto {
  @IsNotEmpty()
  @Length(1, 50)
  public realName: string;

  @IsNotEmpty()
  @Length(1, 100)
  @IsEmail()
  public email: string;

  @IsNotEmpty()
  public password: string;

  public toEntity(): User {
    const { realName, email, password } = this;

    const user = new User();
    user.realName = realName;
    user.email = email;
    user.password = password;

    return user;
  }
}

/**
 * user signIn DTO
 */
export class LoginUserDto {
  @IsNotEmpty()
  @Length(1, 100)
  @IsEmail()
  public email: string;

  @IsNotEmpty()
  public password: string;

  public toEntity(): User {
    const { email } = this;

    const user = new User();
    user.email = email;

    return user;
  }
}

/**
 * user Response DTO
 */
export class ResponseUserDto {
  public id: string;
  public email: string;
  public realName: string;
}

/**
 * user info edit DTO
 */
export class UpdateUserDto {
  @IsNotEmpty()
  public realName: string;
}


/**
 * token reissue DTO
 */
export class RefreshTokenDto {
  @IsNotEmpty()
  public refresh_token: string;

  @IsNotEmpty()
  public grant_type: string
}