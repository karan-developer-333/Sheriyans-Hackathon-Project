import mongoose from "mongoose";
import { type } from "os";

const refererSchema = new mongoose.Schema({
    referer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    organization:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Organization",
        required:true,
    },
});

const Referer = mongoose.model("Referer", refererSchema);

export default Referer;