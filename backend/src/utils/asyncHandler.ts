import type { NextFunction, Request, RequestHandler, Response } from "express";

type HandlerAsync = (req: Request, res: Response, next: NextFunction) => Promise<void>;

// Envía cualquier error de un controlador async al middleware de errores
export function asyncHandler(fn: HandlerAsync): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
