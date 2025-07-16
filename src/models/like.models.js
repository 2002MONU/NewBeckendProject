import mongoose , {Schema} from "mongoose"; 


 const likeSchema = new Schema({
  likedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  video: { type: Schema.Types.ObjectId, ref: "Video", required: true },

  comment: { type: Schema.Types.ObjectId, ref: "Comment", trim: true },
  tweet: { type: Schema.Types.ObjectId, ref: "Tweet", trim: true }
}, { timestamps: true  });

const Like = mongoose.model("Like", likeSchema);

export default Like;