import { Controller, Post } from '@overnightjs/core';
import { User } from '@src/models/user';
import { Request, Response } from 'express';

@Controller('users')
export class UsersController {
  @Post('')
  public async create(req: Request, res: Response): Promise<Response> {
    const user = new User(req.body);
    const newUser = await user.save();
    return res.status(201).json(newUser);
  }
}
