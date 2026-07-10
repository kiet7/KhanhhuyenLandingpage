import Profile from "../models/Profile.js";

export async function getProfile(req, res) {
  const profile = await Profile.findOne();
  res.json(profile);
}

export async function updateProfile(req, res) {
  let profile = await Profile.findOne();
  if (!profile) {
    profile = new Profile(req.body);
  } else {
    profile.set(req.body);
  }
  await profile.save();
  res.json(profile);
}
