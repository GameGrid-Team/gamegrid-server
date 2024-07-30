let aboutTxt = `About Page Content for GameGrid
About GameGrid
Welcome to GameGrid (GG), the ultimate social media platform designed specifically for gamers! Our mission is to create a vibrant and engaging community where gamers from all around the world can connect, share, and compete. With features tailored to enhance the gaming experience, GameGrid is more than just a social network; it's a hub for gamers to thrive.

Key Features of GameGrid:

Lobby (Home Page): Stay updated with the latest posts from gamers you follow and discover new content from the community.
Player's Hub (Profile Page): Showcase your gaming achievements, share your gaming interests, and connect with like-minded gamers.
Rank System: Earn points for activities like posting and engaging with content, and watch your rank rise through gaming-themed levels.
Stats Tab: Keep track of your gaming stats and see how you compare with others.
Preferences Tab: Customize your GameGrid experience to suit your preferences.
Personalized Feeds: Toggle between posts from users you follow and the entire community to see the content that matters most to you.
Meet the Team
Our dedicated team of developers and designers are passionate about gaming and committed to delivering the best experience for our users. Here's a bit about us:

Kobi, Matan, Lior, Eden, Ron, Adi, Liel

Our Vision
At GameGrid, we believe that gaming is more than just a hobby; it's a way of life. Our platform is built by gamers, for gamers, with the aim of fostering a community where everyone can share their love for games. Whether you're a casual player or a hardcore gamer, GameGrid is the place for you to connect, compete, and grow.

Join us on this exciting journey and be a part of the GameGrid community!

Feel free to modify any section to better suit your team's needs or to add more information about your project.`

module.exports = {
  aboutTxt,
  checkRank: function checkRankLevel(exp) {
    if (exp >= 0 && exp < 5) return { rank_name: 'Rookie', exp: exp, next_rank: 5 }
    if (exp >= 5 && exp < 10) return { rank_name: 'Adventurer', exp: exp, next_rank: 10 }
    if (exp >= 10 && exp < 15) return { rank_name: 'Veteran', exp: exp, next_rank: 15 }
    if (exp >= 15 && exp < 20) return { rank_name: 'Epic', exp: exp, next_rank: 20 }
    if (exp >= 20 && exp < 25) return { rank_name: 'Elite', exp: exp, next_rank: 25 }
    if (exp >= 25 && exp < 30) return { rank_name: 'Mythic', exp: exp, next_rank: 30 }
    if (exp >= 30) return { rank_name: 'Immortal', exp: exp, next_rank: 10000000 }
  },
}
