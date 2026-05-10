import {Resend} from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const sendMail = async(to, walletid, URL)=>{
    return await resend.emails.send({
        from : "Anirban Builds <sign-contract@anirbanbuilds.online>",
        to,
        subject : `Contract signing request`,
        html : `
        <div>
        <h2>You have a contract to sign</h2>
        <p>Wallet address ${walletid} has requested you to sign a contract.</p>
        <a href="${URL}" style="background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">
        View Contract
        </a>
        </div>
        `
    })
}

export default sendMail