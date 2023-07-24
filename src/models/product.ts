import { v4 } from 'uuid';

export enum ProductCapacity {
  Big = 5,
  Medium = 3,
  Small = 1,
}

export enum ProductPriority {
  High = 'High',
  Normal = 'Normal',
}

export enum ProductFragility {
  Fragile = 'Fragile',
  NoFragile = 'No Fragile',
}

export class CreateProductDto {
  capacityOccupied: ProductCapacity;
  priority?: ProductPriority;
  fragility?: ProductFragility;
}

export class Product {
  readonly id: string;
  capacityOccupied: ProductCapacity;
  priority: ProductPriority;
  fragility: ProductFragility;
  assignedAt: Date | null;
  details: string | null;

  constructor(payload: CreateProductDto) {
    this.id = v4();
    this.assignedAt = null;
    this.details = null;
    this.capacityOccupied = payload.capacityOccupied;
    this.priority = payload.priority ?? ProductPriority.Normal;
    this.fragility = payload.fragility ?? ProductFragility.NoFragile;
  }

  markAsComplete() {
    // TODO: Implement logic
  }
}
