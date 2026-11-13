const { and, asc, desc, eq, isNull, ne, sql } = require('drizzle-orm');

const { db } = require('../db');
const {
  conversationMembers,
  conversationMessages,
  conversations,
  messageNotifications,
  users
} = require('../db/schema');
const { errorResponse, successResponse } = require('../utils/response');

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isMessage = (message) =>
  typeof message === 'string' && message.trim().length > 0 && message.trim().length <= 1000;

async function isMember(conversationId, userId) {
  const [member] = await db
    .select({ userId: conversationMembers.userId })
    .from(conversationMembers)
    .where(
      and(
        eq(conversationMembers.conversationId, conversationId),
        eq(conversationMembers.userId, userId)
      )
    )
    .limit(1);
  return Boolean(member);
}

module.exports = async function messageRoutes(app) {
  app.get('/members', { preHandler: app.authenticate }, async (request) => {
    const members = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(ne(users.id, request.user.sub))
      .orderBy(asc(users.name));
    return successResponse({ members });
  });

  app.get('/conversations', { preHandler: app.authenticate }, async (request) => {
    const conversationsForUser = await db
      .select({ created_at: conversations.createdAt, id: conversations.id })
      .from(conversationMembers)
      .innerJoin(conversations, eq(conversationMembers.conversationId, conversations.id))
      .where(eq(conversationMembers.userId, request.user.sub))
      .orderBy(desc(conversations.createdAt));

    const conversationsWithRecipients = await Promise.all(
      conversationsForUser.map(async (conversation) => {
        const [recipient] = await db
          .select({ name: users.name })
          .from(conversationMembers)
          .innerJoin(users, eq(conversationMembers.userId, users.id))
          .where(
            and(
              eq(conversationMembers.conversationId, conversation.id),
              ne(conversationMembers.userId, request.user.sub)
            )
          )
          .limit(1);
        const [unread] = await db
          .select({ count: sql`count(*)` })
          .from(messageNotifications)
          .innerJoin(
            conversationMessages,
            eq(messageNotifications.messageId, conversationMessages.id)
          )
          .where(
            and(
              eq(messageNotifications.userId, request.user.sub),
              eq(conversationMessages.conversationId, conversation.id),
              isNull(messageNotifications.readAt)
            )
          );
        return {
          ...conversation,
          recipient_name: recipient?.name || 'Conversation',
          unread_count: Number(unread?.count || 0)
        };
      })
    );
    return successResponse({ conversations: conversationsWithRecipients });
  });

  app.post('/conversations', { preHandler: app.authenticate }, async (request, reply) => {
    const recipientId = request.body?.recipient_id;
    if (!UUID.test(recipientId) || recipientId === request.user.sub)
      return reply
        .status(400)
        .send(errorResponse('VALIDATION_ERROR', 'La destinataire est invalide.'));

    const conversation = await db.transaction(async (transaction) => {
      const [recipient] = await transaction
        .select({ id: users.id, name: users.name })
        .from(users)
        .where(eq(users.id, recipientId))
        .limit(1);
      if (!recipient) return null;

      const [createdConversation] = await transaction.insert(conversations).values({}).returning();
      await transaction.insert(conversationMembers).values([
        { conversationId: createdConversation.id, userId: request.user.sub },
        { conversationId: createdConversation.id, userId: recipient.id }
      ]);
      return { ...createdConversation, recipient };
    });

    if (!conversation)
      return reply.status(404).send(errorResponse('USER_NOT_FOUND', 'Utilisatrice introuvable.'));
    return reply.status(201).send(successResponse({ conversation }));
  });

  app.get(
    '/conversations/:id/messages',
    { preHandler: app.authenticate },
    async (request, reply) => {
      if (!UUID.test(request.params.id))
        return reply.status(400).send(errorResponse('VALIDATION_ERROR', 'Conversation invalide.'));
      if (!(await isMember(request.params.id, request.user.sub)))
        return reply
          .status(404)
          .send(errorResponse('CONVERSATION_NOT_FOUND', 'Conversation introuvable.'));

      const messages = await db
        .select({
          created_at: conversationMessages.createdAt,
          id: conversationMessages.id,
          message: conversationMessages.message,
          sender_id: conversationMessages.senderId,
          sender_name: users.name
        })
        .from(conversationMessages)
        .innerJoin(users, eq(conversationMessages.senderId, users.id))
        .where(eq(conversationMessages.conversationId, request.params.id))
        .orderBy(asc(conversationMessages.createdAt));
      return successResponse({ messages });
    }
  );

  app.put(
    '/conversations/:id/notifications/read',
    { preHandler: app.authenticate },
    async (request, reply) => {
      if (!UUID.test(request.params.id))
        return reply.status(400).send(errorResponse('VALIDATION_ERROR', 'Conversation invalide.'));
      if (!(await isMember(request.params.id, request.user.sub)))
        return reply
          .status(404)
          .send(errorResponse('CONVERSATION_NOT_FOUND', 'Conversation introuvable.'));

      await db
        .update(messageNotifications)
        .set({ readAt: new Date() })
        .where(
          and(
            eq(messageNotifications.userId, request.user.sub),
            isNull(messageNotifications.readAt),
            sql`${messageNotifications.messageId} in (
              select ${conversationMessages.id} from ${conversationMessages}
              where ${conversationMessages.conversationId} = ${request.params.id}
            )`
          )
        );
      return successResponse({ read: true });
    }
  );

  app.post(
    '/conversations/:id/messages',
    { preHandler: app.authenticate },
    async (request, reply) => {
      if (!UUID.test(request.params.id) || !isMessage(request.body?.message))
        return reply.status(400).send(errorResponse('VALIDATION_ERROR', 'Message invalide.'));
      if (!(await isMember(request.params.id, request.user.sub)))
        return reply
          .status(404)
          .send(errorResponse('CONVERSATION_NOT_FOUND', 'Conversation introuvable.'));

      const message = await db.transaction(async (transaction) => {
        const [createdMessage] = await transaction
          .insert(conversationMessages)
          .values({
            conversationId: request.params.id,
            message: request.body.message.trim(),
            senderId: request.user.sub
          })
          .returning();
        const recipients = await transaction
          .select({ userId: conversationMembers.userId })
          .from(conversationMembers)
          .where(
            and(
              eq(conversationMembers.conversationId, request.params.id),
              ne(conversationMembers.userId, request.user.sub)
            )
          );
        if (recipients.length) {
          await transaction
            .insert(messageNotifications)
            .values(recipients.map(({ userId }) => ({ messageId: createdMessage.id, userId })));
        }
        return createdMessage;
      });
      return reply.status(201).send(successResponse({ message }));
    }
  );
};
