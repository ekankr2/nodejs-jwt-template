import {AuthService} from "../services/AuthService";
import {
    JsonController,
    Post,
    UseBefore,
    Get,
    Res,
    Body,
    HttpCode,
} from "routing-controllers";
import {
    checkCookieAccessToken, checkCookieRefreshToken,
    generateAccessToken,
    generateRefreshToken, removeRefreshTokenCookie, setAccessTokenCookie, setRefreshTokenCookie,
} from "../middlewares/AuthMiddleware";
import {Response} from "express";
import {UserService} from "../services/UserService";
import {OpenAPI} from "routing-controllers-openapi";
import {CreateUserDto, LoginUserDto, ResponseUserDto} from "../dtos/UserDto";

@JsonController("/auth")
export class AuthController {
    constructor(
        private authService: AuthService,
        private userService: UserService,
    ) {
    }

    @HttpCode(200)
    @Post("/login")
    @OpenAPI({
        summary: "user signIn",
        statusCode: "200",
        responses: {
            "401": {
                description: "Unauthorized",
            },
        },
    })
    public async login(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
        const user = await this.authService.validateUser(loginUserDto);

        if (!user) {
            return res.status(401).send({
                message: "Invalid email or password.",
            });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        await this.authService.saveRefreshToken(user, refreshToken);
        setAccessTokenCookie(res, accessToken)
        setRefreshTokenCookie(res, refreshToken)

        return {
            user
        };
    }

    @HttpCode(200)
    @Post("/register")
    @OpenAPI({
        summary: "user sign up",
        statusCode: "200",
    })
    public async register(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
        const isDuplicateUser = await this.userService.isDuplicateUser(
            createUserDto.email,
        );

        if (isDuplicateUser) {
            return {
                error: true,
                message: "This email has already been taken.",
            };
        }

        const newUser = await this.userService.createUser(createUserDto);

        const accessToken = generateAccessToken(newUser);
        const refreshToken = generateRefreshToken(newUser);
        await this.authService.saveRefreshToken(newUser, refreshToken);
        setAccessTokenCookie(res, accessToken)
        setRefreshTokenCookie(res, refreshToken)

        const user: ResponseUserDto = {
            id: newUser.id,
            realName: newUser.realName,
            email: newUser.email,
        };

        return {
            user,
            accessToken: accessToken,
            refreshToken: refreshToken,
        };
    }

    @HttpCode(200)
    @Post("/logout")
    @OpenAPI({
        summary: 'sign out',
        statusCode: '200',
    })
    public logout(@Res() res: Response) {
        const refreshToken = res.locals.token;

        res.clearCookie('accessToken')
        removeRefreshTokenCookie(res)

        return {
            message: 'successfully signed out'
        }
    }


    @HttpCode(200)
    @Post("/token/refresh")
    @OpenAPI({
        summary: "token reissue",
        description: "Reissue AccessToken with RefreshToken",
        statusCode: "200",
        responses: {
            "406": {
                description: "Unauthorized",
            },
        },
    })
    @UseBefore(checkCookieRefreshToken)
    public async refreshToken(
        @Res() res: Response
    ) {
        const {userId} = res.locals.jwtPayload;
        const refreshToken = res.locals.token;

        const user = await this.authService.validateUserToken(userId, refreshToken);

        if (!user) {
            return res.status(406).send({
                message: "RefreshToken mismatch.",
            });
        }

        const accessToken = generateAccessToken(user);
        setAccessTokenCookie(res, accessToken)

        return {
            user
        };
    }

    @HttpCode(200)
    @Get("/user")
    @OpenAPI({
        summary: "user info",
        description:
            "Return user info by AccessToken (used for Frontend auth state check)",
        statusCode: "200",
    })
    @UseBefore(checkCookieAccessToken)
    public auth(@Res() res: Response) {
        const {userId, userName, userEmail} = res.locals.jwtPayload;

        const user: ResponseUserDto = {
            id: userId,
            email: userEmail,
            realName: userName
        };

        return {
            user,
        };
    }
}
