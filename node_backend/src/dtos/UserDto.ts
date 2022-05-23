import { IsNotEmpty, Length, IsEmail } from "class-validator";
import { User } from "../entities/User";

/**
 * 사용자 생성 DTO
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
 * 사용자 로그인 DTO
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
 * 사용자 Response DTO
 */
export class ResponseUserDto {
  public id: string;
  public email: string;
  public realName: string;
}

/**
 * 사용자 정보 수정 DTO
 */
export class UpdateUserDto {
  @IsNotEmpty()
  public realName: string;
}


/**
 * 토큰 재발급 DTO
 */
export class RefreshTokenDto {
  @IsNotEmpty()
  public refresh_token: string;

  @IsNotEmpty()
  public grant_type: string
}