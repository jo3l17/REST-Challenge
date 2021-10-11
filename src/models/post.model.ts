import { Prisma } from '.prisma/client';

const PostWithComments = Prisma.validator<Prisma.PostArgs>()({
  include: { comments: true },
});

const PostData = Prisma.validator<Prisma.PostArgs>()({
  select: {
    title: true,
    content: true,
    published: true,
  },
});

type PostModel = Prisma.PostGetPayload<typeof PostData>;

export { PostModel };
