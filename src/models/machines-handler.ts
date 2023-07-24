import { Product } from './product';
import { Machine } from './machine';

export class MachineHandler {
  pendingProducts: Product[];
  finishedProducts: Product[];
  machines: Machine[];

  constructor() {
    this.pendingProducts = [];
    this.finishedProducts = [];
  }

  async processProductsQueue() {
    // TODO: Implement logic
  }

  async machinesProductsQueueHandler(productsQueue: Product[]) {
    // TODO: Implement logic
    // while (this.pendingProducts.length > 0) {
    //   await this.processProductsQueue();
    // }
  }
}
