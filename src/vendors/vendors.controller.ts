import { Controller, Post, Body } from '@nestjs/common';
import { VendorsService } from './vendors.service';

@Controller('vendors')
export class VendorsController {
    constructor(private readonly vendorsService: VendorsService) { }

    @Post('create')
    async create(@Body() data: any) {
        return this.vendorsService.create(data);
    }
}
