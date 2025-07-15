const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const WEIGHTS = {
  READ: 3,
  LIKED: 3,
  OPEN: 4,
};

const getUserNews = async (req) => {
  const newNews = await prisma.userNewsCache.findMany({
    where: { userId: req.session.userId },
    orderBy: {
      id: "desc",
    },
    take: 30,
  });

  const personalNews = [];
  // there are entries found
  for (const art of newNews) {
    const newArticle = await prisma.news.findFirst({
      where: { id: art.newsId },
    });

    newArticle.score = art.score;
    newArticle.bookmarked = art.bookmarked;
    newArticle.addTagInput = art.addTagInput;

    personalNews.push(newArticle);
  }

  return personalNews;
};

const getRankings = async (
  dateScores,
  categoryScores,
  sourceScores,
  notUsedNews,
) => {
  let rankings = []; // json of the newsIds and the rankings
  for (const article of notUsedNews) {
    // calculate the score
    let score = 0.0;
    for (const category of article.category) {
      if (categoryScores.hasOwnProperty(category)) {
        // article has one of the weighted categories
        score += categoryScores[category];
      }
    }

    if (dateScores.hasOwnProperty(article.releasedAt.toDateString())) {
      score += dateScores[article.releasedAt.toDateString()];
    }

    const URLString = new URL(article.articleURL).hostname;
    if (sourceScores.hasOwnProperty(URLString)) {
      score += sourceScores[URLString];
    }

    const newRanking = {
      newsId: article.id,
      totalScore: score,
    };

    rankings.push(newRanking);
  }

  return rankings;
};

const createPersonalizedNews = async (req, news, rankings) => {
  for (const a of news) {
    if (rankings.includes(a.id)) {
      // one of the top 30 closest matches
      await prisma.userNewsCache.create({
        data: {
          user: { connect: { id: req.session.userId } },
          news: { connect: { id: a.id } }, // news id
          bookmarked: false, // initially
          score: 0.0, // default
          addedTime: new Date(),
          addTagInput: false,
        },
      });
    }
  }
};

const calculateEngagement = async (req) => {
  const interactions = await prisma.userInteraction.findMany({
    where: { userId: req.session.userId },
  });

  for (const interaction of interactions) {
    // get article
    const article = await prisma.userNewsCache.findFirst({
      where: { newsId: interaction.newsId },
    });

    const weightedLiked = interaction.isLiked ? WEIGHTS.LIKED : 1.0;
    const weightedOpen = interaction.openCount * WEIGHTS.OPEN; // 3 times whatever the number was
    const weightedRead = interaction.readCount * WEIGHTS.READ;

    const engagamentScore = weightedLiked + weightedOpen + weightedRead;

    await prisma.userNewsCache.update({
      where: { id: article.id },
      data: {
        score: engagamentScore,
      },
    });
  }
};

module.exports = {
  getUserNews,
  getRankings,
  createPersonalizedNews,
  calculateEngagement,
};
