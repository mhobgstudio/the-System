/* ──────────────────────────────────────────────
 * Solo Leveling System — Motivational Quotes
 * ────────────────────────────────────────────── */

const QUOTES_DATA = [
  { id: 1, text: "Great power comes with great benefits.", author: "Fang Yuan", source: "Reverend Insanity", category: "power", contexts: ["questComplete", "levelUp"] },
  { id: 2, text: "The strong prey on the weak; this is the law of nature.", author: "Fang Yuan", source: "Reverend Insanity", category: "power", contexts: ["daily"] },
  { id: 3, text: "In the face of benefits, there are no eternal enemies or friends.", author: "Fang Yuan", source: "Reverend Insanity", category: "wisdom", contexts: ["daily"] },
  { id: 4, text: "Knowledge is power, and power is everything!", author: "Leylin Farlier", source: "Warlock of the Magus World", category: "wisdom", contexts: ["questComplete"] },
  { id: 5, text: "The strong do as they please, while the weak suffer what they must.", author: "Leylin Farlier", source: "Warlock of the Magus World", category: "power", contexts: ["daily"] },
  { id: 6, text: "There's no such thing as a free lunch in this world.", author: "Leylin Farlier", source: "Warlock of the Magus World", category: "wisdom", contexts: ["daily"] },
  { id: 7, text: "Strength is the only truth in this world.", author: "Fang Yuan", source: "Reverend Insanity", category: "power", contexts: ["levelUp"] },
  { id: 8, text: "Only those who are willing to sacrifice can truly gain power.", author: "Fang Yuan", source: "Reverend Insanity", category: "discipline", contexts: ["streakMilestone"] },
  { id: 9, text: "Weakness is a sin.", author: "Leylin Farlier", source: "Warlock of the Magus World", category: "power", contexts: ["daily"] },
  { id: 10, text: "Power is a means, not an end.", author: "Leylin Farlier", source: "Warlock of the Magus World", category: "wisdom", contexts: ["levelUp"] },
  { id: 11, text: "Survival is for the fittest, everything else is an illusion.", author: "Fang Yuan", source: "Reverend Insanity", category: "power", contexts: ["daily"] },
  { id: 12, text: "Morality is a tool used by the weak to bind the strong.", author: "Fang Yuan", source: "Reverend Insanity", category: "wisdom", contexts: ["daily"] },
  { id: 13, text: "In a world of cultivation, only absolute power can guarantee freedom.", author: "Leylin Farlier", source: "Warlock of the Magus World", category: "power", contexts: ["achievementUnlocked"] },
  { id: 14, text: "The path to greatness is paved with the bones of those who couldn't walk it.", author: "Fang Yuan", source: "Reverend Insanity", category: "perseverance", contexts: ["streakMilestone"] },
  { id: 15, text: "He who controls resources controls destiny.", author: "Leylin Farlier", source: "Warlock of the Magus World", category: "power", contexts: ["daily"] },
  { id: 16, text: "Only by controlling everything can one be free of fate.", author: "Fang Yuan", source: "Reverend Insanity", category: "power", contexts: ["levelUp"] },
  { id: 17, text: "Cunning is a weapon more powerful than any blade.", author: "Leylin Farlier", source: "Warlock of the Magus World", category: "wisdom", contexts: ["questComplete"] },
  { id: 18, text: "True immortality is achieved through power, not time.", author: "Fang Yuan", source: "Reverend Insanity", category: "power", contexts: ["achievementUnlocked"] },
  { id: 19, text: "The weak fall, the strong rise. Such is the way of the world.", author: "Leylin Farlier", source: "Warlock of the Magus World", category: "power", contexts: ["daily"] },
  { id: 20, text: "Fear is the currency of control.", author: "Fang Yuan", source: "Reverend Insanity", category: "power", contexts: ["daily"] },
  { id: 21, text: "Trust is a luxury only fools can afford.", author: "Leylin Farlier", source: "Warlock of the Magus World", category: "wisdom", contexts: ["daily"] },
  { id: 22, text: "Victory goes to the one who dares to take risks.", author: "Fang Yuan", source: "Reverend Insanity", category: "growth", contexts: ["questComplete"] },
  { id: 23, text: "In the end, strength is the only thing that matters.", author: "Fang Yuan", source: "Reverend Insanity", category: "power", contexts: ["levelUp"] },
  { id: 24, text: "A mind without ambition is a body without a soul.", author: "Leylin Farlier", source: "Warlock of the Magus World", category: "growth", contexts: ["daily"] },
  { id: 25, text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson", source: "Personal Development", category: "perseverance", contexts: ["streakMilestone"] },
  { id: 26, text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln", source: "Leadership Wisdom", category: "discipline", contexts: ["streakMilestone"] },
  { id: 27, text: "He who conquers himself is the mightiest warrior.", author: "Lao Tzu", source: "Tao Te Ching", category: "willpower", contexts: ["streakMilestone"] },
  { id: 28, text: "A smooth sea never made a skilled sailor.", author: "Franklin D. Roosevelt", source: "Leadership Wisdom", category: "perseverance", contexts: ["streakMilestone"] },
  { id: 29, text: "The struggle you're in today is developing the strength you need for tomorrow.", author: "Robert Tew", source: "Personal Development", category: "perseverance", contexts: ["streakMilestone"] },
  { id: 30, text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson", source: "Personal Development", category: "perseverance", contexts: ["streakMilestone"] },
  { id: 31, text: "A time comes when you need to stop waiting for the man you want to become and start being the man you want to be.", author: "Unknown", source: "Personal Development Wisdom", category: "growth", contexts: ["daily"] },
  { id: 32, text: "The longer you wait to do something you should do now, the greater the odds that you will never actually do it.", author: "Unknown", source: "The Law of Diminishing Intent", category: "discipline", contexts: ["questComplete", "daily"] },
  { id: 33, text: "You cannot change your destination overnight, but you can change your direction overnight.", author: "Unknown", source: "Personal Development Wisdom", category: "growth", contexts: ["daily", "streakMilestone"] },
  { id: 34, text: "The first step toward change is awareness. The second step is acceptance.", author: "Unknown", source: "Personal Development Wisdom", category: "wisdom", contexts: ["daily"] },
  { id: 35, text: "You cannot win if you do not begin! The people who get ahead in the world are the ones who look for the circumstances they want, and if they can't find them, they make them.", author: "Unknown", source: "Personal Development Wisdom", category: "power", contexts: ["questComplete", "levelUp"] },
  { id: 36, text: "Your vision will become clear only when you look into your heart. Who looks outside, dreams. Who looks inside, awakens.", author: "Carl Jung", source: "Modern Psychology", category: "wisdom", contexts: ["daily"] },
  { id: 37, text: "If you put a small value on yourself, rest assured the world will not raise the price.", author: "Unknown", source: "Personal Development Wisdom", category: "growth", contexts: ["daily"] },
  { id: 38, text: "When a man has put a limit on what he will do, he has put a limit on what he can do.", author: "Unknown", source: "Personal Development Wisdom", category: "perseverance", contexts: ["daily", "levelUp"] },
  { id: 39, text: "You will never change your life until you change something you do daily.", author: "John Maxwell", source: "Today Matters", category: "discipline", contexts: ["daily", "streakMilestone"] },
  { id: 40, text: "Once you learn to quit it becomes a habit.", author: "Vince Lombardi", source: "Leadership Wisdom", category: "perseverance", contexts: ["daily"] },
  { id: 41, text: "Life begins at the end of your comfort zone.", author: "Neale Donald Walsch", source: "Conversations with God", category: "growth", contexts: ["levelUp", "daily"] },
  { id: 42, text: "Facing difficulties is inevitable. Learning from them is optional.", author: "Unknown", source: "Life Wisdom", category: "wisdom", contexts: ["daily"] },
  { id: 43, text: "Success in life comes not from holding a good hand, but in playing a poor hand well.", author: "Unknown", source: "Life Wisdom", category: "wisdom", contexts: ["questComplete", "daily"] },
  { id: 44, text: "If you go to work on your goals, your goals will go to work on you.", author: "Jim Rohn", source: "Personal Development", category: "growth", contexts: ["streakMilestone", "daily"] },
  { id: 45, text: "The secret of your success is found in your daily routine.", author: "John Maxwell", source: "Today Matters", category: "discipline", contexts: ["daily"] },
  { id: 46, text: "You only live once. But if you work it right, once is enough.", author: "Unknown", source: "Life Wisdom", category: "growth", contexts: ["daily"] },
  { id: 47, text: "If you don't design your own life plan, chances are you'll fall into someone else's plan.", author: "Jim Rohn", source: "Personal Development", category: "wisdom", contexts: ["daily"] },
  { id: 48, text: "It's never too late to be what you might have been.", author: "George Eliot", source: "Literature", category: "growth", contexts: ["daily", "levelUp"] },
  { id: 49, text: "God's gift to us: potential. Our gift to God: developing it.", author: "Unknown", source: "Faith Reflections", category: "faith", contexts: ["daily"] },
  { id: 50, text: "Habit is the daily battleground of character.", author: "Unknown", source: "Character Development", category: "discipline", contexts: ["daily", "streakMilestone"] },
  { id: 51, text: "There is no finish line.", author: "Unknown", source: "Motivation", category: "perseverance", contexts: ["daily"] },
  { id: 52, text: "The potential that exists within us is limitless and largely untapped… when you think of limits, you create them.", author: "Unknown", source: "Personal Growth", category: "growth", contexts: ["levelUp", "daily"] },
  { id: 53, text: "The cure for boredom is curiosity. There is no cure for curiosity.", author: "Dorothy Parker", source: "Literature", category: "wisdom", contexts: ["daily"] },
  { id: 54, text: "I am always doing that which I cannot do, in order to learn how to do it.", author: "Vincent van Gogh", source: "Art & Creativity", category: "growth", contexts: ["questComplete", "daily"] },
  { id: 55, text: "Man's mind, once stretched by a new idea, never regains its original dimensions.", author: "Oliver Wendell Holmes Jr.", source: "Legal Wisdom", category: "wisdom", contexts: ["daily"] },
  { id: 56, text: "The greatest gift you can give to someone is your own personal development.", author: "Jim Rohn", source: "Personal Development", category: "growth", contexts: ["daily"] },
  { id: 57, text: "Wisdom is the lost property of the believer.", author: "Prophet Muhammad (saw)", source: "Hadith", category: "faith", contexts: ["daily"] },
  { id: 58, text: "Today is the beginning of the rest of your life.", author: "Unknown", source: "Life Wisdom", category: "growth", contexts: ["daily"] },
  { id: 59, text: "Opportunity favors those who are prepared.", author: "Louis Pasteur", source: "Science", category: "discipline", contexts: ["daily", "questComplete"] },
  { id: 60, text: "Greatness is a choice.", author: "Unknown", source: "Motivation", category: "perseverance", contexts: ["levelUp", "daily"] },
  { id: 61, text: "My mercy prevails over my wrath.", author: "Allah", source: "Hadith Qudsi", category: "faith", contexts: ["daily"] },
  { id: 62, text: "I am as My servant thinks I am. I am with him when he makes mention of Me.", author: "Allah", source: "Hadith Qudsi", category: "faith", contexts: ["daily"] },
  { id: 63, text: "Spend (on charity), O son of Adam, and I shall spend on you.", author: "Allah", source: "Hadith Qudsi", category: "faith", contexts: ["daily"] },
  { id: 64, text: "If My servant likes to meet Me, I like to meet him.", author: "Allah", source: "Hadith Qudsi", category: "faith", contexts: ["daily"] },
  { id: 65, text: "I have prepared for My righteous servants what no eye has seen and no ear has heard.", author: "Allah", source: "Hadith Qudsi", category: "faith", contexts: ["achievementUnlocked", "daily"] },
  { id: 66, text: "We will not change the condition of the people until they change that which is within themselves.", author: "Allah", source: "Qur'an 13:11", category: "faith", contexts: ["daily", "streakMilestone"] },
  { id: 67, text: "Allah has a plan for you, don't worry.", author: "Unknown", source: "Faith Reflection", category: "faith", contexts: ["daily"] },
  { id: 68, text: "Prostrate and get closer to Allah, That Is Your Purpose.", author: "Unknown", source: "Spiritual Wisdom", category: "faith", contexts: ["daily"] },
  { id: 69, text: "When your Salah is straight, your life is straight.", author: "Unknown", source: "Islamic Wisdom", category: "faith", contexts: ["daily"] },
  { id: 70, text: "Whoever is protected from his natural greed—it is they who are successful.", author: "Allah", source: "Qur'an 59:9", category: "faith", contexts: ["achievementUnlocked", "daily"] },
  { id: 71, text: "If you have gained the love of Allah, what have you truly lost? Nothing.", author: "Unknown", source: "Faith Reflection", category: "faith", contexts: ["daily"] },
  { id: 72, text: "I wonder for the one who is certain that there is death, and yet laughs.", author: "Prophet Dawud (David)", source: "Zabura (Psalms)", category: "faith", contexts: ["daily"] },
  { id: 73, text: "I wonder for the one who is certain that there is Hellfire and its chastisement, and yet sleeps without fleeing from it.", author: "Prophet Dawud (David)", source: "Zabura (Psalms)", category: "faith", contexts: ["daily"] },
  { id: 74, text: "I wonder for the one who is certain that there is Paradise and its pleasure, and yet sleeps without seeking it.", author: "Prophet Dawud (David)", source: "Zabura (Psalms)", category: "faith", contexts: ["daily"] },
  { id: 75, text: "I wonder for the one who is certain about this world and its transience, and yet trusts in it implicitly.", author: "Prophet Dawud (David)", source: "Zabura (Psalms)", category: "faith", contexts: ["daily"] },
  { id: 82, text: "The strong and weak would never be on equal footing; the difference was as wide as heaven and earth.", author: "Wang Lin", source: "Renegade Immortal", category: "power", contexts: ["daily"] },
  { id: 83, text: "If you are weak, the other person is strong. If you are strong, the other person is weak.", author: "Wang Lin", source: "Renegade Immortal", category: "wisdom", contexts: ["daily"] },
  { id: 84, text: "Strike the iron while it's hot, cultivate when you are still young...", author: "Li Qiye", source: "Emperor's Domination", category: "growth", contexts: ["daily", "levelUp"] },
  { id: 85, text: "The reason why the strong are strong, is exactly because they are able to endure what normal people aren't able to.", author: "Jasmine", source: "Cultivation Wisdom", category: "perseverance", contexts: ["streakMilestone", "daily"] },
  { id: 86, text: "Man, no matter which world they lived in, conquer; conquer the enemy and conquer themselves.", author: "Unknown", source: "Cultivation Wisdom", category: "power", contexts: ["levelUp", "daily"] },
  { id: 87, text: "No matter which world, how could one gain anything without paying a price?", author: "Unknown", source: "Cultivation Wisdom", category: "wisdom", contexts: ["daily"] },
  { id: 88, text: "Stop being satisfied with such meagre progress.", author: "Unknown", source: "Personal Growth", category: "discipline", contexts: ["daily"] },
  { id: 89, text: "As long as you haven't fallen yet, there is still a chance to turn everything around.", author: "Unknown", source: "Motivation", category: "perseverance", contexts: ["daily"] },
  { id: 106, text: "Challenge your limits again and again and again.", author: "Unknown", source: "Cultivation Wisdom", category: "perseverance", contexts: ["daily", "questComplete"] },
  { id: 107, text: "Pain of Discipline OR Pain of Regret.", author: "Unknown", source: "Life Wisdom", category: "discipline", contexts: ["daily", "streakMilestone"] },
  { id: 108, text: "PRIORITIES STRAIGHT.", author: "Unknown", source: "Personal Development", category: "discipline", contexts: ["daily"] },
  { id: 109, text: "Stay calm under pressure.", author: "Unknown", source: "Life Wisdom", category: "perseverance", contexts: ["daily"] },
  { id: 110, text: "BE PROACTIVE IN YOUR AFFAIRS.", author: "Unknown", source: "Personal Development", category: "discipline", contexts: ["daily"] },
  { id: 111, text: "My soul calls me to evil.", author: "Prophet Yusuf (AS)", source: "Qur'an 12:53", category: "faith", contexts: ["daily"] },
  { id: 112, text: "Self-confidence was the most basic requirement of a truly strong expert.", author: "Unknown", source: "Cultivation Wisdom", category: "growth", contexts: ["daily", "levelUp"] },
  { id: 113, text: "Knowledge is the Noor of Allah to His Beloved", author: "Unknown", source: "Islamic Wisdom", category: "faith", contexts: ["daily"] },
  { id: 157, text: "When a man makes a choice, he should stick to it till the end.", author: "Unknown", source: "Cultivation Wisdom", category: "perseverance", contexts: ["daily", "questComplete"] },
  { id: 158, text: "No matter how big of a genius you are, you will only be able to grow under constant competition.", author: "Unknown", source: "Cultivation Wisdom", category: "growth", contexts: ["daily"] },
  { id: 159, text: "This is life after all, hard work does not mean results, nor success.", author: "Unknown", source: "Life Wisdom", category: "perseverance", contexts: ["daily", "streakMilestone"] },
  { id: 160, text: "Making mistakes was a normal thing... After making a mistake, realizing the mistake and correcting it was the behavior of an outstanding person!", author: "Unknown", source: "Cultivation Wisdom", category: "growth", contexts: ["daily"] },
  { id: 161, text: "Before obtaining the greatest strength at the apex, do not plan to slow your footsteps.", author: "Unknown", source: "Cultivation Wisdom", category: "discipline", contexts: ["daily", "levelUp"] },
  { id: 170, text: "As long as you haven't fallen, there is a chance to turn everything around.", author: "Unknown", source: "Cultivation Wisdom", category: "perseverance", contexts: ["daily", "streakMilestone"] },
  { id: 171, text: "Everything is merely an illusion.", author: "Unknown", source: "Spiritual Wisdom", category: "wisdom", contexts: ["daily"] },
  { id: 172, text: "Collective seemingly insignificant choices lead to success.", author: "Unknown", source: "Life Wisdom", category: "growth", contexts: ["daily"] },
  { id: 177, text: "People are anxious to improve their circumstances but are unwilling to improve themselves.", author: "Unknown", source: "Life Wisdom", category: "wisdom", contexts: ["daily"] },
  { id: 178, text: "There is no absolutely desperate situation in this world, there are only people who despair.", author: "Unknown", source: "Cultivation Wisdom", category: "perseverance", contexts: ["daily", "streakMilestone"] },
  { id: 179, text: "Those who produce rather than consume in their free time", author: "Unknown", source: "Motivation", category: "discipline", contexts: ["daily"] },
  { id: 180, text: "Be so strong even the demons are afraid of u.", author: "Unknown", source: "Cultivation Wisdom", category: "power", contexts: ["daily"] },
  { id: 185, text: "Only the foolish think they have all the time in the world.", author: "Unknown", source: "Cultivation Wisdom", category: "wisdom", contexts: ["daily"] },
];

const QUOTE_CATEGORIES = { POWER: "power", WISDOM: "wisdom", DISCIPLINE: "discipline", GROWTH: "growth", PERSEVERANCE: "perseverance", FAITH: "faith" };
const QUOTE_CONTEXTS = { QUEST_COMPLETE: "questComplete", LEVEL_UP: "levelUp", STREAK_MILESTONE: "streakMilestone", ACHIEVEMENT_UNLOCKED: "achievementUnlocked", DAILY: "daily" };

const motivationalQuotesSystem = {
  categories: QUOTE_CATEGORIES,
  contexts: QUOTE_CONTEXTS,
  quotes: QUOTES_DATA,

  getRandomQuote() {
    return this.quotes[Math.floor(Math.random() * this.quotes.length)];
  },

  getQuoteByContext(context) {
    const matches = this.quotes.filter(q => q.contexts.includes(context));
    return matches.length > 0 ? matches[Math.floor(Math.random() * matches.length)] : this.getRandomQuote();
  },

  getQuoteByCategory(category) {
    const matches = this.quotes.filter(q => q.category === category);
    return matches.length > 0 ? matches[Math.floor(Math.random() * matches.length)] : this.getRandomQuote();
  },

  getFavoriteQuotes() {
    return db.favoriteQuotes.toArray().then(favorites =>
      this.quotes.filter(q => favorites.some(f => f.quoteId === q.id))
    );
  },

  toggleFavorite(quoteId) {
    return db.favoriteQuotes.where('quoteId').equals(quoteId).first().then(existing => {
      if (existing) {
        return db.favoriteQuotes.delete(existing.id).then(() => false);
      }
      return db.favoriteQuotes.add({ quoteId, dateAdded: new Date() }).then(() => true);
    });
  }
};
