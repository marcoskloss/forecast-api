import { Controller, Post } from '@overnightjs/core';
import { User } from '@src/models/user';
import AuthService from '@src/services/auth';
import { Request, Response } from 'express';
import { BaseController } from '.';

@Controller('users')
export class UsersController extends BaseController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const user = new User(req.body);
      const newUser = await user.save();
      res.status(201).json(newUser);
    } catch (error) {
      this.sendCreatedUpdatedErrorResponse(res, error);
    }
  }

  @Post('authenticate')
  public async authenticate(
    req: Request,
    res: Response
  ): Promise<Response | void> {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ code: 401, error: 'User not found!' });
    }

    if (!(await AuthService.comparePasswords(password, user.password))) {
      return res.status(401).json({
        code: 401,
        error: 'Password does not match!',
      });
    }

    const token = AuthService.generateToken(user.toJSON());
    res.status(200).json({ token });
  }
}
