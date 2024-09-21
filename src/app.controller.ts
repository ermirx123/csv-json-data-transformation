import { Controller, Get, Put, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Put('update-file-path')
  async updateFilePath(@Body() body: { filePath: string }): Promise<any> {
      return this.appService.setFilePath(body.filePath);
  }
}
