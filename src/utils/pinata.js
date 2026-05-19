import { PinataSDK } from "pinata"
import fs from "fs"

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT_SECRET,
  pinataGateway: process.env.PINATA_CLOUD,
})

const pinataUpload = async(filepath, file)=>{
    try {
        if(!filepath) return "file not found on server"
        const blob = new Blob([fs.readFileSync(filepath)])
        const file_ = new File([blob], file.originalname)
        const res = await pinata.upload.public.file(file_)
        fs.unlinkSync(filepath)
        return res
    }
    catch (error){
        console.log("Error in file upload : ", error)
        fs.unlinkSync(filepath)
        return null
    }
}

export {pinataUpload, pinata}