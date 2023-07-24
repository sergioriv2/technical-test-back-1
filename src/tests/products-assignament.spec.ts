import { CustomException } from '../exceptions/custom-exception';
import {
  Product,
  ProductCapacity,
  ProductFragility,
  ProductPriority,
} from '../models/product';
import { Machine } from '../models/machine';
import { MachineHandler } from '../models/machines-handler';

beforeAll(() => {
  jest.clearAllMocks();
});

describe('1. Products assignment', () => {
  describe('Machines', () => {
    it('should process the machine assigned products', async () => {
      const smallMachine = new Machine({
        maxProductsCapacity: 3,
      });
      const products = [
        new Product({
          capacityOccupied: ProductCapacity.Small,
        }),
        new Product({
          capacityOccupied: ProductCapacity.Small,
        }),
        new Product({
          capacityOccupied: ProductCapacity.Small,
        }),
      ];

      const assignProductSpy = jest.spyOn(smallMachine, 'assingProduct');
      const processAssignedProductsSpy = jest.spyOn(
        smallMachine,
        'processAssignedProducts',
      );
      const isProductAssignableToMachineSpy = jest.spyOn(
        smallMachine,
        'isProductAssignableToMachine',
      );

      const machineHandler = new MachineHandler();
      machineHandler.machines = [smallMachine];

      await machineHandler.machinesProductsQueueHandler(products);

      expect(assignProductSpy).toHaveBeenCalledTimes(3);
      expect(processAssignedProductsSpy).toHaveBeenCalledTimes(1);
      expect(isProductAssignableToMachineSpy).toHaveBeenCalledTimes(3);

      expect(machineHandler.finishedProducts.length).toBe(products.length);
      for (const machine of machineHandler.machines) {
        expect(machine.capacityOccupied).toBeLessThanOrEqual(
          machine.maxCapacity,
        );
      }
    });
  });

  describe('Products', () => {
    it('should assign the products to the machines and set a detailed message after processing a product', async () => {
      const machines = [
        new Machine({
          maxProductsCapacity: 3,
        }),
      ];

      const products = [
        new Product({
          capacityOccupied: ProductCapacity.Small,
        }),
        new Product({
          capacityOccupied: ProductCapacity.Small,
        }),
        new Product({
          capacityOccupied: ProductCapacity.Small,
        }),
      ];

      const machineHandler = new MachineHandler();
      machineHandler.machines = machines;

      await machineHandler.machinesProductsQueueHandler(products);

      for (const machine of machineHandler.machines) {
        expect(machine.capacityOccupied).toBeLessThanOrEqual(
          machine.maxCapacity,
        );
      }

      expect(machineHandler.finishedProducts.length).toBe(products.length);

      for (const product of machineHandler.finishedProducts) {
        const productDetailsRegex =
          /Fecha de empaquetación: (\d{2}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2} hs)\. Reclamos válidos hasta (\d{2}\/\d{2}\/\d{2})\./;

        expect(product.details).not.toBeNull();
        expect(productDetailsRegex.test(product.details)).toBeTruthy();
      }
    });

    it('should assign the products to the machines and set a warning message if the product is fragile', async () => {
      const machines = [
        new Machine({
          maxProductsCapacity: 3,
        }),
      ];

      const products = [
        new Product({
          capacityOccupied: ProductCapacity.Small,
          fragility: ProductFragility.Fragile,
        }),
        new Product({
          capacityOccupied: ProductCapacity.Small,
        }),
        new Product({
          capacityOccupied: ProductCapacity.Small,
        }),
      ];

      const machineHandler = new MachineHandler();
      machineHandler.machines = machines;

      await machineHandler.machinesProductsQueueHandler(products);

      for (const machine of machineHandler.machines) {
        expect(machine.capacityOccupied).toBeLessThanOrEqual(
          machine.maxCapacity,
        );
      }

      const validateProductDetails = (product: Product, regex: RegExp) => {
        expect(product.details).not.toBeNull();
        expect(regex.test(product.details)).toBeTruthy();
      };

      const productDetailsRegex =
        /Fecha de empaquetación: (\d{2}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2} hs)\. Reclamos válidos hasta (\d{2}\/\d{2}\/\d{2})\./;
      const productDetailsWithWarningRegex =
        /Precaución: Producto frágil\.Fecha de empaquetación: (\d{2}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2} hs)\. Reclamos válidos hasta (\d{2}\/\d{2}\/\d{2})\./;

      expect(machineHandler.finishedProducts.length).toBe(products.length);

      for (const product of machineHandler.finishedProducts) {
        if (product.fragility === ProductFragility.Fragile) {
          validateProductDetails(product, productDetailsWithWarningRegex);
        } else {
          validateProductDetails(product, productDetailsRegex);
        }
      }
    });
  });

  describe('Machines Handler', () => {
    it('should assign the products to the machines according to their capacities', async () => {
      const machines = [
        new Machine({
          maxProductsCapacity: 5, // Medium machine
        }),
        new Machine({
          maxProductsCapacity: 3, // Small machine
        }),
      ];

      const products = [
        new Product({
          capacityOccupied: ProductCapacity.Medium,
        }),
        new Product({
          capacityOccupied: ProductCapacity.Small,
        }),
        new Product({
          capacityOccupied: ProductCapacity.Small,
        }),
        new Product({
          capacityOccupied: ProductCapacity.Small,
        }),
        new Product({
          capacityOccupied: ProductCapacity.Big,
        }),
      ];

      const machineHandler = new MachineHandler();
      machineHandler.machines = machines;

      const processProductsQueueSpy = jest.spyOn(
        machineHandler,
        'processProductsQueue',
      );
      const machinesProductsQueueHandlerSpy = jest.spyOn(
        machineHandler,
        'machinesProductsQueueHandler',
      );
      await machineHandler.machinesProductsQueueHandler(products);
      expect(processProductsQueueSpy).toHaveBeenCalled();
      expect(machinesProductsQueueHandlerSpy).toHaveBeenCalled();
      expect(machinesProductsQueueHandlerSpy).toHaveBeenCalledWith(products);
      expect(machineHandler.finishedProducts.length).toBe(products.length);
      for (const machine of machineHandler.machines) {
        expect(machine.capacityOccupied).toBeLessThanOrEqual(
          machine.maxCapacity,
        );
        expect(machineHandler.pendingProducts.length).toBe(0);
      }
    });

    it('should assign the products to the machines according to their capacities and priority', async () => {
      const mediumMachine = new Machine({
        maxProductsCapacity: 5,
      });

      const smallMachine = new Machine({
        maxProductsCapacity: 3,
      });

      const mediumMachineFirstProductExpected = new Product({
        priority: ProductPriority.High,
        capacityOccupied: ProductCapacity.Big,
      });

      const smallMachineFirstProductExpected = new Product({
        priority: ProductPriority.High,
        capacityOccupied: ProductCapacity.Small,
      });

      const products = [
        new Product({
          priority: ProductPriority.Normal,
          capacityOccupied: ProductCapacity.Medium,
        }),
        smallMachineFirstProductExpected,
        new Product({
          priority: ProductPriority.High,
          capacityOccupied: ProductCapacity.Small,
        }),
        new Product({
          priority: ProductPriority.Normal,
          capacityOccupied: ProductCapacity.Small,
        }),
        new Product({
          priority: ProductPriority.Normal,
          capacityOccupied: ProductCapacity.Big,
        }),
        new Product({
          priority: ProductPriority.Normal,
          capacityOccupied: ProductCapacity.Small,
        }),
        mediumMachineFirstProductExpected,
        new Product({
          priority: ProductPriority.Normal,
          capacityOccupied: ProductCapacity.Medium,
        }),
        new Product({
          priority: ProductPriority.Normal,
          capacityOccupied: ProductCapacity.Big,
        }),
      ];

      const machineHandler = new MachineHandler();
      machineHandler.machines = [mediumMachine, smallMachine];

      const processProductsQueueSpy = jest.spyOn(
        machineHandler,
        'processProductsQueue',
      );
      const machinesProductsQueueHandlerSpy = jest.spyOn(
        machineHandler,
        'machinesProductsQueueHandler',
      );

      await machineHandler.machinesProductsQueueHandler(products);
      expect(processProductsQueueSpy).toHaveBeenCalled();
      expect(machinesProductsQueueHandlerSpy).toHaveBeenCalled();
      expect(machinesProductsQueueHandlerSpy).toHaveBeenCalledWith(products);

      expect(mediumMachine.productsHistory[0].id).toBe(
        mediumMachineFirstProductExpected.id,
      );

      expect(smallMachine.productsHistory[0].id).toBe(
        smallMachineFirstProductExpected.id,
      );
      expect(machineHandler.finishedProducts.length).toBe(products.length);
      for (const machine of machineHandler.machines) {
        expect(machine.capacityOccupied).toBeLessThanOrEqual(
          machine.maxCapacity,
        );

        expect(machineHandler.pendingProducts.length).toBe(0);
      }
    });

    it('should assign the products to the machines and dont let any pending products left', async () => {
      const machines = [
        // new Machine({
        //   maxProductsCapacity: 10, // Big machine
        // }),
        new Machine({
          maxProductsCapacity: 5, // Medium machine
        }),
        new Machine({
          maxProductsCapacity: 3, // Small machine
        }),
      ];

      const products = [
        new Product({
          capacityOccupied: ProductCapacity.Medium,
        }),
        new Product({
          capacityOccupied: ProductCapacity.Small,
        }),
        new Product({
          capacityOccupied: ProductCapacity.Small,
        }),
        new Product({
          capacityOccupied: ProductCapacity.Big,
        }),
        new Product({
          capacityOccupied: ProductCapacity.Small,
        }),
        new Product({
          capacityOccupied: ProductCapacity.Big,
        }),
        new Product({
          capacityOccupied: ProductCapacity.Big,
        }),
      ];

      const machineHandler = new MachineHandler();
      machineHandler.machines = machines;

      const processProductsQueueSpy = jest.spyOn(
        machineHandler,
        'processProductsQueue',
      );
      const machinesProductsQueueHandlerSpy = jest.spyOn(
        machineHandler,
        'machinesProductsQueueHandler',
      );
      await machineHandler.machinesProductsQueueHandler(products);
      expect(processProductsQueueSpy).toHaveBeenCalled();
      expect(machinesProductsQueueHandlerSpy).toHaveBeenCalled();
      expect(machinesProductsQueueHandlerSpy).toHaveBeenCalledWith(products);
      expect(machineHandler.finishedProducts.length).toBe(products.length);
      for (const machine of machineHandler.machines) {
        expect(machine.capacityOccupied).toBeLessThanOrEqual(
          machine.maxCapacity,
        );

        expect(machineHandler.pendingProducts.length).toBe(0);
      }
    });
  });
});

describe('2. Optimization', () => {
  describe('Machines handler', () => {
    it('should assign the products to the machines according to their capacities #1', async () => {
      const machines = [
        new Machine({
          maxProductsCapacity: 5, // Medium machine
        }),
        new Machine({
          maxProductsCapacity: 3, // Small machine
        }),
      ];

      const products = [
        new Product({
          capacityOccupied: ProductCapacity.Small,
        }),
        new Product({
          capacityOccupied: ProductCapacity.Small,
        }),
        new Product({
          capacityOccupied: ProductCapacity.Big,
        }),
      ];

      const machineHandler = new MachineHandler();
      machineHandler.machines = machines;

      const machineHandlerAssignmentSpy = jest.spyOn(
        machineHandler,
        'processProductsQueue',
      );

      await machineHandler.machinesProductsQueueHandler(products);

      expect(machineHandlerAssignmentSpy).toBeCalledTimes(1);

      for (const machine of machineHandler.machines) {
        expect(machine.capacityOccupied).toBeLessThanOrEqual(
          machine.maxCapacity,
        );
      }
    });

    it('should assign the products to the machines according to their capacities #2', async () => {
      const machines = [
        new Machine({
          maxProductsCapacity: 5, // Medium machine
        }),
        new Machine({
          maxProductsCapacity: 3, // Small machine
        }),
      ];

      const products = [
        new Product({
          capacityOccupied: ProductCapacity.Small,
          priority: ProductPriority.High,
        }),
        new Product({
          capacityOccupied: ProductCapacity.Small,
          priority: ProductPriority.High,
        }),
        new Product({
          capacityOccupied: ProductCapacity.Small,
          priority: ProductPriority.High,
        }),
        new Product({
          capacityOccupied: ProductCapacity.Big,
        }),
        new Product({
          capacityOccupied: ProductCapacity.Medium,
        }),
      ];

      const machineHandler = new MachineHandler();
      machineHandler.machines = machines;

      const machineHandlerAssignmentSpy = jest.spyOn(
        machineHandler,
        'processProductsQueue',
      );

      await machineHandler.machinesProductsQueueHandler(products);

      expect(machineHandlerAssignmentSpy).toBeCalledTimes(2);

      for (const machine of machineHandler.machines) {
        expect(machine.capacityOccupied).toBeLessThanOrEqual(
          machine.maxCapacity,
        );
      }
    });

    it('should assign the products to the machines according to their capacities #3', async () => {
      const machines = [
        new Machine({
          maxProductsCapacity: 10,
        }),
        new Machine({
          maxProductsCapacity: 3,
        }),
      ];

      const products = [
        new Product({
          capacityOccupied: ProductCapacity.Medium,
          priority: ProductPriority.High,
        }),
        new Product({
          capacityOccupied: ProductCapacity.Medium,
          priority: ProductPriority.High,
        }),
        new Product({
          capacityOccupied: ProductCapacity.Big,
          priority: ProductPriority.Normal,
        }),
        new Product({
          capacityOccupied: ProductCapacity.Medium,
          priority: ProductPriority.High,
        }),
        new Product({
          capacityOccupied: ProductCapacity.Small,
          priority: ProductPriority.High,
        }),
      ];

      const machineHandler = new MachineHandler();
      machineHandler.machines = machines;

      const machineHandlerAssignmentSpy = jest.spyOn(
        machineHandler,
        'processProductsQueue',
      );

      await machineHandler.machinesProductsQueueHandler(products);

      expect(machineHandlerAssignmentSpy).toBeCalledTimes(2);

      for (const machine of machineHandler.machines) {
        expect(machine.capacityOccupied).toBeLessThanOrEqual(
          machine.maxCapacity,
        );
      }
    });
  });
});

describe('3. Error Handling', () => {
  describe('Machines handler', () => {
    it('should throw an error if the machines handler doesnt have any machines assigned', async () => {
      const products = [
        new Product({
          capacityOccupied: ProductCapacity.Small,
        }),
        new Product({
          capacityOccupied: ProductCapacity.Big,
        }),
        new Product({
          capacityOccupied: ProductCapacity.Small,
        }),
      ];

      const machineHandler = new MachineHandler();
      const machineHandlerSpy = jest.spyOn(
        machineHandler,
        'machinesProductsQueueHandler',
      );
      machineHandler.machines = [];

      try {
        await machineHandler.machinesProductsQueueHandler(products);
        expect(machineHandlerSpy).toThrow(CustomException);
      } catch (error) {
        expect(error).toBeInstanceOf(CustomException);
        expect(error.message).toBe('Máquinas no inicializadas');
        expect(error.property).toBe('MachineHandler.machines');
      }
    });

    it('should show a message if there was an error at the products handler loop', async () => {
      const mediumMachine = new Machine({
        maxProductsCapacity: 5,
      });

      const products = [
        new Product({
          capacityOccupied: ProductCapacity.Small,
        }),
      ];

      const machineHandler = new MachineHandler();
      const machineHandlerSpy = jest.spyOn(
        machineHandler,
        'machinesProductsQueueHandler',
      );
      machineHandler.machines = [mediumMachine];

      const processProductsQueueSpy = jest.spyOn(
        machineHandler,
        'processProductsQueue',
      );

      processProductsQueueSpy.mockRejectedValueOnce(new Error());

      try {
        await machineHandler.machinesProductsQueueHandler(products);
        expect(machineHandlerSpy).toThrow(CustomException);
      } catch (error) {
        expect(error).toBeInstanceOf(CustomException);
        expect(error.message).toBe('Ocurrio un error inesperado');
        expect(error.property).toBe('MachineHandler.processProductsQueue');
      }
    });
  });

  describe('Machines', () => {
    it('should throw an error if the probability of processing a product is triggered', async () => {
      const mediumMachine = new Machine({
        maxProductsCapacity: 5,
      });

      const products = [
        new Product({
          priority: ProductPriority.Normal,
          capacityOccupied: ProductCapacity.Medium,
        }),
      ];

      const machineHandler = new MachineHandler();
      const machineHandlerSpy = jest.spyOn(
        machineHandler,
        'machinesProductsQueueHandler',
      );
      machineHandler.machines = [mediumMachine];

      const getFailProbabilitySpy = jest.spyOn(
        mediumMachine,
        'getFailProbability',
      );
      getFailProbabilitySpy.mockReturnValueOnce(1);

      try {
        await machineHandler.machinesProductsQueueHandler(products);
        expect(machineHandlerSpy).toThrow(CustomException);
      } catch (error) {
        expect(getFailProbabilitySpy).toBeCalled();
        const regexErrorWithUUID =
          /Ocurrio un error al procesar un producto\. Id del producto: [0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
        expect(error).toBeInstanceOf(CustomException);
        expect(regexErrorWithUUID.test(error.message)).toBeTruthy();
        expect(error.property).toBe('Machine.processAssignedProducts');
      }
    });
  });
});
