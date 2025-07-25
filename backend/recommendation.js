const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getClient = require("./redis.js"); // import Redis Client

const CACHE_KEY = 'news:cached';

const { Node, PriorityQueue } = require("./PriorityQueue");

const expoDecayFactor = (releaseDate, lambda = 0.05) => {
  // fetch the decay factor based on what the releasedAt date
  // perform exponential decay (based on the difference in time from the release date and today's date)
  const currentTime = new Date();
  const delta = (currentTime - releaseDate) / (1000 * 60 * 60 * 24); // convert to days (to find the difference in days)

  return Math.exp(-lambda * delta);
};

const isValidURL = (url) => {
  try {
    const newURL = new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

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
    newArticle.canvasData = art.canvasData;
    newArticle.timeOpened = art.timeOpened;

    personalNews.push(newArticle);
  }

  return personalNews;
};

const getRankings = (
  dateScores,
  categoryScores,
  sourceScores,
  sentimentScores,
  notUsedNews
) => {
  let queue = new PriorityQueue();
  for (const article of notUsedNews) {
    // calculate the score
    let score = 0.0;
    for (const category of article.category) {
      if (categoryScores.hasOwnProperty(category)) {
        // article has one of the weighted categories
        score += categoryScores[category];
      }
    }

    if (dateScores.hasOwnProperty((new Date(article.releasedAt)).toDateString())) {
      score +=
        dateScores[new Date(article.releasedAt).toDateString()] *
        expoDecayFactor(new Date(article.releasedAt));
    } else {
      score += 0.5 * expoDecayFactor(new Date(article.releasedAt)); // explorary weight to give articles that do not have a match but are more recent still some weightage
    }

    if (!isValidURL(article.articleURL)) { // is not a valid URL
      continue; // invalid
    }
    const URLString = new URL(article.articleURL).hostname;
    if (sourceScores.hasOwnProperty(URLString)) {
      score += sourceScores[URLString];
    }

    if (sentimentScores.hasOwnProperty(article.sentiment[0].label)) {
      score += sentimentScores[article.sentiment[0].label];
    }

    const ranking = new Node(article.id, score);
    queue.add(ranking);
  }

  return queue;
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

const changeEnagagementWeights = async (req) => {
  const interactions = await prisma.userInteraction.findMany({ // all interactions
    where : {userId : req.session.userId}
  });

  const prevWeights = await prisma.engagementWeight.findMany({
    where : {userId : req.session.userId}
  })

  if (prevWeights[0].updatedLast.toDateString() === (new Date()).toDateString()) { // only want it to update daily
    return; // not updating
  }

  // aggregate count, then update the weightage based on the proportion of engagament comes from that specific engagement
  let openCount = 0;
  let readCount = 0;
  let likeCount = 0;
  let voteCount = 0;
  for (const interaction of interactions) {
    openCount += interaction.openCount;
    readCount += interaction.readCount;
    likeCount = (interaction.isLiked) ? likeCount + 1 : likeCount;
    voteCount = (interaction.voted) ? voteCount + 1 : voteCount;
  }

  const totalCount = openCount + readCount + likeCount + voteCount;

  const weights = {
    openCount : openCount / totalCount, // proportion of engagement done by this signal
    readCount : readCount / totalCount,
    isLiked : likeCount / totalCount,
    voted : voteCount / totalCount,
  } 

  for (const signalWeight of prevWeights) {
    const signal = signalWeight.signal;

    const updatedWeight = await prisma.engagementWeight.update({
      where : {id : signalWeight.id},
      data : {
        weight : parseFloat((signalWeight.weight + weights[signal]).toFixed(2)),
        updatedLast : new Date()
      }
    })
  }
}

const calculateEngagement = async (req) => {
  const interactions = await prisma.userInteraction.findMany({
    where: { userId: req.session.userId },
  });

  await changeEnagagementWeights(req);

  for (const interaction of interactions) {
    // get article
    const article = await prisma.userNewsCache.findFirst({
      where: { newsId: interaction.newsId },
    });

    const weightedLiked = interaction.isLiked
      ? (
          await prisma.engagementWeight.findFirst({
            where: { signal: "isLiked" },
          })
        ).weight
      : 1.0; // 1.0 as the default (i.e. no effect if it has not been bookmarked)
    const weightedOpen =
      interaction.openCount *
      (
        await prisma.engagementWeight.findFirst({
          where: { signal: "openCount" },
        })
      ).weight; // 3 times whatever the number was
    const weightedRead =
      interaction.readCount *
      (
        await prisma.engagementWeight.findFirst({
          where: { signal: "readCount" },
        })
      ).weight;
    const weightedVoted = interaction.voted
      ? (
          await prisma.engagementWeight.findFirst({
            where: { signal: "voted" },
          })
        ).weight
      : 1.0;

    const engagamentScore =
      weightedLiked + weightedOpen + weightedRead + weightedVoted;

    await prisma.userNewsCache.update({
      where: { id: article.id },
      data: {
        score: engagamentScore,
      },
    });
  }
};

const getCachedNews = async () => {
  try {
    const redis = await getClient();
    const cachedNews = await redis.get(CACHE_KEY);

    if (cachedNews) { // news exists within the cache (cache HIT)
      return JSON.parse(cachedNews); // return the news we are looking for
    }

    const totalNum = await prisma.news.count();

    const originalNews = await prisma.news.findMany({
      orderBy : {releasedAt : 'desc'},
      take : totalNum * 0.3 // want 30% of the database of the most recent news
    })

    await redis.set(CACHE_KEY, JSON.stringify(originalNews), {
      EX: 3600 // TTL (Time To Live) is 1 hour
    })

    return originalNews; // CACHE MISS so we fetched from database
  } catch (error) {
    console.error("Failed to fetch from cache");
  }
}

module.exports = {
  getUserNews,
  getCachedNews,
  getRankings,
  expoDecayFactor,
  createPersonalizedNews,
  calculateEngagement,
};
