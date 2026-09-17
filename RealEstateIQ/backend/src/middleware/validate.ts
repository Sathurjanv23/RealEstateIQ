import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/** Middleware: check express-validator results and return 400 on failure. */
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      code: 'VALIDATION_ERROR',
      errors: errors.array(),
    });
    return;
  }
  next();
};
