import { Controller, Post } from '@overnightjs/core';
import { Beach } from '@src/models/beach';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

@Controller('beaches')
export class BeachesController {
  @Post('')
  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const beach = new Beach(req.body);
      const result = await beach.save();
      return res.status(201).json(result);
    } catch (err) {
      if (err instanceof mongoose.Error.ValidationError) {
        return res.status(422).json({ error: err.message });
      } else {
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }
}
