import mongoose from "mongoose";

const contactSubmissionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: "" },
    message: { type: String, default: "" },
    courseInterested: { type: mongoose.Schema.Types.ObjectId, ref: "Course", default: null },
    status: {
      type: String,
      enum: ["new", "contacted", "closed"],
      default: "new",
    },
  },
  { timestamps: true }
);

export default mongoose.model("ContactSubmission", contactSubmissionSchema);
