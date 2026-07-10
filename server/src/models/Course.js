import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    shortDescription: { type: String, default: "" },
    description: { type: String, default: "" },
    level: {
      type: String,
      enum: ["Sơ cấp", "Trung cấp", "Cao cấp"],
      default: "Sơ cấp",
    },
    durationWeeks: { type: Number, default: 8 },
    schedule: { type: String, default: "" },
    price: { type: Number, default: 0 },
    imageUrl: { type: String, default: "" },
    syllabus: [{ type: String }],
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
