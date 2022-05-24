import {AuthService} from "../services/AuthService";
import {
    JsonController,
    Res,
    HttpCode, Get, Param
} from "routing-controllers";

import {Response} from "express";
import {UserService} from "../services/UserService";
import {OpenAPI} from "routing-controllers-openapi";
import {VisualPrintingService} from "../services/VisualPrintingService";
import {StlService} from "../services/StlService";

@JsonController("/visualPrintings")
export class StlController {
    constructor(
        private authService: AuthService,
        private userService: UserService,
        private visualPrintingService: VisualPrintingService,
        private stlService: StlService,
    ) {
    }

    @HttpCode(200)
    @Get("/:visualPrintingId/stls")
    @OpenAPI({
        summary: "VisualPrinting에 포함된 STL 조회",
        responses: {
            "400": {
                description: "Bad request",
            },
        },
        statusCode: "200",
    })
    public async getAll(@Param("visualPrintingId") visualPrintingId: string, @Res() res: Response) {
        const isVisualPrinting = await this.visualPrintingService.isVisualPrintingById(visualPrintingId);

        if (isVisualPrinting) {
            return this.stlService.getStlsByVisualPrintingId(visualPrintingId);
        }

        return res.status(400).send({message: "일치하는 VisualPrinting이 없습니다."});
    }
}
