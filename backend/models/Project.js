import mongoose from "mongoose";

// Member sub-schema: supports roles extensibility in future (e.g. admin, viewer)
const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["owner", "member"], // easily extend: "admin", "viewer", etc.
      default: "member",
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false } // no extra _id per member entry
);

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    color: { type: String, default: "purple" },

    // Original owner field — kept for backwards compatibility
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Explicit members list — owner is NOT stored here, tracked via `user`
    members: {
      type: [memberSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Virtual: all authorized user IDs (owner + members)
projectSchema.virtual("authorizedUserIds").get(function () {
  const ids = [this.user.toString()];
  this.members.forEach((m) => ids.push(m.user.toString()));
  return ids;
});

// Instance helper: check if a userId is authorized (owner or member)
projectSchema.methods.isAuthorized = function (userId) {
  const uid = userId.toString();
  if (this.user.toString() === uid) return true;
  return this.members.some((m) => m.user.toString() === uid);
};

// Instance helper: check if a userId is the owner
projectSchema.methods.isOwner = function (userId) {
  return this.user.toString() === userId.toString();
};

export default mongoose.model("Project", projectSchema);
