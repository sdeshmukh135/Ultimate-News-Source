const { prisma } = require("./setUpTransactions"); // using copy of original database (test database)
const schedule = require("node-schedule");

test("fetches existing news", async () => {
  const article = await prisma.news.findFirst();
  expect(article.name).toEqual(
    "MLS All-Stars 3-1 Liga MX All-Stars (Jul 23, 2025) Game Analysis"
  ); // most recent addition to news database
});

test("fetches existing news for a specific user", async () => {
  const userId = 6; // provided by req.session.userId in original version
  const article = await prisma.userNewsCache.findFirst({
    where: { userId: userId },
  });
  expect(article.name).toEqual(
    "And Just Like That Recap: Lisa Confesses to Sex Dream About Coworker"
  ); // most recent addition to userNewsCache
});

test("add a news article to the database", async () => {
  await prisma.$transaction(async (tx) => {
    const newNews = await tx.news.create({
      // added sample news
      data: {
        name: "Hi there",
        releasedAt: new Date(),
        category: ["politics"],
        articleURL: "www.google.com",
        imageURL: "this is an image url",
      },
    });

    expect(newNews).toBeDefined(); // most recent addition to news database
  });
});

test("add a scheduled article to the news database", async () => {
  // mimics adding scheduled article in News Scheduling System
  // simulates scheduling an article to be posted
  const rightNow = new Date();
  const timeToSchedule = new Date(rightNow.getTime() + 1 * 1000); // second in the future (to fall within timeout constraints)

  schedule.scheduleJob(timeToSchedule, async function () {
    const newArticle = await prisma.news.create({
      data: {
        name: "Hi there Scheduled",
        releasedAt: new Date(),
        category: ["politics"],
        articleURL: "www.google.com",
        imageURL: "this is an image url",
      },
    });
  });

  // wait for the job to complete
  await new Promise((resolve) => setTimeout(resolve, 1 * 1000)); // when the job completes

  // see if the job was added
  const article = await prisma.news.findMany({
    where: { name: "Hi there Scheduled" },
  });

  expect(article).toBeDefined; // most recent addition to news database
});
