import {Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";
import {env} from "../env";
import {User} from "../entities/User";
import axios from 'axios'
import {LoginUserDto} from "../dtos/UserDto";

/**
 * Generate JWT AccessToken.
 * @param user
 */
export const generateAccessToken = (user: User) => {
    return jwt.sign(
        {userId: user.id, userEmail: user.email},
        env.app.jwtAccessSecret,
        {
            expiresIn: "30m",
        },
    );
};

/**
 * Generate JWT RefreshToken.
 * @param user
 */
export const generateRefreshToken = (user: User) => {
    return jwt.sign({userId: user.id}, env.app.jwtRefreshSecret, {
        expiresIn: "14d",
    });
};

/**
 * Extract AccessToken form cookie.
 * @param req
 */
const extractAccessTokenFromCookies = (req: Request) => {
    if (
        req.signedCookies.accessToken
    ) {
        return req.signedCookies.accessToken
    }
};

/**
 * Extract RefreshToken form cookie.
 * @param req
 */
const extractRefreshTokenFromCookies = (req: Request) => {
    if (
        req.signedCookies.refreshToken
    ) {
        return req.signedCookies.refreshToken
    }
};

/**
 * set AccessToken to cookie.
 * @param res
 * @param accessToken
 */
export const setAccessTokenCookie = (res: Response, accessToken: string) => {
    return res.cookie('accessToken', accessToken, {
        maxAge: 1000 * 60 * 30, httpOnly: true, signed: true
    })
};

/**
 * set RefreshToken to cookie.
 * @param res
 * @param refreshToken
 */
export const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
    return res.cookie('refreshToken', refreshToken, {
        maxAge: 1000 * 60 * 60 * 24 * 14, httpOnly: true, path: '/api/auth', signed: true
    })
};

/**
 * remove refreshToken from cookie.
 * @param res
 */
export const removeRefreshTokenCookie = (res: Response) => {
    return res.cookie('refreshToken', '', {
        maxAge: 0, httpOnly: true, path: '/api/auth', signed: true
    })
};

/**
 * validate AccessToken in cookie.
 * @param req
 * @param res
 * @param next
 */
export const checkCookieAccessToken = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const token = extractAccessTokenFromCookies(req)
    let jwtPayload;

    try {
        jwtPayload = jwt.verify(token, env.app.jwtAccessSecret);
        res.locals.jwtPayload = jwtPayload;
    } catch (error) {
        return res.status(401).send({message: "Invalid or Missing JWT token"});
    }

    next();
};

/**
 * validate RefreshToken in cookie.
 * @param req
 * @param res
 * @param next
 */
export const checkCookieRefreshToken = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const token = extractRefreshTokenFromCookies(req)
    let jwtPayload;

    try {
        jwtPayload = jwt.verify(token, env.app.jwtRefreshSecret);
        res.locals.jwtPayload = jwtPayload;
        res.locals.token = token;
    } catch (error) {
        return res.status(406).send({message: "Invalid or Missing JWT token"});
    }

    next();
};

/**
 * Extract AccessToken from header (used for Bearer Auth).
 * @param req
 */
const extractAccessToken = (req: Request) => {
    if (
        req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
        return req.headers.authorization.split(" ")[1];
    }
};

/**
 * Extract RefreshToken
 * @param req
 */
const extractRefreshToken = (req: Request) => {
    if (req.body.refresh_token && req.body.grant_type === "refresh_token") {
        return req.body.refresh_token;
    }
};

/**
 * Validate JWT AccessToken.
 * @param req
 * @param res
 * @param next
 */
export const checkAccessToken = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const token = extractAccessToken(req);
    let jwtPayload;

    try {
        jwtPayload = jwt.verify(token, env.app.jwtAccessSecret);
        res.locals.jwtPayload = jwtPayload;
    } catch (error) {
        return res.status(401).send({message: "Invalid or Missing JWT token"});
    }

    next();
};

/**
 * Validate JWT RefreshToken.
 * @param req
 * @param res
 * @param next
 */
export const checkRefreshToken = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const token = extractRefreshToken(req);
    let jwtPayload;

    try {
        jwtPayload = jwt.verify(token, env.app.jwtRefreshSecret);
        res.locals.jwtPayload = jwtPayload;
        res.locals.token = token;
    } catch (error) {
        return res.status(401).send({message: "Invalid or Missing JWT token"});
    }

    next();
};
