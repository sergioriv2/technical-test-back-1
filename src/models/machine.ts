import { v4 } from 'uuid';
import { Product } from './product';

export class CreateMachineDto {
  maxProductsCapacity: number;
}

export class Machine {
  readonly id: string;
  private productsOnQueue: Product[];
  private failProbability: number;
  productsHistory: Product[];
  failedProducts: Product[];

  isWorking: boolean;
  maxCapacity: number;
  capacityOccupied: number;

  constructor(payload: CreateMachineDto) {
    this.id = v4();
    this.maxCapacity = payload.maxProductsCapacity;
    this.capacityOccupied = 0;
    this.isWorking = false;
    this.productsOnQueue = [];
    this.productsHistory = [];
    this.failedProducts = [];
    this.failProbability = 0;
  }

  getFailProbability() {
    return this.failProbability;
  }

  async processAssignedProducts(): Promise<Product[]> {
    const workTimeOut = 500;
    const productsOnQueue = this.productsOnQueue;

    return await Promise.all(
      productsOnQueue.map(() => {
        return new Promise<Product>(() => {
          setTimeout(() => {
            // TODO: Implement logic
          }, workTimeOut);
        });
      }),
    );
  }

  isProductAssignableToMachine(product: Product) {
    const isAssignable =
      this.maxCapacity >= this.capacityOccupied + product.capacityOccupied;

    return isAssignable;
  }

  assingProduct(product: Product) {
    product.assignedAt = new Date();
    this.productsOnQueue.push(product);
    this.capacityOccupied += product.capacityOccupied;
  }
}
