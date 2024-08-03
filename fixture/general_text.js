const { fbapp } = require('../db')
const { getStorage, ref, deleteObject, getDownloadURL, uploadBytesResumable } = require('firebase/storage')
const fb = fbapp
const storage = getStorage()

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

function checkRankLevel(exp) {
  //todo: edit exp
  if (exp >= 0 && exp < 5) return { rank_name: 'Rookie', exp: exp, next_rank: 5, rank_image_url: '' }
  if (exp >= 5 && exp < 10) return { rank_name: 'Adventurer', exp: exp, next_rank: 10, rank_image_url: '' }
  if (exp >= 10 && exp < 15) return { rank_name: 'Veteran', exp: exp, next_rank: 15, rank_image_url: '' }
  if (exp >= 15 && exp < 20) return { rank_name: 'Epic', exp: exp, next_rank: 20, rank_image_url: '' }
  if (exp >= 20 && exp < 25) return { rank_name: 'Elite', exp: exp, next_rank: 25, rank_image_url: '' }
  if (exp >= 25 && exp < 30) return { rank_name: 'Mythic', exp: exp, next_rank: 30, rank_image_url: '' }
  if (exp >= 30) return { rank_name: 'Immortal', exp: exp, next_rank: 10000000, rank_image_url: '' }
}

//for insert- force including all fields and also checks for wrong ones.
function keysMustInclude(originalJson, clientJson) {
  const originalKeys = Object.keys(originalJson)
  const clientKeys = Object.keys(clientJson)
  const incorrectKeys = clientKeys.filter((key) => !originalKeys.includes(key))
  const incorrectValueType = {}
  originalKeys.forEach((key) => {
    if (clientKeys.includes(key)) {
      const originalType = Array.isArray(originalJson[key]) ? 'array' : typeof originalJson[key]
      const clientType = Array.isArray(clientJson[key]) ? 'array' : typeof clientJson[key]

      if (originalType !== clientType) {
        incorrectValueType[key] = `expected ${originalType}, got ${clientType}`
      }
    }
  })
  return {
    incorrect_keys: incorrectKeys,
    incorrect_value_type: incorrectValueType,
    expected_keys: originalKeys,
  }
}

//for update - dont force to insert all fields, just checks.
function areKeysIncluded(originalJson, clientJson) {
  const originalKeys = Object.keys(originalJson)
  const clientKeys = Object.keys(clientJson)
  const extraInClient = clientKeys.filter((key) => !originalKeys.includes(key))
  return {
    inccorect_fields: extraInClient,
    expected_keys: originalKeys,
  }
}

const uploadFile = async (file) => {
  try {
    const dateTime = giveCurrentDateTime()
    const storageRef = ref(storage, `files/${file.originalname + ' ' + dateTime}`)
    const metadata = {
      contentType: file.mimetype,
    }
    const snapshot = await uploadBytesResumable(storageRef, file.buffer, metadata)
    const downloadURL = await getDownloadURL(snapshot.ref)
    return { success: true, downloadURL, name: file.originalname, type: file.mimetype }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

const removeFile = async (fileUrl) => {
  try {
    const fileRef = ref(storage, fileUrl)
    await deleteObject(fileRef)
    return { success: true, message: 'File successfully deleted.' }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

const giveCurrentDateTime = () => {
  const today = new Date()
  const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()
  const time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds()
  const dateTime = date + ' ' + time
  return dateTime
}
module.exports = {
  aboutTxt,
  checkRank: checkRankLevel,
  keysMustInclude: keysMustInclude,
  areKeysIncluded: areKeysIncluded,
  uploadFile,
  removeFile,
}
