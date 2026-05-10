import mongoose, {Schema} from "mongoose"
import { type } from "node:os"
import { types } from "node:util"

const userSchema = new Schema({
    user : {type: String, required: true, unique : true},
    email : {type : String, required : true},
    contractlist : {type: [mongoose.Schema.Types.ObjectId], default: []}
}, {versionKey : false})

const users = mongoose.model("contractusers", userSchema)
export default users