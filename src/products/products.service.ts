import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import { Product, Variant, OptionValue } from './products.schema';
import * as fs from 'fs';
import * as csv from 'csv-parser';
import { v4 as uuidv4 } from 'uuid';
import { ManufacturersService } from '../manufacturers/manufacturers.service';
import { VendorsService } from '../vendors/vendors.service';
import { OpenAIService } from '../openai/openai.service';
import { OptionNameEnum } from './enums';
import { randomBytes } from 'crypto';


@Injectable()
export class ProductsService {

    constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,    
    private manufacturersService: ManufacturersService, 
    private vendorsService: VendorsService,
    private openAIService: OpenAIService
) { }

    async create(product: Product): Promise<Product> {
        const newProduct = new this.productModel(product);
        return newProduct.save();
    }

    async importProducts(filePath: string, deleteFlag: boolean): Promise<any> {
        try {

            const productsData: any[] = [];
            let columnNames: string[] = [];

            // Read and parse the CSV file with a custom delimiter (tab)
            await new Promise((resolve, reject) => {
                fs.createReadStream(filePath)
                    .pipe(csv({ separator: '\t' })) // Specify tab as the separator
                    .on('headers', (headers) => {
                        columnNames = headers.map(header => header.trim()); // Trim column names
                    })
                    .on('data', (row) => {
                        // Create a trimmed row object
                        const trimmedRow: Record<string, string> = {};

                        for (const [key, value] of Object.entries(row)) {
                            // Ensure value is treated as string and trimmed
                            if (typeof value === 'string') {
                                trimmedRow[key.trim()] = value.trim();
                            } else {
                                trimmedRow[key.trim()] = String(value); // Convert non-string values to string
                            }
                        }

                        // Check if the row is not empty or just spaces
                        if (Object.values(trimmedRow).some(value => value && value.trim() !== '')) {
                            productsData.push(trimmedRow);
                        }
                    })
                    .on('end', resolve)
                    .on('error', reject);
            });

            // Log the column names and the products data
            // console.log("Column Names:", columnNames);
            // console.log("Products Data:", productsData);

            // Handle deletions if the flag is set
            // if (deleteFlag) {
            //     await this.deleteOldProducts(productsData);
            // }

            await this.handleProductionImport(productsData);

            return { columnNames, data: this.getFirstNProducts(productsData, 500) };

        } catch (err) {
            console.log(err);
        }
    }

    private async handleProductionImport(productsData: any[]) {

        for (const row of productsData) {
            const {
                SiteSource,
                ItemID,
                ManufacturerID,
                ManufacturerCode,
                ManufacturerName,
                ProductID,
                ProductName,
                ProductDescription,
                ManufacturerItemCode,
                ItemDescription,
                ImageFileName,
                ItemImageURL,
                NDCItemCode,
                PKG,
                UnitPrice,
                QuantityOnHand,
                PriceDescription,
                Availability,
                PrimaryCategoryID,
                PrimaryCategoryName,
                SecondaryCategoryID,
                SecondaryCategoryName,
                CategoryID,
                CategoryName,
                IsRX,
                IsTBD
            } = row;

            let product = await this.getProductById(ProductID);

            const manufacturerData = { ManufacturerName, ManufacturerID, ManufacturerCode };

            let manufacturerId = '', vendorId = '';

            if(ManufacturerName) vendorId = await this.vendorsService.handleReturnVendor(manufacturerData);
            if(ManufacturerCode) manufacturerId = await this.manufacturersService.handleReturnManufacturer(manufacturerData);

           // Enhance description was not used cause of limit issues (insufficient_quota)
           // You exceeded your current quota, please check your plan and billing details.
           // const result = await this.openAIService.enhanceDescription(ProductName, CategoryName, ProductDescription);
           // const result = await this.enhanceDescription(ProductDescription);

            if (!product) {

                const productPayload = {
                    doc_id: uuidv4(),
                    name: ProductName,
                    productId: ProductID,
                    type: "non-inventory",
                    shortDescription: ProductDescription,
                    description: ProductDescription,
                    vendorId,
                    manufacturerId,
                    storefrontPriceVisibility: "members-only",
                    availability: "available",
                    isFragile: false,
                    published: "published",
                    isTaxable: true,
                    images: [
                        {
                            fileName: ImageFileName, //" <image_file_name>",
                            cdnLink: ItemImageURL, //" <item_image_url>",
                            i: 0,
                            alt: null,
                        },
                    ],
                    options: [
                        {
                            name: OptionNameEnum.PACKAGING,                       
                            values: [ 
                            { 
                                id: this.generateRandomString(6),                         
                                name: PKG,                            
                                value: PKG
                            }
                            ] as OptionValue[],                        
                            id: this.generateRandomString(6),
                            dataField: null,
                        },
                        {
                            name: OptionNameEnum.DESCRIPTION,                       
                            values: [
                            { 
                                    id: this.generateRandomString(6),                         
                                    name: ItemDescription,                            
                                    value: ItemDescription
                                }
                            ] as OptionValue[],                        
                            id: this.generateRandomString(6),
                            dataField: null,
                        },
                    ],
                    categoryId: CategoryID
                } as Product;

                product = await this.create(productPayload);
            } else {
            }

            await this.addVariantIfNotExists(row);
            if(product) {
              await this.addPackagingOptionValue(product.doc_id.toString(), PKG);
              await this.addDescriptionOptionValue(product.doc_id.toString(), ItemDescription);
              await this.updateOptions(product.doc_id.toString());
            }
        }
    }

    async addPackagingOptionValue(id: string, data: string) {
        await this.addOptionValue(id, OptionNameEnum.PACKAGING, { 
            id: this.generateRandomString(6),                         
            name: data,                            
            value: data
        });
    }

    async addDescriptionOptionValue(id: string, data: string) {
        await this.addOptionValue(id, OptionNameEnum.DESCRIPTION, { 
            id: this.generateRandomString(6),                         
            name: data,                            
            value: data
        });
    }

    async addOptionValue(id: string, optionName: string, newValue: OptionValue) {
        const product = await this.productModel.findOne({ doc_id: id }).exec();
        if (product) {
        const option = product.options.find(opt => opt.name === optionName);
        if(option && option.values?.length > 0) {
            const valueExists = option?.values?.some(value => value.name === newValue.name);
            if (!valueExists) {
                option?.values.push(newValue);
                await product.save();        
            }
        }   
    }
    }

    // Add a new variant if manufacturerItemId does not exist
    async addVariantIfNotExists(productData: any): Promise<Product> {

        const { 
            SiteSource,
            ItemID,
            ManufacturerID,
            ManufacturerCode,
            ManufacturerName,
            ProductID,
            ProductName,
            ProductDescription,
            ManufacturerItemCode,
            ItemDescription,
            ImageFileName,
            ItemImageURL,
            NDCItemCode,
            PKG,
            UnitPrice,
            QuantityOnHand,
            PriceDescription,
            Availability,
            PrimaryCategoryID,
            PrimaryCategoryName,
            SecondaryCategoryID,
            SecondaryCategoryName,
            CategoryID,
            CategoryName,
            IsRX,
            IsTBD
        } = productData;

        const product = await this.getProductById(ProductID);

        // Check if the manufacturerItemId already exists based on itemId
        const variantExists = product.variants.some(variant => variant.manufacturerItemId === ItemID);

        // Check if variant exists baed on packaging and item description
        // let variantExists = false;

        // if(product?.variants?.length > 0)
        //    for (const productVariant of product.variants) 
        //       if(productVariant.packaging?.trim() === PKG?.trim() && productVariant.description?.trim() === ItemDescription?.trim())  
        //          variantExists = true;
                

        const newVariant: Variant = {
                id: uuidv4(),
                available: true,
                attributes: {},
                cost: this.parseToNumber(UnitPrice),
                currency: "USD",
                depth: null,
                description: ItemDescription,
                dimensionUom: null,
                height: null,
                width: null,
                manufacturerItemCode: ManufacturerItemCode,
                manufacturerItemId: ItemID,
                packaging: PKG ? PKG : '',
                price: this.parseToNumber(UnitPrice),
                volume: null,
                volumeUom: null,
                weight: null,
                weightUom: null,
                optionName: `${PKG ? PKG : ''}, ${ItemDescription}`,
                optionsPath: '', 
                optionItemsPath: '',
                sku : ItemID + ProductID + PKG,
                active: true,
                images: [
                    {
                        fileName: ImageFileName,
                        cdnLink: ItemImageURL,
                        i: 0,
                        alt: null,
                    },
                ],
                itemCode: ManufacturerItemCode, 
        } as Variant;

    // Add attributes only if both PKG and ItemDescription are present
    if (PKG && ItemDescription) {
        newVariant.attributes = {
            packaging: PKG,
            description: ItemDescription,
        };
    }

        if (!variantExists) {
            await this.productModel.updateOne(
                { productId: product.productId },
                { $push: { variants: newVariant } }
            );
        }

        return product; // Return the updated product
    }

    async updateOptions(id: string) {
        const product = await this.productModel.findOne({ doc_id: id }).exec();
    
        if (product) {
    
            // Generate optionsPath and optionItemsPath
            if (product.options && product.options.length > 0) {
                const packagingOption = product.options[0];
                const descriptionOption = product.options[1];
    
                // Generate optionsPath
                const optionsPath = `${packagingOption.id}.${descriptionOption.id}`;
    
                // Update each variant's optionsPath and optionsItemPath
                for (const productVariant of product.variants) {
                    productVariant.optionsPath = optionsPath;
    
                    // Match packaging and description to set optionsItemPath
                    const packagingValue = packagingOption.values.find(value => value.name?.trim() === productVariant.packaging?.trim());
                    const descriptionValue = descriptionOption.values.find(value => value.name?.trim() === productVariant.description?.trim());    
    
                    if (packagingValue && descriptionValue) {
                        productVariant.optionItemsPath = `${packagingValue.id}.${descriptionValue.id}`;
                    } else {
                        // Handle cases where the values do not match
                        productVariant.optionItemsPath = ''; // Or set to null, or another default value
                    }
                }
                }
            await product.save();
        }    
    }
    

    async getProductById(productId: string): Promise<Product> {
        const product = await this.productModel.findOne({ productId }).exec();
        return product;
    }

    async enhanceDescription(prompt) {
        try {
            const response = await axios.post('https://api.openai.com/v1/completions', {
                model: 'gpt-3.5-turbo',
                prompt: prompt,
                max_tokens: 100,
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                },
            });
            return response.data.choices[0].text.trim();
        } catch (error) {
            console.error('Error:', error.response ? error.response.data : error.message);
            throw new Error('Request failed');
        }
    }

    async countProductsByField(productsData: any[]): Promise<Record<string, number>> {
        const productIdCount: Record<string, number> = {};

        for (const product of productsData) {
            const fieldName = product.ManufacturerItemCode; // Adjust this key if needed
            if (fieldName) productIdCount[fieldName] = (productIdCount[fieldName] || 0) + 1;
        }

        return productIdCount;
    }

    getFirstNProducts(productsData: any[], n: number): any[] {
        return productsData.slice(0, n);
    }

    generateRandomString = (length: number) => randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);

    parseToNumber = (value: string): number => isNaN(parseFloat(value)) ? 0 : parseFloat(value);
    

}
