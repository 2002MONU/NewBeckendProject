import mongoose , {Schema}   from 'mongoose';

const subscribeSchema = new Schema({
  subscriber: { type: Schema.Types.ObjectId, ref: "User", required: true },
  channel: { type: Schema.Types.ObjectId, ref: "User", required: true },    
}, { timestamps: true  });

const Subscribe = mongoose.model("Subscribe", subscribeSchema);
export default Subscribe;