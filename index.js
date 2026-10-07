import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys'
import pino from 'pino'
import qrcode from 'qrcode-terminal'

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth')
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        browser: ["FA-SHAHZADA","Chrome","1.0"]
    })
    sock.ev.on('creds.update', saveCreds)
    sock.ev.on('connection.update', (u) => {
        const { connection, lastDisconnect, qr } = u
        if(qr){ console.log("QR:"); qrcode.generate(qr,{small:true}) }
        if(connection==='close'){
            if(lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut) startBot()
        } else if(connection==='open'){ console.log('FA-SHAHZADA-BOT CONNECTED 👑') }
    })
    sock.ev.on('messages.upsert', async ({messages}) => {
        const m = messages[0]
        if(!m.message) return
        const text = m.message.conversation || m.message.extendedTextMessage?.text || ""
        const from = m.key.remoteJid
        if(!text.startsWith(".")) return
        const cmd = text.split(" ")[0].toLowerCase()
        if(cmd===".menu"){
            await sock.sendMessage(from,{text:`*👑 FA-SHAHZADA-BOT 👑*\n\n.menu - Menu\n.ping - Speed\n.alive - Alive\n.owner - Owner\n\n*Powered by FA SHAHZADA*`})
        }
        if(cmd===".ping") await sock.sendMessage(from,{text:"*Pong! ⚡ Super Fast*\n*FA-SHAHZADA-BOT*"})
        if(cmd===".alive") await sock.sendMessage(from,{text:"*FA-SHAHZADA-BOT ALIVE HAI 👑🔥*"})
        if(cmd===".owner") await sock.sendMessage(from,{text:"*OWNER: FA SHAHZADA 👑*"})
    })
}
startBot()
