
import mongoose, {Schema} from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; 

const videoSchema = new Schema({
  videoFile: { type: String, required: true },
    thumbnail: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    views: { type: Number, default: 0 },
    duration: { type: Number, required: true },
    isPubliced: { type: Boolean, default: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true }

},

{ timestamps: true }

);

videoSchema.plugin(mongooseAggregatePaginate);
const Video = mongoose.model("Video", videoSchema);

export default Video;
