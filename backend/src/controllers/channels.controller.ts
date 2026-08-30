import { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { chatService } from "../services/chatService";

export const sendMessageSchema = z.object({ body: z.string().min(1) });

export const list = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: await chatService.list() });
});

export const open = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: await chatService.open(req.params.id) });
});

export const send = asyncHandler(async (req: Request, res: Response) => {
  const { body } = req.body as z.infer<typeof sendMessageSchema>;
  res.status(201).json({ success: true, data: await chatService.send(req.params.id, req.user!.name, body) });
});
