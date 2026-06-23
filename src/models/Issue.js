import mongoose from "mongoose";

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  note: { type: String, default: "" },
  timestamp: { type: Date, default: Date.now },
});

const issueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  severity: { type: String, enum: ["Low", "Medium", "High"], required: true },
  image: { type: String, default: null },
  location: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    city: { type: String, default: null },
    state: { type: String, default: null },
  },
  status: { type: String, required: true },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  upvoteCount: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date, default: null },
  resolutionImage: { type: String, default: null },
  statusHistory: [statusHistorySchema],
  satisfiedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  department: { type: String, default: null },
});

// Performance Indexes
issueSchema.index({ status: 1, createdAt: -1 });
issueSchema.index({ category: 1, createdAt: -1 });
issueSchema.index({ severity: 1, createdAt: -1 });
issueSchema.index({ upvoteCount: -1, createdAt: -1 });

export default mongoose.models.Issue || mongoose.model("Issue", issueSchema);
