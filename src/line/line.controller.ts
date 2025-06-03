import { Controller, Get, Post, Body, Patch, Param, Delete, Req, HttpStatus, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { LineService } from './line.service';

@Controller('line')
export class LineController {
  constructor(private readonly lineService: LineService) { }
  @Get()
  testApi() {
    return "Hello"
  }

  @Post('webhook')
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    return this.lineService.handleWebhook(req, res)
  }

  
}
