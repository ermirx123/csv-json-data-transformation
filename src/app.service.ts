import { Injectable } from '@nestjs/common';
import { ProductsService } from './products/products.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AppService {

  private filePath: string = 'C:/Users/38344/Downloads/images40.txt';

  constructor(private readonly productsService: ProductsService) {}

  // CronExpression.EVERY_30_SECONDS for testing
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) 
  async handleCron() {
      const deleteFlag = false; 
      try {
          await this.productsService.importProducts(this.filePath, deleteFlag);
          console.log('Products imported successfully');
      } catch (error) {
          console.error('Error importing products:', error);
      }
  }

  // Method to update filePath if needed
  setFilePath(newPath: string) {
      this.filePath = newPath;
  }

}
