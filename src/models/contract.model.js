import mongoose, {Schema} from "mongoose"

const contractSchema = new Schema({
    filename : {type : String, required : true},
    ipfs_hash: { type: String, default: "", unique : true },
    user_a: {
        walletAddress: { type: String, required: true }
    },
    user_b: {
        email: { type: String, required: true },
        walletAddress: { type: String, default: null }
    },
    status: { type: Number, default: 0 },
    agreement_id: { type: Number, default: null },
    created_at :{ type: Date, default: Date.now },
    completed_at: { type: Date, default: null },
    tx_link : {type: String, default: ""},
    pinata_id : {type: String, required: true},
}, { versionKey: false })

const contracts =  mongoose.model("contracts", contractSchema)
export default contracts