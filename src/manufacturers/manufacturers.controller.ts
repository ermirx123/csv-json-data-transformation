import { Controller, Post, Body } from '@nestjs/common';
import { ManufacturersService } from './manufacturers.service';

@Controller('manufacturers')
export class ManufacturersController {
    constructor(private readonly manufacturersService: ManufacturersService) { }

    @Post('create')
    async create(@Body() data: any) {
        return await this.manufacturersService.create(data);
    }
}
