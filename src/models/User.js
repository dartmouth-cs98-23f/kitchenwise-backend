import mongoose, { SchemaTypes } from "mongoose";
import sha1 from "sha1";

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  friends: [{ type: SchemaTypes.ObjectId, ref: "User" }],
});

// This hook hashes the password before the user is added to the database
userSchema.pre("save", async function () {
  this.password = sha1(this.password);
});

const User = mongoose.model("User", userSchema);

export default User;
