import { ZodError } from 'zod';

export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      // Validate and transform the data
      const validated = schema.parse({
        ...req.body,
        ...req.params,
        ...req.query
      });
      
      // Attach validated data to request
      req.validated = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }
      next(error);
    }
  };
};
