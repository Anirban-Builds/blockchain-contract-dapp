import { OK } from "../../constants.js"
import contracts from "../models/contract.model.js"
import users from "../models/user.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import Asynchandler from "../utils/AsyncHandler.js"
import pinataUpload from "../utils/pinata.js"
import {ethers} from "ethers"
import mongoose from "mongoose"
import sendMail from "../utils/contractmail.js"

const handleContractSave = Asynchandler(async(req, res)=>{
    const { email, walletid } = req.body
    const contractFilePath = req.file?.path
    if(!contractFilePath){
        throw new ApiError(400, "Contract File is required !")
    }
    const contractFile = req.file
    const fileres = await pinataUpload(contractFilePath, contractFile)
    if(!fileres){
            throw new ApiError(400, "File failed to upload on pinata")
        }
    const newContract = await contracts.create({
        ipfs_hash: fileres.cid,
        user_a : {walletAddress : walletid},
        user_b : {email : email},
    })
     if (!newContract) {
            throw new ApiError(500, "Something went wrong while creating the contract")
        }
    const newUser = users.create({
        user : walletid,
        contractlist : [newContract._id]
    })
    if(!newUser){
            throw new ApiError(500, "Something went wrong while creating user record")
    }
    const link = `${process.env.CORS_ORIGIN}/sign?wallet=${walletid}&email=${email}&contract=${newContract._id.toString()}`
    const emailres = await sendMail(email, walletid, link)

    if(!emailres) throw new ApiError(500, "Failed to send email")

    return res
    .status(OK)
    .json(new ApiResponse(
        OK,
        {},
        "Contract creation success"
    ))
})

const handleListContracts = Asynchandler(async(req, res)=>{
    const {walletid} = req.body
    const contractlist = []
    const user = await users.findOne({user : walletid})
    if(!user){
        throw new ApiError(402, "User not found")
    }
    if(user.contractlist.length){
    for(let i=0; i<user.contractlist.length; i++){
        const contract = await contracts.findById(user.contractlist[i])
        contractlist.push({
            "status" : contract?.status,
            "create_time" : contract?.created_at,
            "sign_time" : contract?.completed_at,
            "ipfs_hash": contract?.ipfs_hash,
        })
    }
}
    return res
    .status(OK)
    .json(new ApiResponse(
        OK,
        {contractlist : contractlist},
        "contract list fetch success"
    ))
})

const handleSignContract = Asynchandler(async(req, res)=>{
    const {walletid, email, contractid} = req.body
    const contract_id = new mongoose.Types.ObjectId(contractid)
    const CONTRACT_ABI = [
  "function createAgreement(address userA, string calldata ipfsHash) external returns (uint256)"
]
    const contract = await contracts.findById(contract_id)
    // contract is guaranteed to exist in db
    const ipfs_hash = contract.ipfs_hash
     if (!walletid || !ipfs_hash) {
    throw new ApiError(400, "walletid and ipfs_hash are required")
  }
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL)
    const signer = new ethers.Wallet(process.env.AMOY_KEY, provider)
    const c = new ethers.Contract(process.env.CONTRACT_ADDRESS, CONTRACT_ABI, signer)

    const tx = await c.createAgreement(walletid, ipfs_hash)
    const receipt = await tx.wait()

    if (!receipt.status) {
        throw new ApiError(500, "Transaction failed on chain")
    }

    let user = await users.findOne({ user: walletid })
    if (!user) {
     user = await users.create({
        user : walletid,
        email : email,
        contractlist : [contract_id]
    })
    if(!user) throw new ApiError(500, "Failed to create user")
}
    else{
        user.contractlist.push(contract_id)
        await user.save()
    }

    return res.status(OK).json(new ApiResponse(OK, {}, "Contract created on chain"))
})

const handleWalletExists = Asynchandler(async(req, res)=>{
    const {walletid, email} = req.body
    const user = await users.findOne({user : walletid})
    const exists = user ? user.email === email : false
    return res
    .status(OK)
    .json(new ApiResponse(
        OK,
        {exists : exists}
    ))
})

export {
    handleContractSave,
    handleListContracts,
    handleSignContract,
    handleWalletExists,
}