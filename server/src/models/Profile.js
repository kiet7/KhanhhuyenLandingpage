import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    year: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
  },
  { _id: true }
);

const certificateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    issuer: { type: String, default: "" },
    year: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
  },
  { _id: true }
);

const testimonialSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true },
    content: { type: String, required: true },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    avatarUrl: { type: String, default: "" },
  },
  { _id: true }
);

const profileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    title: { type: String, default: "" },
    bio: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    coverUrl: { type: String, default: "" },
    address: { type: String, default: "" },
    yearsExperience: { type: Number, default: 0 },
    studentsCount: { type: Number, default: 0 },
    socialLinks: {
      zaloUrl: { type: String, default: "" },
      messengerUrl: { type: String, default: "" },
      facebookUrl: { type: String, default: "" },
      youtubeUrl: { type: String, default: "" },
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
    },
    achievements: [achievementSchema],
    certificates: [certificateSchema],
    testimonials: [testimonialSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Profile", profileSchema);
