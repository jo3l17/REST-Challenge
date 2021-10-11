import { Prisma } from '.prisma/client';

const createComment = Prisma.validator<Prisma.CommentArgs>()({
  select: {
    content: true,
    published: true,
  },
});

type createCommentModel = Prisma.CommentGetPayload<typeof createComment>;

export { createCommentModel };
