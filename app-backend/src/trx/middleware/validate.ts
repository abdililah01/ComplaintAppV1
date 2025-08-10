// file : app-backend  src/
import type { Request, Response, NextFunction } from 'express';
import type { AnyZodObject } from 'zod';

/**
 * Wrap a Zod schema and replace req.body/query/params with the parsed values.
 * Returns 422 with a structured error if validation fails.
 */
export const validate =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      return res
        .status(422)
        .json({ error: 'Validation failed', details: result.error.format() });
    }

    const parsed = result.data as any;
    // ✅ From here on, downstream only sees sanitized values
    req.body = parsed.body;
    if (parsed.query) (req as any).query = parsed.query;
    if (parsed.params) (req as any).params = parsed.params;

    return next();
  };