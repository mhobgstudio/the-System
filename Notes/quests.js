// ======================================================================
// QUEST SUGGESTIONS — Browse and add to app.js rawDefaultQuests
// ======================================================================
// Format: { title, difficulty:"Easy"|"Medium"|"Hard", xp:Number,
//           stat:"strength"|"agility"|"intelligence"|"stamina"|
//                 "willpower"|"discipline",
//           category:"personal"|"learning"|"health"|"work"|"physical"|
//                     "cultivation"|"social"|"spiritual" }
//
// youtube: links are suggestions — search the video ID on YouTube
// to find the lecture/clip, then add to the quest object as:
// youtube:"https://youtube.com/shorts/VIDEO_ID"
//
// tiktok: links are clickable hyperlinks — full URL to the video or channel.
// tiktok: https://vm.tiktok.com/SHORT_CODE  (shortened, no title)
// tiktok: https://www.tiktok.com/@user/video/ID  (direct link)
// tiktok: https://www.tiktok.com/@channel  (channel reference)
//
// All links sourced from Telegram export messages.html (Jul-Aug 2024)
// 315 total links (YouTube) + 361 TikTok links analyzed
// YouTube: 184 paired with titles, ~80 relevant mapped
// TikTok: 337 vm.tiktok.com + 24 direct links; channels inferred
// ======================================================================

// ====================================================================
// WISDOM — Reflection & Self-Knowledge
// ====================================================================
// Easy
// { title: "Read Quran translation for 5 mins with reflection", difficulty: "Easy", xp: 300, stat: "intelligence", category: "spiritual" },
// { title: "Journal one insight from today", difficulty: "Easy", xp: 200, stat: "intelligence", category: "personal" },
// { title: "Practice 10 mins of silent reflection", difficulty: "Easy", xp: 250, stat: "intelligence", category: "personal" },
//   youtube: shorts/XgoU5uB7m9A  — "This world is nothing, but a delusion!" [Healing For The Hearts]
// { title: "Observe nature for 10 mins — find one sign", difficulty: "Easy", xp: 200, stat: "intelligence", category: "personal" },
// { title: "Identify a lesson learned from a past mistake", difficulty: "Easy", xp: 200, stat: "intelligence", category: "personal" },
//   youtube: shorts/K1ROAnt4mQA  — "This was one of my hardest learned life lessons" [Derik Fay]
// { title: "Practice simplicity in one decision today", difficulty: "Easy", xp: 200, stat: "willpower", category: "personal" },
// { title: "Write down 3 things you're curious about today", difficulty: "Easy", xp: 150, stat: "intelligence", category: "learning" },
// { title: "Know yourself — identify one blind spot today", difficulty: "Easy", xp: 300, stat: "intelligence", category: "personal" },
//   youtube: shorts/qnlPXCmxn9E  — "The Best Advice You Will Ever Receive..." [YoungWealth Club]
// { title: "Listen more than you speak today", difficulty: "Easy", xp: 250, stat: "discipline", category: "personal" },
//   youtube: shorts/SbF1sQhK-k4  — "2 simple things advice" #yasirqadhi [Reminders From Allah]
//   tiktok: https://www.tiktok.com/@taophilosophy — Philosophical/spiritual reflections (4 links)
// { title: "Spend 5 mins observing the sky/clouds", difficulty: "Easy", xp: 150, stat: "stamina", category: "health" },
// Medium
// { title: "Reflect on the purpose of your existence for 15 mins", difficulty: "Medium", xp: 600, stat: "intelligence", category: "spiritual" },
//   youtube: shorts/Nfpn2C-4bLE  — "The One Desire I Can't Silence — To Meet Allah" - Hisham Abu Yusuf
//   youtube: short/ZpuoGka7KDk  — "Watch this and take notes" [Victory Venture]
// { title: "Study one of the 99 Names deeply", difficulty: "Medium", xp: 500, stat: "intelligence", category: "spiritual" },
// { title: "Draw wisdom from a failure — write the lesson", difficulty: "Medium", xp: 550, stat: "intelligence", category: "personal" },
//   youtube: shorts/gTN8jDHOXdU  — "The Meaning Of Failure" [HITShreds]
//   youtube: shorts/ExK5ItEQB1k  — "The Hardest Lesson You'll Learn In Life" [Akbar Entertainment TV]
// Hard
// { title: "Study a full Surah with 3 different Tafseer sources", difficulty: "Hard", xp: 1500, stat: "intelligence", category: "spiritual" },
//   youtube: watch?v=odr9Q_OuJQQ  — "Bayquniyyah — Shaykh Sayyid Samdani" (Hadith terminology)
// { title: "Write a 500-word reflection on life's purpose", difficulty: "Hard", xp: 2000, stat: "intelligence", category: "personal" },
//   youtube: shorts/tsR5dvTi1qU  — "This world is nothing, but a delusion!" [Healing For The Hearts]
//   youtube: shorts/dKegzBVrQu8  — "When death comes knocking..." [SuccessfullyOnTop]

// ====================================================================
// GROWTH — Continuous Improvement & Learning
// ====================================================================
// Easy
// { title: "Learn one new thing outside your comfort zone", difficulty: "Easy", xp: 250, stat: "intelligence", category: "learning" },
//   youtube: shorts/rJ72rTiW_oE  — (Fang Yuan quote / novel — skip, fiction)
// { title: "Reframe a failure as a learning opportunity", difficulty: "Easy", xp: 200, stat: "discipline", category: "personal" },
//   youtube: shorts/gTN8jDHOXdU  — "The Meaning Of Failure" [HITShreds]
// { title: "Practice one skill for 20 mins", difficulty: "Easy", xp: 200, stat: "discipline", category: "learning" },
//   youtube: shorts/9RBablxdddg  — "The rule of 100hours — the journey to mastering your craft" [Newton King]
// { title: "Replace 'I can't' with 'I can't yet'", difficulty: "Easy", xp: 150, stat: "willpower", category: "personal" },
// { title: "Do one thing that scares you a little", difficulty: "Easy", xp: 300, stat: "willpower", category: "personal" },
//   youtube: shorts/bmlgKIwyn18  — "Run in the direction of your fear — Shaykh Belal Assad" [OnePath Network]
// { title: "Watch a 10-min educational video on a new subject", difficulty: "Easy", xp: 200, stat: "intelligence", category: "learning" },
// { title: "Write down one area where you can improve today", difficulty: "Easy", xp: 150, stat: "intelligence", category: "personal" },
// { title: "Practice a new word in Arabic or Yoruba", difficulty: "Easy", xp: 200, stat: "intelligence", category: "learning" },
//   youtube: (search "Become An Arabic Master" — Arabic Mastery Academy channel)
// { title: "Ask for feedback on something you did today", difficulty: "Easy", xp: 200, stat: "discipline", category: "personal" },
// { title: "Read for 15 mins on a topic you know nothing about", difficulty: "Easy", xp: 250, stat: "intelligence", category: "learning" },
// { title: "Do something for 5 mins that you're bad at", difficulty: "Easy", xp: 250, stat: "willpower", category: "personal" },
// { title: "Celebrate someone else's success genuinely", difficulty: "Easy", xp: 200, stat: "discipline", category: "social" },
// Medium
// { title: "Complete a 7-day learning streak on one topic", difficulty: "Medium", xp: 700, stat: "intelligence", category: "learning" },
// { title: "Read 20 pages of a self-development book", difficulty: "Medium", xp: 500, stat: "intelligence", category: "learning" },
//   youtube: shorts/unom3_-SyHk  — "Consistency doesn't guarantee Success — Chris Williamson" [Inspire Mindset]
//   tiktok: https://www.tiktok.com/@greateryouu — Self-improvement motivation (2 links)
// { title: "Take an online course module and pass its quiz", difficulty: "Medium", xp: 700, stat: "intelligence", category: "learning" },
// { title: "Teach someone something you learned recently", difficulty: "Medium", xp: 600, stat: "intelligence", category: "social" },
//   youtube: shorts/YgGrM8ymi_4  — "Live up to your name... — Akhi Ayman" [Faris Yassin]
// { title: "Identify and break one limiting belief", difficulty: "Medium", xp: 700, stat: "willpower", category: "personal" },
//   youtube: shorts/-dhYQdC-yV0  — "Become More Dangerous — Turn Your Pain Into Power" [Success Motivex]
// { title: "Learn from a criticism without getting defensive", difficulty: "Medium", xp: 600, stat: "willpower", category: "personal" },
// { title: "Complete a small project using a new skill", difficulty: "Medium", xp: 800, stat: "intelligence", category: "work" },
// { title: "Write a review of your progress over the last month", difficulty: "Medium", xp: 500, stat: "intelligence", category: "personal" },
//   youtube: shorts/Kj-ARSlDido  — "Fix your body. Fix your respect." [Soulcrush]
// Hard
// { title: "Master a completely new skill in 30 days", difficulty: "Hard", xp: 2500, stat: "intelligence", category: "learning" },
//   youtube: shorts/SoVAMFYPA0Y  — "MYRON GOLDEN: LASTING THROUGH THE LEARNING CURVE" [Elite Tribe]
//   youtube: shorts/7xenaODYgLY  — "How to Double Your Time Without Stressing Out" [GetMotivationAlone]
// { title: "Complete a 30-day growth challenge", difficulty: "Hard", xp: 3000, stat: "intelligence", category: "personal" },
// { title: "Design and execute a 30-day learning plan independently", difficulty: "Hard", xp: 2500, stat: "intelligence", category: "learning" },
// { title: "Conduct a full personal effectiveness audit", difficulty: "Hard", xp: 2200, stat: "discipline", category: "cultivation" },

// ====================================================================
// PERSEVERANCE — Grit & Resilience
// ====================================================================
// Easy
// { title: "Finish one task you were about to give up on", difficulty: "Easy", xp: 300, stat: "willpower", category: "personal" },
//   youtube: shorts/LnnXG4efZ7g  — "IT DOESN'T MATTER..." [SuccessfullyOnTop]
// { title: "Push through 5 more minutes of a difficult task", difficulty: "Easy", xp: 250, stat: "willpower", category: "personal" },
//   youtube: shorts/W55bsGFbskM  — "Teach yourself to do things you don't want to do — Andrew Huberman"
// { title: "Complete one small thing despite not feeling like it", difficulty: "Easy", xp: 250, stat: "discipline", category: "personal" },
// { title: "Write down 'Why I won't quit'", difficulty: "Easy", xp: 200, stat: "willpower", category: "personal" },
// { title: "Say 'I will try again' after a failure today", difficulty: "Easy", xp: 200, stat: "willpower", category: "personal" },
// { title: "Respond to a setback with 'I'll try again tomorrow'", difficulty: "Easy", xp: 200, stat: "willpower", category: "personal" },
// { title: "Acknowledge a difficulty, then take one step anyway", difficulty: "Easy", xp: 200, stat: "willpower", category: "personal" },
// { title: "Do a task that's difficult for 10 mins without stopping", difficulty: "Easy", xp: 250, stat: "stamina", category: "personal" },
//   youtube: shorts/0MwboizoUWM  — "Mentality is the key. Discipline" [Deltasmotivation]
// { title: "Read one story of someone who overcame adversity", difficulty: "Easy", xp: 200, stat: "intelligence", category: "learning" },
// Medium
// { title: "Complete a full task despite wanting to quit halfway", difficulty: "Medium", xp: 700, stat: "willpower", category: "personal" },
//   youtube: shorts/pzrxDslo65o  — "Tell Yourself the Truth — Jocko Willink" [Mindset Chapter]
// { title: "Finish a 7-day streak of a difficult habit", difficulty: "Medium", xp: 800, stat: "discipline", category: "personal" },
//   youtube: shorts/rGJt5NzLVc4  — "This One Mindset Changed My Life Forever — Jim Rohn" [Grind Mindset]
// { title: "Do something uncomfortable every day for a week", difficulty: "Medium", xp: 800, stat: "willpower", category: "personal" },
//   youtube: shorts/Kj-ARSlDido  — "Fix your body. Fix your respect." [Soulcrush]
// { title: "Wake up early and work on your hardest task first", difficulty: "Medium", xp: 600, stat: "stamina", category: "health" },
//   youtube: shorts/8_SvwBgrC6I  — "What Is Success? — Jim Rohn" [Motivation]
// { title: "Persist through a difficult conversation without backing down", difficulty: "Medium", xp: 700, stat: "willpower", category: "social" },
// { title: "Complete a workout when you really didn't want to", difficulty: "Medium", xp: 600, stat: "strength", category: "health" },
// Hard
// { title: "Complete a 30-day grit challenge", difficulty: "Hard", xp: 3500, stat: "willpower", category: "personal" },
//   youtube: shorts/gIm0IIITi-Y  — "The Great Lie About Life" [Motivational XIX]
// { title: "Achieve a goal that took 3+ months of consistent effort", difficulty: "Hard", xp: 5000, stat: "willpower", category: "personal" },
// { title: "Complete a challenge that pushes you to your limit", difficulty: "Hard", xp: 4000, stat: "stamina", category: "personal" },

// ====================================================================
// DISCIPLINE — Self-Mastery & Daily Habits
// ====================================================================
// Easy
// { title: "Do the hardest thing on your list first", difficulty: "Easy", xp: 300, stat: "discipline", category: "personal" },
//   youtube: shorts/PR7AY9HdKPs  — "it's between you and you. — DamiBTS" [MotivatedMind]
// { title: "Resist one unnecessary impulse today", difficulty: "Easy", xp: 250, stat: "willpower", category: "personal" },
// { title: "Complete one daily non-negotiable habit", difficulty: "Easy", xp: 200, stat: "discipline", category: "personal" },
//   youtube: shorts/3aZLLZl3utg  — "Choose to become unstoppable — Brian Tracy" [TheQuoteCollection]
// { title: "Practice a small act of self-denial", difficulty: "Easy", xp: 250, stat: "willpower", category: "personal" },
// { title: "Make your bed immediately after waking", difficulty: "Easy", xp: 150, stat: "discipline", category: "personal" },
// { title: "Choose what you need over what you want", difficulty: "Easy", xp: 250, stat: "willpower", category: "personal" },
// { title: "Complete a task without complaining about it", difficulty: "Easy", xp: 200, stat: "discipline", category: "personal" },
// { title: "Control your tongue — speak only good or stay silent", difficulty: "Easy", xp: 250, stat: "discipline", category: "personal" },
//   youtube: shorts/SbF1sQhK-k4  — "2 simple things advice" #yasirqadhi [Reminders From Allah]
// { title: "Wake up at the same time as planned", difficulty: "Easy", xp: 200, stat: "discipline", category: "health" },
// { title: "Avoid distractions for 25 mins (Pomodoro)", difficulty: "Easy", xp: 250, stat: "discipline", category: "work" },
// { title: "Practice 'Jihad of silence' for 1 hour", difficulty: "Easy", xp: 300, stat: "willpower", category: "spiritual" },
// Medium
// { title: "Complete a full 7-day discipline streak", difficulty: "Medium", xp: 800, stat: "discipline", category: "personal" },
//   youtube: shorts/SJV1M6mwySA  — "Jim Rohn Motivational Speech" [SumitMaxOut]
// { title: "Wake up at Fajr every day for 7 days", difficulty: "Medium", xp: 900, stat: "discipline", category: "spiritual" },
//   youtube: shorts/Whx2YVXfNks  — "When you become regular with your 5 daily prayers" -mufti menk [InspireSphere]
// { title: "Fast from one bad habit for 7 days", difficulty: "Medium", xp: 800, stat: "willpower", category: "personal" },
//   youtube: shorts/zsJ4pEjrVmE  — "Your life... is what your thoughts make it" [amrouz]
// { title: "Complete morning routine without phone for 7 days", difficulty: "Medium", xp: 700, stat: "discipline", category: "personal" },
//   youtube: shorts/RvFjwZT4MsY  — "Beware of DEVIL & ANGEL — Jim Rohn" [Better Life8]
// { title: "Practice emotional self-control in a triggering situation", difficulty: "Medium", xp: 700, stat: "willpower", category: "personal" },
// { title: "Do a digital detox for 24 hours", difficulty: "Medium", xp: 800, stat: "discipline", category: "personal" },
//   youtube: shorts/1D7rDyfztIg  — "Watch THIS if you post on social media... - mufti menk" [SuccessfullyOnTop]
// { title: "Say no to something you want but don't need", difficulty: "Medium", xp: 600, stat: "willpower", category: "personal" },
// Hard
// { title: "Complete 30-day discipline challenge", difficulty: "Hard", xp: 4000, stat: "discipline", category: "personal" },
//   youtube: shorts/rqFCZMfSXXc  — "YOUR SELF-TALK SHAPES YOUR WORLD. REPROGRAM YOUR REALITY" [EVOLVITA]
// { title: "Master a difficult skill through daily practice for 30 days", difficulty: "Hard", xp: 3000, stat: "discipline", category: "learning" },
//   youtube: shorts/9RBablxdddg  — "The rule of 100hours — mastering your craft" [Newton King]
// { title: "Complete a 30-day no-complaint challenge", difficulty: "Hard", xp: 3500, stat: "willpower", category: "personal" },

// ====================================================================
// POWER — Inner Strength & Strategy
// ====================================================================
// Easy
// { title: "Stand up for what's right in a small matter", difficulty: "Easy", xp: 300, stat: "willpower", category: "personal" },
// { title: "Speak truthfully even when it's easier not to", difficulty: "Easy", xp: 300, stat: "discipline", category: "personal" },
// { title: "Do the right thing when no one is watching", difficulty: "Easy", xp: 300, stat: "discipline", category: "personal" },
// { title: "Practice adaptability", difficulty: "Easy", xp: 250, stat: "agility", category: "personal" },
// { title: "Identify one thing you can control and take action", difficulty: "Easy", xp: 250, stat: "willpower", category: "personal" },
// { title: "Practice stillness and silence for 5 mins", difficulty: "Easy", xp: 200, stat: "willpower", category: "personal" },
// { title: "Make a decision decisively without overthinking", difficulty: "Easy", xp: 250, stat: "willpower", category: "personal" },
// { title: "Refuse to take offense today", difficulty: "Easy", xp: 250, stat: "willpower", category: "personal" },
// { title: "Help someone with no expectation of return", difficulty: "Easy", xp: 250, stat: "willpower", category: "social" },
// Medium
// { title: "Master one area of your craft deeply", difficulty: "Medium", xp: 700, stat: "intelligence", category: "work" },
//   youtube: shorts/9RBablxdddg  — "The rule of 100hours — the journey to mastering your craft" [Newton King]
// { title: "Practice the art of strategic patience", difficulty: "Medium", xp: 600, stat: "willpower", category: "personal" },
//   youtube: shorts/bGIw4ztC1rg  — "We Have Very Modest Ambitions — Hisham Abu Yusuf" [Hisham Abu Yusuf]
// { title: "Stand firm on a principle despite pressure", difficulty: "Medium", xp: 700, stat: "willpower", category: "personal" },
//   youtube: shorts/lscIoWK_sFU  — "Beware the Double-Faced: Prophet Muhammad's Warning!" [Verse Of Muhammad]
// { title: "Surround yourself with people who uplift you", difficulty: "Medium", xp: 600, stat: "discipline", category: "social" },
// { title: "Take responsibility for everything in your life", difficulty: "Medium", xp: 700, stat: "willpower", category: "personal" },
//   youtube: shorts/OLI7TWyLAyQ  — "When Calamity Strikes You" [Spread Deen Hub]
// { title: "Identify your 'why' and write it clearly", difficulty: "Medium", xp: 600, stat: "intelligence", category: "personal" },
//   youtube: shorts/rGJt5NzLVc4  — "This One Mindset Changed My Life Forever — Jim Rohn" [Grind Mindset]
// Hard
// { title: "Achieve one significant goal through pure willpower", difficulty: "Hard", xp: 5000, stat: "willpower", category: "personal" },
//   youtube: shorts/Kj-ARSlDido  — "Fix your body. Fix your respect." [Soulcrush]
// { title: "Mentor someone to achieve their goal", difficulty: "Hard", xp: 3000, stat: "willpower", category: "social" },
// { title: "Complete a challenge that tests both body and mind", difficulty: "Hard", xp: 3500, stat: "strength", category: "personal" },
//   youtube: shorts/RM9-QE7zYI0  — "Bro was the perfect human being" [HARDCORE MOTIVATION]

// ====================================================================
// FAITH & WORSHIP — Salah · Quran · Dhikr · Spirituality
// ====================================================================
// Easy
// { title: "Pray 5 daily salah on time", difficulty: "Easy", xp: 500, stat: "willpower", category: "spiritual", isPinned: true },
//   youtube: shorts/Whx2YVXfNks  — "When you become regular with your 5 daily prayers" -mufti menk [InspireSphere]
//   tiktok: https://www.tiktok.com/@ibadah_inspiration — Islamic worship reminders (2 links)
//   tiktok: https://www.tiktok.com/@_roadtoallah_ — Islamic motivation (4 links)
// { title: "Read Quran with meaning for 5 mins", difficulty: "Easy", xp: 300, stat: "intelligence", category: "spiritual" },
//   youtube: shorts/yuKwYYUAQD0  — "SURAT AL-AHZAB 35 — BY EGZON IBRAHIMI" [AL HAMED]
//   youtube: shorts/Tv5sJhx5aaY  — "Quran Beautiful Verses" [Dietitian Eman Fatima]
//   tiktok: https://www.tiktok.com/@the_quranpage — Quran verse posts (2 links)
// { title: "Make sincere Dua in sujood", difficulty: "Easy", xp: 250, stat: "willpower", category: "spiritual" },
//   youtube: shorts/5xM0bTbxD90  — "Can Dua Change the Qadr?" — Ustadh AbdulAziz Al-Haqqan [Garden of Ilm]
//   youtube: shorts/vstDBGo7jsg  — "Do this to get your duaa accepted" #assimalhakeem [Al-Firdaws]
// { title: "Complete 10 mins of quiet dhikr", difficulty: "Easy", xp: 300, stat: "willpower", category: "spiritual" },
//   youtube: shorts/FeZZCJUtROc  — "Istighfar is powerful" [The Muslim Vibe]
//   youtube: shorts/aHM41HiQ6fA  — "(Sahih Muslim) the one who offers Isha prayer..." [Islamic knowledge 1]
// { title: "Recite Ayat-ul-Kursi with reflection", difficulty: "Easy", xp: 250, stat: "intelligence", category: "spiritual" },
//   youtube: shorts/Dwi2PjiOgpQ  — "Unlock the Wisdom of Ayat al-Kursi" [Guidance Talks]
// { title: "Read one of the 99 Names and reflect on it", difficulty: "Easy", xp: 250, stat: "intelligence", category: "spiritual" },
//   youtube: shorts/AOjI4gxwN7w  — "The Power of Forgiveness in Family — Nouman Ali Khan" [THE SUNNAH CHANNEL]
// { title: "Make istighfar 100 times", difficulty: "Easy", xp: 200, stat: "willpower", category: "spiritual" },
//   youtube: shorts/FeZZCJUtROc  — "Istighfar is powerful" [The Muslim Vibe]
//   youtube: shorts/DMVOhwp90WE  — "Hadith on Daily Repentance" [MuslimMatters]
// { title: "Pray 2 rakats of salah with full khushu", difficulty: "Easy", xp: 300, stat: "willpower", category: "spiritual" },
// { title: "Read one page from Reminders file", difficulty: "Easy", xp: 200, stat: "intelligence", category: "spiritual" },
// { title: "Send salawat upon the Prophet (PBUH) 10 times", difficulty: "Easy", xp: 200, stat: "willpower", category: "spiritual" },
//   youtube: shorts/RGPutpWNseQ  — "Muhammad sallahu alehi wa sallam" [Mohamed]
// { title: "Make Dua for someone else secretly", difficulty: "Easy", xp: 200, stat: "willpower", category: "spiritual" },
//   youtube: shorts/4sS-KLrXQH8  — "Strive for These 5 Things" [Islamestic]
// { title: "Reflect on the creation of the heavens and earth", difficulty: "Easy", xp: 300, stat: "intelligence", category: "spiritual" },
// { title: "Read the meaning of Al-Fatihah deeply", difficulty: "Easy", xp: 250, stat: "intelligence", category: "spiritual" },
// { title: "Complete morning and evening adhkar", difficulty: "Easy", xp: 300, stat: "willpower", category: "spiritual", isPinned: true },
// { title: "Reflect on Quran 2:286 — Allah does not burden a soul", difficulty: "Easy", xp: 250, stat: "intelligence", category: "spiritual" },
//   youtube: shorts/gagU1-mUf2Q  — "Everything that happens in your life — Mufti Menk" [Deen Message]
//   youtube: shorts/tsR5dvTi1qU  — "This world is nothing, but a delusion!" [Healing For The Hearts]
//   tiktok: https://www.tiktok.com/@zenfis_ — Spiritual reminders (2 links)
//   tiktok: https://www.tiktok.com/@mindobserver1 — Islamic mindfulness content (2 links)
//   tiktok: https://www.tiktok.com/@a_soul_of_islam — Soulful Islamic reminders (2 links)
//   tiktok: https://www.tiktok.com/@allahstheone — Faith-centered content (2 links)
// { title: "Pray Tahajjud (night prayer)", difficulty: "Medium", xp: 600, stat: "willpower", category: "spiritual" },
//   youtube: shorts/RGPutpWNseQ  — (sending salawat)
// Medium
// { title: "Complete 30-day consistent Fajr prayer", difficulty: "Medium", xp: 1500, stat: "discipline", category: "spiritual" },
//   youtube: shorts/Whx2YVXfNks  — "When you become regular with your 5 daily prayers - mufti menk" [InspireSphere]
// { title: "Read and reflect on the 99 Names in 1 week", difficulty: "Medium", xp: 800, stat: "intelligence", category: "spiritual" },
//   youtube: shorts/H1y52_9sP7s  — "Allah Chose You Because You Have The Skills — Nouman Ali Khan" [Muslim Mindset]
// { title: "Learn the tafseer of one full surah", difficulty: "Medium", xp: 1000, stat: "intelligence", category: "spiritual" },
//   youtube: shorts/yuKwYYUAQD0  — "SURAT AL-AHZAB 35" [AL HAMED]
//   youtube: shorts/q-Mmo2yDvtw  — "The Holy Qur'an being lifted is a sign of the day of judgement" [Muhammad Qasims]
//   tiktok: https://www.tiktok.com/@oti_al_albani — Islamic teachings (Al-Albani, 2 links)
//   tiktok: https://www.tiktok.com/@akademiakmal — Islamic scholarship (2 links)
//   tiktok: https://www.tiktok.com/@ayyub2445 — Islamic content (4 links)
// { title: "Maintain Quran reading 1 page/day for 30 days", difficulty: "Medium", xp: 1500, stat: "discipline", category: "spiritual" },
// { title: "Make sincere tawbah (repentance) from a specific sin", difficulty: "Medium", xp: 700, stat: "willpower", category: "spiritual" },
//   youtube: shorts/DMVOhwp90WE  — "Hadith on Daily Repentance" [MuslimMatters]
//   youtube: shorts/xixE-yj8s6Q  — "Sins gone at Night" [Bukhari TV]
// { title: "Study the story of a prophet from the Quran", difficulty: "Medium", xp: 700, stat: "intelligence", category: "spiritual" },
//   youtube: shorts/gAJDUPZHNSk  — "How To Build A Strong Connection With Allah — Belal Assaad" [Islamic Lectures]
// { title: "Memorize 10 new ayahs with meaning", difficulty: "Medium", xp: 600, stat: "intelligence", category: "spiritual" },
// { title: "Complete a full Juz with translation", difficulty: "Medium", xp: 800, stat: "intelligence", category: "spiritual" },
// { title: "Memorize a new short surah with meaning", difficulty: "Medium", xp: 500, stat: "intelligence", category: "spiritual" },
//   youtube: shorts/aHM41HiQ6fA  — "(Sahih Muslim Hadith) the one who offers Isha prayer..." [Islamic knowledge 1]
// Hard
// { title: "Complete Quran khatm with translation", difficulty: "Hard", xp: 4000, stat: "intelligence", category: "spiritual" },
//   youtube: shorts/q-Mmo2yDvtw  — "The Holy Qur'an being lifted is a sign of the day of judgement" [Muhammad Qasims]
// { title: "Pray Tahajjud nightly for 30 days", difficulty: "Hard", xp: 4000, stat: "stamina", category: "spiritual" },
//   youtube: shorts/Nfpn2C-4bLE  — "The One Desire I Can't Silence — To Meet Allah — Hisham Abu Yusuf"
// { title: "Complete full hifdh of Juz Amma (last Juz)", difficulty: "Hard", xp: 5000, stat: "intelligence", category: "spiritual" },
// { title: "Study tafseer of 5 full surahs from different Juz", difficulty: "Hard", xp: 3500, stat: "intelligence", category: "spiritual" },
//   youtube: watch?v=odr9Q_OuJQQ  — "Bayquniyyah — Shaykh Sayyid Samdani" (Hadith sciences)

// ====================================================================
// GRATITUDE & TRUST — Shukr · Tawakkul · Contentment
// ====================================================================
// Easy
// { title: "Write 3 things you're grateful for today", difficulty: "Easy", xp: 150, stat: "willpower", category: "personal" },
//   youtube: shorts/5zSyk3aHQBA  — "Say Alhamdulillah—others may be praying for what you have" [Islamic Pathway]
// { title: "Say Alhamdulillah genuinely 100 times", difficulty: "Easy", xp: 150, stat: "willpower", category: "spiritual" },
//   youtube: shorts/5zSyk3aHQBA  — "Say Alhamdulillah..." [Islamic Pathway]
// { title: "Acknowledge one blessing you usually take for granted", difficulty: "Easy", xp: 150, stat: "willpower", category: "personal" },
//   youtube: shorts/RU-o1i4ggGk  — "Beg Allah till he gives you what your heart wants — Mufti Menk" [Mufti Menk]
// { title: "Practice contentment with what you have today", difficulty: "Easy", xp: 250, stat: "willpower", category: "personal" },
//   youtube: shorts/gagU1-mUf2Q  — "Everything that happens in your life — Mufti Menk" [Deen Message]
// { title: "Thank someone genuinely today", difficulty: "Easy", xp: 200, stat: "discipline", category: "social" },
// { title: "Put your trust in Allah for one worry", difficulty: "Easy", xp: 250, stat: "willpower", category: "spiritual" },
//   youtube: shorts/5xM0bTbxD90  — "Can Dua Change the Qadr?" — Ustadh AbdulAziz Al-Haqqan [Garden of Ilm]
// Medium
// { title: "Maintain a gratitude journal for 7 days", difficulty: "Medium", xp: 600, stat: "discipline", category: "personal" },
//   youtube: shorts/Cavb9RvTNe4  — "A Daily Reminder — I Will Not Return – Make the Most of Me" [Huda TV]
// { title: "Practice tawakkul on a difficult matter", difficulty: "Medium", xp: 700, stat: "willpower", category: "spiritual" },
//   youtube: shorts/O0b7GQOd5y0  — "Everything that happens in your life - Mufti Menk" [Deen Message]
// { title: "Give sincere charity (sadaqah) secretly", difficulty: "Medium", xp: 600, stat: "willpower", category: "spiritual" },
//   youtube: shorts/4sS-KLrXQH8  — "Strive for These 5 Things" [Islamestic]
// { title: "Complete 30-day gratitude practice", difficulty: "Medium", xp: 1200, stat: "discipline", category: "personal" },
// { title: "Go a full day without complaining about anything", difficulty: "Medium", xp: 700, stat: "willpower", category: "personal" },
// Hard
// { title: "Maintain perfect gratitude for 30 days (no complaints)", difficulty: "Hard", xp: 3000, stat: "willpower", category: "personal" },

// ====================================================================
// JUSTICE & ETHICS — Integrity · Honesty · Fairness
// ====================================================================
// Easy
// { title: "Speak the truth even if it's against yourself", difficulty: "Easy", xp: 300, stat: "willpower", category: "personal" },
// { title: "Return a trust/borrowed item today", difficulty: "Easy", xp: 200, stat: "discipline", category: "personal" },
// { title: "Be fair in a decision affecting others", difficulty: "Easy", xp: 250, stat: "discipline", category: "social" },
//   youtube: shorts/CZh-6niajA4  — "Best person Who With Their Wives — Mufti Menk" [1 Minute Deen]
// { title: "Avoid gossip/backbiting for a full day", difficulty: "Easy", xp: 300, stat: "willpower", category: "personal" },
//   youtube: shorts/jCkTfrDFvls  — "People judge you by your sins" [Moodtic]
// { title: "Keep a promise you made", difficulty: "Easy", xp: 250, stat: "discipline", category: "personal" },
// { title: "Respond to an insult with peace", difficulty: "Easy", xp: 300, stat: "willpower", category: "personal" },
// { title: "Greet someone with a better greeting", difficulty: "Easy", xp: 150, stat: "discipline", category: "social" },
// { title: "Practice humility in walking and speaking", difficulty: "Easy", xp: 200, stat: "discipline", category: "personal" },
// { title: "Be just even toward someone you dislike", difficulty: "Medium", xp: 600, stat: "willpower", category: "social" },
// Medium
// { title: "Help two parties reconcile a dispute", difficulty: "Medium", xp: 800, stat: "discipline", category: "social" },
//   youtube: shorts/AOjI4gxwN7w  — "The Power of Forgiveness in Family — Nouman Ali Khan" [THE SUNNAH CHANNEL]
// { title: "Stand up against an injustice you witness", difficulty: "Medium", xp: 900, stat: "willpower", category: "social" },
//   youtube: shorts/lscIoWK_sFU  — "Beware the Double-Faced: Prophet Muhammad's Warning!" [Verse Of Muhammad]
// { title: "Keep all promises for 7 days straight", difficulty: "Medium", xp: 700, stat: "discipline", category: "personal" },
// { title: "Practice graciousness in a difficult situation", difficulty: "Medium", xp: 600, stat: "willpower", category: "social" },
// Hard
// { title: "Live with complete integrity for 30 days", difficulty: "Hard", xp: 4000, stat: "discipline", category: "personal" },

// ====================================================================
// COMPASSION & BROTHERHOOD — Charity · Kindness · Community
// ====================================================================
// Easy
// { title: "Help someone without being asked", difficulty: "Easy", xp: 250, stat: "willpower", category: "social" },
// { title: "Smile at someone — it's charity", difficulty: "Easy", xp: 100, stat: "discipline", category: "social" },
// { title: "Give a sincere compliment today", difficulty: "Easy", xp: 150, stat: "discipline", category: "social" },
// { title: "Feed someone or contribute to feeding", difficulty: "Easy", xp: 300, stat: "willpower", category: "social" },
// { title: "Visit a sick person or check on the elderly", difficulty: "Easy", xp: 300, stat: "stamina", category: "social" },
// { title: "Remove something harmful from the road", difficulty: "Easy", xp: 150, stat: "discipline", category: "social" },
// { title: "Be kind to a neighbor today", difficulty: "Easy", xp: 200, stat: "discipline", category: "social" },
// { title: "Give charity secretly (can be small)", difficulty: "Easy", xp: 250, stat: "willpower", category: "spiritual" },
//   youtube: shorts/4sS-KLrXQH8  — "Strive for These 5 Things" [Islamestic]
// { title: "Speak kindly to your parents today", difficulty: "Easy", xp: 300, stat: "discipline", category: "social" },
//   youtube: shorts/CZh-6niajA4  — "Best person Who With Their Wives — Mufti Menk" [1 Minute Deen]
// { title: "Share knowledge that benefits someone", difficulty: "Easy", xp: 250, stat: "intelligence", category: "learning" },
//   youtube: shorts/YgGrM8ymi_4  — "Live up to your name... — Akhi Ayman" [Faris Yassin]
// { title: "Be merciful to someone weaker than you", difficulty: "Easy", xp: 250, stat: "willpower", category: "social" },
// { title: "Visit or call a family member just to check on them", difficulty: "Easy", xp: 200, stat: "discipline", category: "social" },
// Medium
// { title: "Help an orphan or widow practically", difficulty: "Medium", xp: 700, stat: "willpower", category: "social" },
// { title: "Make peace between two people who are upset", difficulty: "Medium", xp: 700, stat: "discipline", category: "social" },
//   youtube: shorts/AOjI4gxwN7w  — "The Power of Forgiveness in Family — Nouman Ali Khan"
// { title: "Perform an act of hidden charity daily for 7 days", difficulty: "Medium", xp: 800, stat: "willpower", category: "spiritual" },
// { title: "Volunteer your time for community service", difficulty: "Medium", xp: 900, stat: "stamina", category: "social" },
// { title: "Forgive someone who wronged you", difficulty: "Medium", xp: 900, stat: "willpower", category: "personal" },
//   youtube: shorts/AOjI4gxwN7w  — "The Power of Forgiveness in Family — Nouman Ali Khan"
// { title: "Treat all people with equal dignity for a week", difficulty: "Medium", xp: 700, stat: "discipline", category: "social" },
// Hard
// { title: "Establish a recurring sadaqah (ongoing charity)", difficulty: "Hard", xp: 4000, stat: "discipline", category: "spiritual" },
// { title: "Complete 30 days of constant kindness and service", difficulty: "Hard", xp: 4000, stat: "willpower", category: "social" },
//   youtube: shorts/FhU73f46zMY  — "The Prophet Muhammad's Love For You (Yes You!) — Ustadha Ieasha Prime" [MCC East Bay]

// ====================================================================
// REFLECTION & PURPOSE — Life's Meaning · Akhirah · Self-Accounting
// ====================================================================
// Easy
// { title: "Reflect on the question 'Why am I here?' for 5 mins", difficulty: "Easy", xp: 250, stat: "intelligence", category: "spiritual" },
//   youtube: shorts/Nfpn2C-4bLE  — "The One Desire I Can't Silence — To Meet Allah — Hisham Abu Yusuf"
// { title: "Reflect on death for 5 mins", difficulty: "Easy", xp: 250, stat: "intelligence", category: "spiritual" },
//   youtube: shorts/dKegzBVrQu8  — "When death comes knocking..." [SuccessfullyOnTop]
//   youtube: shorts/q-Mmo2yDvtw  — "The Holy Qur'an being lifted is a sign of the day of judgement"
// { title: "Recite surah Al-Asr and reflect on time", difficulty: "Easy", xp: 200, stat: "intelligence", category: "spiritual" },
//   youtube: shorts/Cavb9RvTNe4  — "A Daily Reminder — I Will Not Return – Make the Most of Me" [Huda TV]
// { title: "Reflect on one of Allah's signs in nature", difficulty: "Easy", xp: 200, stat: "intelligence", category: "spiritual" },
// { title: "Read Quran 59:18 — let every soul look to what it sent forth", difficulty: "Easy", xp: 250, stat: "intelligence", category: "spiritual", isPinned: true },
//   youtube: shorts/OLI7TWyLAyQ  — "When Calamity Strikes You" [Spread Deen Hub]
// { title: "Write down one good deed you'll be held accountable for", difficulty: "Easy", xp: 200, stat: "discipline", category: "personal" },
// { title: "Ask yourself: 'What do I want Allah to say about me?'", difficulty: "Easy", xp: 250, stat: "willpower", category: "spiritual" },
//   youtube: shorts/FhU73f46zMY  — "The Prophet Muhammad's Love For You (Yes You!) — Ustadha Ieasha Prime"
// Medium
// { title: "Write a personal mission statement based on your purpose", difficulty: "Medium", xp: 700, stat: "intelligence", category: "personal" },
// { title: "Do a full self-accountability (muhasabah) session", difficulty: "Medium", xp: 700, stat: "intelligence", category: "spiritual" },
//   youtube: shorts/fdc4TLg2yC4  — "Overwhelmed With Life? The Prophet Showed A Way Out — Hisham Abu Yusuf"
//   youtube: shorts/eWsDXVMqofE  — "Your First Reaction To Hardship Should Be This!" — Ousama Alshurafa [Think Islam]
// { title: "Read and reflect on Surah Al-Mulk (The Sovereignty)", difficulty: "Medium", xp: 700, stat: "intelligence", category: "spiritual" },
// { title: "Plan your ideal life with the Hereafter in mind", difficulty: "Medium", xp: 800, stat: "intelligence", category: "personal" },
//   youtube: shorts/H1y52_9sP7s  — "Allah Chose You Because You Have The Skills — Nouman Ali Khan"
// { title: "Identify and eliminate one worldly distraction from your life", difficulty: "Medium", xp: 600, stat: "willpower", category: "personal" },
//   youtube: shorts/1D7rDyfztIg  — "Watch THIS if you post on social media... - mufti menk" [SuccessfullyOnTop]
// { title: "Study the descriptions of Paradise and reflect", difficulty: "Medium", xp: 700, stat: "intelligence", category: "spiritual" },
// { title: "Write a letter to your future self about your purpose", difficulty: "Medium", xp: 600, stat: "intelligence", category: "personal" },
//   youtube: shorts/zsJ4pEjrVmE  — "Your life... is what your thoughts make it" [amrouz]
// Hard
// { title: "Complete a full life audit across all domains", difficulty: "Hard", xp: 3000, stat: "intelligence", category: "cultivation" },
//   youtube: shorts/rGJt5NzLVc4  — "This One Mindset Changed My Life Forever — Jim Rohn" [Grind Mindset]
// { title: "Reflect deeply on purpose every day for 30 days", difficulty: "Hard", xp: 3500, stat: "intelligence", category: "personal" },
//   youtube: shorts/bGIw4ztC1rg  — "We Have Very Modest Ambitions — Hisham Abu Yusuf"
// { title: "Write a comprehensive life plan aligned with Allah's pleasure", difficulty: "Hard", xp: 4000, stat: "intelligence", category: "spiritual" },
//   youtube: shorts/fdc4TLg2yC4  — "Overwhelmed With Life? The Prophet Showed A Way Out — Hisham Abu Yusuf"
// { title: "Transform one major area of life to align with your purpose", difficulty: "Hard", xp: 5000, stat: "willpower", category: "personal" },
//   youtube: shorts/gAJDUPZHNSk  — "How To Build A Strong Connection With Allah — Belal Assaad" [Islamic Lectures]

// ====================================================================
// TIKTOK CHANNELS — Full Reference (from messages.html)
// ====================================================================
// Source: Telegram Tik Tok Downloader bot (Jul 2024 - Jun 2026)
// 337 vm.tiktok.com short links + 24 direct tiktok.com/@user/video
//
// Links are grouped by channel theme. Most vm.tiktok.com short links
// could not be resolved to specific content titles (JS-rendered).
//
// --- ISLAMIC / SPIRITUAL (majority of links) ---
// https://www.tiktok.com/@the_quranpage        — Quran verse posts (2 direct links)
// https://www.tiktok.com/@ibadah_inspiration   — Worship inspiration (2 direct links)
// https://www.tiktok.com/@_roadtoallah_        — Islamic motivation (4 direct links)
// https://www.tiktok.com/@road.of.islam0       — Islamic content (2 direct links)
// https://www.tiktok.com/@allahstheone         — Faith-centered reminders (2 direct links)
// https://www.tiktok.com/@a_soul_of_islam      — Soulful Islamic reminders (2 direct links)
// https://www.tiktok.com/@oti_al_albani        — Islamic teachings, Al-Albani (2 direct links)
// https://www.tiktok.com/@akademiakmal         — Islamic scholarship / knowledge (2 direct links)
// https://www.tiktok.com/@ayyub2445            — Islamic content (4 direct links)
// https://www.tiktok.com/@mindobserver1        — Islamic mindfulness (2 direct links)
// https://www.tiktok.com/@zenfis_              — Spiritual reminders (2 direct links)
// https://www.tiktok.com/@taophilosophy        — Philosophical/spiritual reflections (4 direct links)
//
// --- MOTIVATION / SELF-IMPROVEMENT ---
// https://www.tiktok.com/@greateryouu          — Self-improvement/motivation (2 direct links)
//
// --- ARTS / BEAUTY / CULTURE ---
// https://www.tiktok.com/@cocomaries_lacquerlounge — Nail art / beauty (2 direct links)
// https://www.tiktok.com/@trueart6             — Art content (2 direct links)
// https://www.tiktok.com/@marinomusicalt       — Music/performing (2 direct links)
//
// --- GAMING / ENTERTAINMENT ---
// https://www.tiktok.com/@peakinsanity500      — Gaming/entertainment (2 direct links)
//
// --- OTHER / UNCLASSIFIED ---
// https://www.tiktok.com/@guess_who4721        — (2 direct links)
// https://www.tiktok.com/@haisi.ll             — (2 direct links)
// https://www.tiktok.com/@loz8904              — (2 direct links)
// https://www.tiktok.com/@sluc20               — (2 direct links)
// https://www.tiktok.com/@iii6xr2              — (2 direct links)
// https://www.tiktok.com/@h.uma.m              — (2 direct links)
// https://www.tiktok.com/@fkafridi24           — (2 direct links)
// ====================================================================
