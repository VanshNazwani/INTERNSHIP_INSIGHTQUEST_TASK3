import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
});

export default mongoose.model("User", userSchema);
