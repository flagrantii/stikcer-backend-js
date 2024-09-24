import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from 'src/database/database.service';
import * as uuid from 'uuid';

@Injectable()
export class PaymentService {
  constructor(
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService,
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto) {
    const refNo = Math.random().toString(36).substring(2, 15);
    try {
      const merchantId = this.configService.get<string>('PAYMENT_MERCHANT_ID');
      const merchantSecretKey = this.configService.get<string>('PAYMENT_MERCHANT_SECRET_KEY');
      const apiKey = this.configService.get<string>('PAYMENT_API_KEY');
      if (!merchantId || !merchantSecretKey || !apiKey) {
        throw new InternalServerErrorException('Payment configuration is missing');
      }

      const response = await axios.post('https://payment.paysolutions.asia/epaylink/payment.aspx', {
        orderNo: createPaymentDto.orderId,
        refNo: refNo,
        productDetail: createPaymentDto.productDetail,
        customeremail: createPaymentDto.customerEmail,
        cc: createPaymentDto.currencyCode,
        total: createPaymentDto.total,
        lang: createPaymentDto.lang,
        channel: createPaymentDto.channel,
      }, {
        headers: {
          'merchantId': merchantId,
          'merchantSecretKey': merchantSecretKey,
          'Content-Type': 'application/json',
          'apikey': apiKey,
        }
      });

      const paymentData = response.data[0];
      if (!paymentData) {
        throw new InternalServerErrorException('Invalid response from payment gateway');
      }

      const paymentId = uuid.v4();
      const payment = await this.databaseService.payment.create({
        data: {
          id: paymentId,
          orderId: paymentData.OrderNo,
          refNo: paymentData.ReferenceNo,
          productDetail: paymentData.ProductDetail,
          customerEmail: paymentData.CustomerEmail,
          currencyCode: paymentData.CurrencyCode,
          total: paymentData.Total,
          lang: paymentData.Lang,
          channel: paymentData.Channel,
        },
      });

      return {
        redirectUrl: paymentData.PostBackUrl,
        status: paymentData.Status,
        statusName: paymentData.StatusName,
        paymentId: payment.id,
      };
    } catch (error) {
      console.error('Error creating payment:', error);
      throw new InternalServerErrorException('Failed to create payment');
    }
  }
}