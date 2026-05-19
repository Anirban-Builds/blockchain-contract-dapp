import {Resend} from "resend"
import { MODE } from "../../constants.js"

const resend = new Resend(process.env.RESEND_API_KEY)

const sendMail = async(to, walletid, URL, filename)=>{
    return await resend.emails.send({
        from : "Anirban Builds <sign-contract@anirbanbuilds.online>",
        to,
        subject : `${MODE === 'dev' ? "[TEST] ":""}Contract signing request`,
        html : `
        <div style="background:#60a5fa;padding:10px;">
        <div style="background:#0f172a;padding:20px;text-align:center;">
        <h2 style="color:white;margin-bottom:10px;">You have a contract to sign</h2>
        <p style="color:#94a3b8;margin-bottom:20px;">Wallet address <b>${walletid}</b> has requested you to sign a contract <b>${filename}</b>.</p>
        <a href="${URL}" style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">
        View Contract
        </a>
        </div>
        </div>
        `
    })
}

export default sendMail