import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

describe('OrdersController', () => {
  let controller: OrdersController;

  const mockOrdersService = {
    createOrder: jest.fn(),
    findAllOrders: jest.fn(),
    findOrdersByUserId: jest.fn(),
    findOrderById: jest.fn(),
    updateOrderById: jest.fn(),
    deleteOrderById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an order', async () => {
    const createOrderDto: CreateOrderDto = {
      items: [{ productId: '1', orderId: '1' }],
      orderSubTotal: 200,
      shippingFee: 10,
      shippingMethod: 'Standard',
      paymentId: 'payment123',
      status: 'AWAITING_PAYMENT',
      id: '1',
      userId: '1',
    };
    const req = { user: { id: '1' } };
    mockOrdersService.createOrder.mockResolvedValue(createOrderDto);

    expect(await controller.createOrder(createOrderDto, req)).toBe(createOrderDto);
    expect(mockOrdersService.createOrder).toHaveBeenCalledWith(createOrderDto, req.user);
  });

  it('should get all orders with pagination', async () => {
    const req = { user: { id: '1' } };
    const page = 1;
    const limit = 10;
    const result = {
      orders: [{ id: '1', userId: '1', status: 'AWAITING_PAYMENT' }],
      total: 1,
      page: 1,
      total_pages: 1,
    };
    mockOrdersService.findAllOrders.mockResolvedValue(result);

    expect(await controller.getAllOrders(page, limit, req)).toBe(result);
    expect(mockOrdersService.findAllOrders).toHaveBeenCalledWith(req.user, page, limit);
  });

  it('should get orders by user ID', async () => {
    const req = { user: { id: '1', role: 'ADMIN' } };
    const userId = '1';
    const page = 1;
    const limit = 10;
    const result = {
      orders: [{ id: '1', userId: '1', status: 'AWAITING_PAYMENT' }],
      total: 1,
      page: 1,
      total_pages: 1,
    };
    mockOrdersService.findOrdersByUserId.mockResolvedValue(result);

    expect(await controller.getOrdersByUserId(userId, page, limit, req)).toBe(result);
    expect(mockOrdersService.findOrdersByUserId).toHaveBeenCalledWith(userId, req.user, page, limit);
  });

  it('should get an order by ID', async () => {
    const req = { user: { id: '1' } };
    const result = { id: '1', userId: '1', status: 'AWAITING_PAYMENT' };
    mockOrdersService.findOrderById.mockResolvedValue(result);

    expect(await controller.getOrderById('1', req)).toBe(result);
    expect(mockOrdersService.findOrderById).toHaveBeenCalledWith('1', req.user);
  });

  it('should update an order', async () => {
    const updateOrderDto: UpdateOrderDto = {
      status: 'SHIPPED',
    };
    const req = { user: { id: '1' } };
    const result = { id: '1', userId: '1', status: 'SHIPPED' };
    mockOrdersService.updateOrderById.mockResolvedValue(result);

    expect(await controller.updateOrder('1', updateOrderDto, req)).toBe(result);
    expect(mockOrdersService.updateOrderById).toHaveBeenCalledWith('1', updateOrderDto, req.user);
  });

  it('should delete an order', async () => {
    const req = { user: { id: '1' } };
    mockOrdersService.deleteOrderById.mockResolvedValue(undefined);

    expect(await controller.deleteOrder('1', req)).toBeUndefined();
    expect(mockOrdersService.deleteOrderById).toHaveBeenCalledWith('1', req.user);
  });

  it('should return 403 if user is not authorized to get orders by user ID', async () => {
    const req = { user: { id: '2', role: 'USER' } };
    const userId = '1';
    const page = 1;
    const limit = 10;
    mockOrdersService.findOrdersByUserId.mockImplementation(() => {
      throw new ForbiddenException();
    });

    await expect(controller.getOrdersByUserId(userId, page, limit, req)).rejects.toThrow(ForbiddenException);
  });

  it('should return 400 if page or limit is invalid', async () => {
    const req = { user: { id: '1' } };
    const page = 0;
    const limit = 0;
    mockOrdersService.findAllOrders.mockImplementation(() => {
      throw new BadRequestException('Invalid page or limit value');
    });

    await expect(controller.getAllOrders(page, limit, req)).rejects.toThrow(BadRequestException);
  });
});
