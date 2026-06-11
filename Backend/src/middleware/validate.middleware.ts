import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodEffects } from "zod";

/**
 * ✅ ZOD VALIDATION MIDDLEWARE
 * Enforces schemas on request body, query, and params.
 */
export const validate = (schema: AnyZodObject | ZodEffects<AnyZodObject>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      next(error);
    }
  };
};
