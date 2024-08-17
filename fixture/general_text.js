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
  if (exp >= 0 && exp < 50)
    return {
      rank_name: 'Rookie',
      exp: exp,
      next_rank: 50,
      rank_image_url:
        'https://firebasestorage.googleapis.com/v0/b/gamegrid-f4689.appspot.com/o/files%2FRookie.png?alt=media&token=033466a9-eb0c-4c91-bd24-e0c248769f42',
    }
  if (exp >= 50 && exp < 120)
    return {
      rank_name: 'Adventurer',
      exp: exp,
      next_rank: 120,
      rank_image_url:
        'https://firebasestorage.googleapis.com/v0/b/gamegrid-f4689.appspot.com/o/files%2FAdventurer.png?alt=media&token=b26dab46-a32f-4b30-9134-60c9631ee71f',
    }
  if (exp >= 120 && exp < 220)
    return {
      rank_name: 'Veteran',
      exp: exp,
      next_rank: 220,
      rank_image_url:
        'https://firebasestorage.googleapis.com/v0/b/gamegrid-f4689.appspot.com/o/files%2FVeteran.png?alt=media&token=4617a7d8-e98f-4d3f-aa7f-ba20869142fb',
    }
  if (exp >= 220 && exp < 340)
    return {
      rank_name: 'Epic',
      exp: exp,
      next_rank: 340,
      rank_image_url:
        'https://firebasestorage.googleapis.com/v0/b/gamegrid-f4689.appspot.com/o/files%2FEpic.png?alt=media&token=2f91e723-173a-4a0a-a054-02b8fef42f51',
    }
  if (exp >= 340 && exp < 480)
    return {
      rank_name: 'Elite',
      exp: exp,
      next_rank: 480,
      rank_image_url:
        'https://firebasestorage.googleapis.com/v0/b/gamegrid-f4689.appspot.com/o/files%2FElite.png?alt=media&token=10fd2fc6-af7f-4bcf-80db-b5c8110c7284',
    }
  if (exp >= 480 && exp < 640)
    return {
      rank_name: 'Mythic',
      exp: exp,
      next_rank: 640,
      rank_image_url:
        'https://firebasestorage.googleapis.com/v0/b/gamegrid-f4689.appspot.com/o/files%2FMythic.png?alt=media&token=85f03ef5-aaa5-48e5-b7ea-06ea104c13a1',
    }
  if (exp >= 640)
    return {
      rank_name: 'Immortal',
      exp: exp,
      next_rank: 'Infinite',
      rank_image_url:
        'https://firebasestorage.googleapis.com/v0/b/gamegrid-f4689.appspot.com/o/files%2FImmortal.png?alt=media&token=ca033135-920c-4f4e-88c3-998cce5d6803',
    }
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
