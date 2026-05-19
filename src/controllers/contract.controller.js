import { OK } from "../../constants.js"
import contracts from "../models/contract.model.js"
import users from "../models/user.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import Asynchandler from "../utils/AsyncHandler.js"
import {pinataUpload, pinata} from "../utils/pinata.js"
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
    const existingContract = await contracts.findOne({ ipfs_hash: fileres.cid })
    if (existingContract) {
        throw new ApiError(400, "This contract already exists")
    }
    const newContract = await contracts.create({
        filename : req.file.originalname,
        ipfs_hash: fileres.cid,
        user_a : {walletAddress : walletid},
        user_b : {email : email},
        pinata_id : fileres.id,
    })
     if (!newContract) {
            throw new ApiError(500, "Something went wrong while creating the contract")
        }
    const user = await users.findOne({user: walletid})
    if(!user){
    const newUser = await users.create({
        user : walletid,
        contractlist : [newContract._id]
    })
    if(!newUser){
        throw new ApiError(500, "Something went wrong while creating user record")
    }}
    else{
      const updcontract = await users.findByIdAndUpdate(
        user._id, { $push: { contractlist: newContract._id }
    })
        if(!updcontract){
            throw new ApiError(500, "Error updating contract list")
        }
    }

    const link = `${process.env.CORS_ORIGIN}/projects/blockchain-contract-dapp/?id=${newContract._id}&email=${email}&contract=${newContract.ipfs_hash}`
    const emailres = await sendMail(email, walletid, link, req.file.originalname)

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
        throw new ApiError(404, "User not found")
    }
    if(user.contractlist.length){
    for(let i=0; i<user.contractlist.length; i++){
        const contract = await contracts.findById(user.contractlist[i])
        contractlist.push({
            "filename" : contract?.filename,
            "status" : contract?.status,
            "create_time" : contract?.created_at,
            "sign_time" : contract?.completed_at,
            "ipfs_hash": contract?.ipfs_hash,
            "tx_hash" : contract?.tx_hash,
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
  "function createAgreement(address userA, string calldata ipfsHash) external returns (uint256)",
  "function cnt() external view returns (uint256)"
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

    const agreement_id = (await c.cnt() -1n).toString()
    const block = await provider.getBlock(receipt.blockNumber)
    const blockDate = new Date(block.timestamp * 1000)
    // const txlink = `https://amoy.polygonscan.com/tx/${tx.hash}`

    const contractRes = await contracts.findByIdAndUpdate(contract_id,
        {
            $set :{
                user_b : {email : email, walletAddress : walletid},
                status : 1,
                agreement_id : agreement_id,
                completed_at : blockDate,
                tx_hash : tx.hash,
            }
        }
    )
    if(!contractRes) throw new ApiError(500, "Failed to update contract")

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
        const saveRes = await users.findByIdAndUpdate(user._id, {$addToSet: { contractlist: contract_id }})
        if(!saveRes) throw new ApiError(400, "Failed to update contractlist")
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

const handleDeleteContract = Asynchandler(async(req, res)=>{
    const {ipfs_hash, walletid} = req.body
    // delete ipfs file
    const contract = await contracts.findOne({ipfs_hash : ipfs_hash})
    if(!contract) throw new ApiError(404, "Contract not found")
    if(contract.status) throw new ApiError(500, "Cannot delete signed contract")

    const deleteRes = await pinata.files.public.delete([contract.pinata_id])
    if(!deleteRes) throw new ApiError(500, "Failed to delete IPFS File")
    // delete contract
    const contractRes = await contracts.findByIdAndDelete(contract._id)
    if(!contractRes) throw new ApiError(500, "Failed to Delete contract")
    // update contractlist
    const userRes = await users.findOneAndUpdate({user : walletid},
        {
            $pull : {contractlist : contract._id}
        }
    )
    if(!userRes) throw new ApiError(500, "Failed to update contractlist")

    return res
    .status(OK)
    .json(new ApiResponse(
        OK,
        {},
        "Contract deleted successfully"
    ))
})

export {
    handleContractSave,
    handleListContracts,
    handleSignContract,
    handleWalletExists,
    handleDeleteContract,
}