import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { Seller } from './seller/seller.entity';

@Controller('/')
export class AppController {
  @Get('/confirm')
  async confirmEmail(@Res() res: Response, @Query('email') email?: string) {
    if (!email) {
      return res.redirect('/');
    }

    const seller = await Seller.findOne({ where: { email } });
    if (!seller) {
      return res.redirect('/');
    }

    seller.confirmedAt = new Date();
    await Seller.save(seller);

    res.redirect('/login');
  }
}
