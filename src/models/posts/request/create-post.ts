import { Prisma } from ".prisma/client";

const createPost = Prisma.validator<Prisma.PostArgs>() ({
  select: {
    title: true,
    content: true,
    published: true
   }
})

type createPostModel = Prisma.PostGetPayload<typeof createPost>

export {createPostModel}