import { Router } from "express";
import { db } from "../../src/db/index.js";
import { supportTickets, supportTicketMessages, users, profiles } from "../../src/db/schema.js";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import { z } from "zod";

export const supportRouter = Router();

const createTicketSchema = z.object({
  category: z.string().min(1).max(50),
  subject: z.string().min(5, "Konu en az 5 karakter olmalıdır.").max(255),
  description: z.string().min(10, "Açıklama en az 10 karakter olmalıdır.")
});

const createMessageSchema = z.object({
  message: z.string().min(1, "Mesaj boş olamaz.")
});

// Create a new support ticket
supportRouter.post("/", requireAuth, async (req, res) => {
  try {
    const currentUserId = req.user!.userId;
    const parsed = createTicketSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message }
      });
    }

    const [ticket] = await db.insert(supportTickets).values({
      userId: currentUserId,
      category: parsed.data.category,
      subject: parsed.data.subject,
      description: parsed.data.description,
      status: "OPEN"
    }).returning();

    res.json({ success: true, data: ticket });
  } catch (error) {
    console.error("Create ticket error:", error);
    res.status(500).json({ success: false, error: { message: "Sunucu hatası" } });
  }
});

// Get user's support tickets
supportRouter.get("/", requireAuth, async (req, res) => {
  try {
    const currentUserId = req.user!.userId;
    
    const tickets = await db.select()
      .from(supportTickets)
      .where(eq(supportTickets.userId, currentUserId))
      .orderBy(desc(supportTickets.createdAt));
      
    res.json({ success: true, data: tickets });
  } catch (error) {
    console.error("Get tickets error:", error);
    res.status(500).json({ success: false, error: { message: "Sunucu hatası" } });
  }
});

// Get ticket details and messages
supportRouter.get("/:id", requireAuth, async (req, res) => {
  try {
    const currentUserId = req.user!.userId;
    const ticketId = parseInt(req.params.id as string);
    
    if (isNaN(ticketId)) return res.status(400).json({ success: false, error: { message: "Geçersiz ID" } });

    const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, ticketId));
    
    if (!ticket) {
      return res.status(404).json({ success: false, error: { message: "Talep bulunamadı" } });
    }
    
    if (ticket.userId !== currentUserId) {
      return res.status(403).json({ success: false, error: { message: "Yetkisiz erişim" } });
    }

    const messages = await db.select({
      id: supportTicketMessages.id,
      message: supportTicketMessages.message,
      isAdmin: supportTicketMessages.isAdmin,
      createdAt: supportTicketMessages.createdAt,
      user: {
        id: users.id,
        username: users.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
      }
    })
    .from(supportTicketMessages)
    .innerJoin(users, eq(users.id, supportTicketMessages.userId))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(eq(supportTicketMessages.ticketId, ticketId))
    .orderBy(supportTicketMessages.createdAt);

    res.json({ success: true, data: { ...ticket, messages } });
  } catch (error) {
    console.error("Get ticket error:", error);
    res.status(500).json({ success: false, error: { message: "Sunucu hatası" } });
  }
});

// Reply to a ticket
supportRouter.post("/:id/messages", requireAuth, async (req, res) => {
  try {
    const currentUserId = req.user!.userId;
    const ticketId = parseInt(req.params.id as string);
    
    if (isNaN(ticketId)) return res.status(400).json({ success: false, error: { message: "Geçersiz ID" } });

    const parsed = createMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { message: parsed.error.issues[0].message } });
    }

    const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, ticketId));
    
    if (!ticket) return res.status(404).json({ success: false, error: { message: "Talep bulunamadı" } });
    
    if (ticket.userId !== currentUserId) {
      return res.status(403).json({ success: false, error: { message: "Yetkisiz erişim" } });
    }
    
    if (ticket.status === 'CLOSED') {
      return res.status(400).json({ success: false, error: { message: "Kapanmış bir talebe yanıt veremezsiniz." } });
    }

    const [message] = await db.insert(supportTicketMessages).values({
      ticketId,
      userId: currentUserId,
      message: parsed.data.message,
      isAdmin: false
    }).returning();
    
    // Update ticket updatedAt
    await db.update(supportTickets)
      .set({ updatedAt: new Date() })
      .where(eq(supportTickets.id, ticketId));

    res.json({ success: true, data: message });
  } catch (error) {
    console.error("Create ticket message error:", error);
    res.status(500).json({ success: false, error: { message: "Sunucu hatası" } });
  }
});
