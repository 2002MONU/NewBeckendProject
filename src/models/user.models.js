
import mongoose from "mongoose";

const userSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
   fullName: { type: String, required: true },
   avatar: { type: String, required: true },
    coverImage: { type: String, required: true },
    watchHistory: { type: [Schema.Types.ObjectId], ref: video },
    password: { type: String, required: [true, "Password is required"] },
    refreshToken: { type: String, default: null },
    
}
, { timestamps: true  });

const User = mongoose.model("User", userSchema);

export default User;