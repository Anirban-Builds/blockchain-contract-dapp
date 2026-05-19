import { Router } from "express"
import { handleContractSave,
        handleListContracts,
        handleSignContract,
        handleWalletExists,
        handleDeleteContract, } from "../controllers/contract.controller.js"
import { upload } from "../middlewares/multer.middleware.js"

const contractRouter = Router()

contractRouter.route('/save-contract').post(upload.single("contract"), handleContractSave)
contractRouter.route('/list-contracts').post(handleListContracts)
contractRouter.route('/sign-contract').post(handleSignContract)
contractRouter.route('/check-wallet').post(handleWalletExists)
contractRouter.route('/delete-contract').post(handleDeleteContract)

export default contractRouter