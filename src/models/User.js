import mongoose from "mongoose";
import sha1 from "sha1";

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
});
userSchema.pre("save", async function () {
  console.log(this.password, sha1(this.password));
});

const User = mongoose.model("User", userSchema);

export default User;
