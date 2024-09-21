import { Controller, Post, Body } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './products.schema';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post('import')
    async importProducts(@Body() body: any): Promise<any> {
        return await this.productsService.importProducts(body.filePath, body.deleteFlag);
    }

    @Post('create')
    async create(@Body() data: any) {
        return this.productsService.create(data);
    }
}
