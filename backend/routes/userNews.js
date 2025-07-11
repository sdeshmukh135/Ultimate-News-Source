// specifically for news specific to a user
const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// enums
const Categories = {
  GENERAL: "general",
  SCIENCE: "science",
  SPORTS: "sports",
  BUSINESS: "business",
  HEALTH: "health",
  ENTERTAINMENT: "entertainment",
  TECH: "tech",
  POLITICS: "politics",
  FOOD: "food",
  TRAVEL: "travel",
};

const RecentFilters = {
  TODAY: "today",
  LAST_WEEK: "last week",
  LAST_YEAR: "last year",
  GENERAL: "general",
};

const getSimiliarity = (userCategories, articleCategories) => {
    const intersection = new Set([...articleCategories].filter(e => userCategories.includes(e))) // A N B
    const union = new Set([...userCategories, ...articleCategories]); // A U B

    if (union === 0) { // nothing common between the two...which shouldn't happen
        return 0;
    }

    return intersection.size / union.size; // jaccard similiarity
}

// get user specific news
router.get("/", async (req, res) => {
  try {
    const newNews = await prisma.userNewsCache.findMany({
      where: { userId: req.session.userId },
      orderBy: {
        id: "desc",
      },
    });

    if (newNews.length != 0) {
      const personalNews = [];
      // there are entries found
      for (const article of newNews) {
        const newArticle = await prisma.news.findMany({
          where: { id: article.newsId },
        });

        newArticle[0].score = article.score;
        newArticle[0].bookmarked = article.bookmarked;

        personalNews.push(newArticle[0]);
      }
      res.json(personalNews);
    } else {
      res.status(404).json("No articles found");
    }
  } catch (error) {
    res.status(500).send("Server Error");
  }
});


router.get("/filter-news/:type", async (req, res) => {
  const chosenFilter = req.params.type;
  let filteredNews = [];
  // filter news accordingly
  try {
    if (Object.values(Categories).includes(chosenFilter)) {
      // this is a category filter
      filteredNews = await prisma.userNewsCache.findMany({
        where: {
          category: {
            has: chosenFilter,
          },
        },
        orderBy: {
          releasedAt: "desc",
        },
      });
    } else if (Object.values(RecentFilters).includes(req.params.type)) {
      // TO-DO: Update when more data is added to database
    } else if (req.params.type === "region") {
      // TO-DO: update after region tagging is complete
    } else if (req.params.type === "sentiment") {
      // TO-DO: sentiment--> update after tagging is complete
    } else {
      // last option "none" --> fetch original data
      filteredNews = await prisma.userNewsCache.findMany({
        orderBy: {
          releasedAt: "desc",
        },
      });
    }

    res.status(201).json(filteredNews);
  } catch (error) {
    res.json({ error: "Something went wrong with filtering" });
  }
});

// add news to cache (testing purposes, otherwise news is updated using engagement scores)
router.post("/add-news", async (req, res) => {
  try {
    const someNews = await prisma.news.findMany({
      // for 30 news articles (random subset for testing purposes)
      take: 30,
    });
    for (const article of someNews) {
      // creates 30 entries for
      const newNews = await prisma.userNewsCache.create({
        data: {
          user: { connect: { id: req.session.userId } },
          news: { connect: { id: article.id } }, // news id
          bookmarked: false, // initially
          score: 0.0, // default
        },
      });
    }

    const personalNews = await prisma.userNewsCache.findMany({
      where: { userId: req.session.userId },
    });

    res.status(201).json(personalNews);
  } catch (error) {
    res.status(500).json({ error: "Error in adding news to cache" });
  }
});

router.put("/:newsId/bookmarked", async (req, res) => {
  const { isBookmarked } = req.body;
  const newsid = parseInt(req.params.newsId);
  try {
    const article = await prisma.userNewsCache.findMany({
      where: { newsId: newsid },
    });
    if (article.length != 0) {
      // the metadata already exists so we are modifying an existing entry
      const updatedMetaData = await prisma.userNewsCache.update({
        where: { id: article[0].id },
        data: {
          bookmarked: isBookmarked,
        },
      });
    }

    const newNews = await prisma.userNewsCache.findMany({
      where: { userId: req.session.userId },
      orderBy: {
        id: "desc",
      },
    });

    const personalNews = [];
    // there are entries found
    for (const art of newNews) {
      const newArticle = await prisma.news.findMany({
        where: { id: art.newsId },
      });

      newArticle[0].score = art.score;
      newArticle[0].bookmarked = art.bookmarked;

      personalNews.push(newArticle[0]);
    }

    res.json(personalNews);
  } catch (error) {
    res.status(500).json({ error: "Error updating metadata" });
  }
});

// get a personalized feed
router.post("/personalized", async (req, res) => {
    const newNews = await prisma.userNewsCache.findMany({
      where: { userId: req.session.userId },
      orderBy: {
        id: "desc",
      },
    });

    const personalNews = [];
    // there are entries found
    for (const art of newNews) {
      const newArticle = await prisma.news.findMany({
        where: { id: art.newsId },
      });

      newArticle[0].score = art.score;
      newArticle[0].bookmarked = art.bookmarked;

      personalNews.push(newArticle[0]);
    }

    try {
         // sort news based on engagement scores
    personalNews.sort((a, b) =>  (b['score']) - (a['score']))
    const top10 = personalNews.slice(0,10); // top 10 articles with highest engagement scores

    let categories = []   // aggregate the categories present in the top 10
    for (const article of top10) {
        for (const category of article.category) {
            if (!categories.includes(category)) {
                categories.push(category)
            }
        }
    }

    // perform similiarity analysis
    weightedScores = {} // scores for every category (how many points a news article gets for having this category)
    for (article of top10) {
        const similiarity = getSimiliarity(categories, article.category)
        for (let category of article.category) {
            if (category in weightedScores) { // the category already exists
                weightedScores[category] += similiarity; // add onto the exisiting value
            } else {
                weightedScores[category] = similiarity;
            }
        }
    }
    
    // use the weights to give all news a score
    const allNews = await prisma.news.findMany();
    const usedNews = newNews.map(article => article.newsId)
    const notUsedNews = allNews.filter(id => !usedNews.includes(id)); // so that we are not looking at articles that have already been seen

    let rankings = []; // json of the newsIds and the rankings
    for (const article of notUsedNews) {
        // calculate the score
        let score = 0.0;
        for (const category of article.category) {
            if (weightedScores.hasOwnProperty(category)) { // article has one of the weighted categories
                score += weightedScores[category];
            }
        }
        const newRanking = {
            newsId : article.id,
            totalScore : score,
        }

        rankings.push(newRanking)
   }

    // sort rankings for the articles that are the best choices
    let sortedRankings = rankings.slice().sort((a, b) =>  (b['totalScore']) - (a['totalScore'])) // first 30 rankings (newsIds)
    sortedRankings = sortedRankings.slice(0, 30).map(article => article.newsId);

    const personalizedNews = [];
    for (const a of notUsedNews) {
        
        if (sortedRankings.includes(a.id)) {
            // one of the top 30 closest matches
            personalizedNews.push(a);
        }
    }

    res.status(201).json(personalizedNews);
    } catch (error) {
        res.status(500).json({error : "Could not created personalized feed"});
    }
   
})

// delete news from the cache
router.delete("/delete", async (req, res) => {
  await prisma.userNewsCache.deleteMany();
  res.status(201).json({ message: "Deleted Successfully" });
});

module.exports = router;
