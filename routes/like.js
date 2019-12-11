const User = require('../models/user.js').model
const Track = require('../models/track.js').model

const updateUserLike = async (media, id, token) => {
    const likeElem = { media: media, id: id }; 
    const query = { token: token };
    let update = { $push: { like: likeElem } };
    let unlike = false;

    const user = await User.find(query);
    const likes = user[0].like;

    if (likes.find(item => item.media === media && item.id == id)) {
      update = { $pull: { like: likeElem } };
      unlike = true;
    }

    await User.updateOne(query, update);
    return unlike;
}

const updateMediaLike = async (id, media, unlike) => {
  let query = {};
  let incValue = 1;

  switch (media) {
    case "album":
      query = { collectionId: id };
      break;
    case "track":
      query = { trackId: id };
      break;
    case "artist":
      query = { artistId: id };
      break;
  }

  if (unlike === true)
    incValue = -1;

  await Track.findOneAndUpdate(query, { $inc: { likeCount: incValue } });
}

exports.postLike = async function(req, res) {
  /*
  const track = new Track({
    trackName: "Age Of Excuse II",
    trackId: 666,
    likeCount: 0,
  });
  await track.save();
  */

  try {
    const media = req.params.type;
    const id = parseInt(req.params.id);
    const token = req.header('authorization'); 

    if (!["album", "track", "artist"].find(item => item === media))
      return res.status(400).send("Invalid type: " + media);

    const unlike = await updateUserLike(media, id, token);
    await updateMediaLike(id, media, unlike);
    res.status(200).send(media + " " + id + ": Like updated");
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
}
