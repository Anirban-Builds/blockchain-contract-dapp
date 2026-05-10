import { Router } from "express"
import { handleContractSave,
        handleListContracts,
        handleSignContract,
        handleWalletExists } from "../controllers/contract.controller.js"
import { upload } from "../middlewares/multer.middleware.js"

const contractRouter = Router()

contractRouter.route('/save-contract').post(upload.single("contract"), handleContractSave)
contractRouter.route('/list-contracts').post(handleListContracts)
contractRouter.route('/sign-contract').post(handleSignContract)
contractRouter.route('/check-wallet').post(handleWalletExists)

export default contractRouter