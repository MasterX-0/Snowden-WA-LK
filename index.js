/**
   
*/

require('./config')
const { default: snowdenconnect, usesinglefileauthstate, disconnectreason, fetchlatestbaileysversion, generateforwardmessagecontent, preparewamessagemedia, generatewamessagefromcontent, generatemessageid, downloadcontentfrommessage, makeinmemorystore, jiddecode, proto } = require("@adiwajshing/baileys")
const { state, savestate } = usesinglefileauthstate(`./${sessionname}.json`)
const pino = require('pino')
const { boom } = require('@hapi/boom')
const fs = require('fs')
const yargs = require('yargs/yargs')
const chalk = require('chalk')
const filetype = require('file-type')
const path = require('path')
const _ = require('lodash')
const axios = require('axios')
const phonenumber = require('awesome-phonenumber')
const { imagetowebp, videotowebp, writeexifimg, writeexifvid } = require('./lib/exif')
const { smsg, isurl, generatemessagetag, getbuffer, getsizemedia, fetchjson, await, sleep } = require('./lib/myfunc')

var low
try {
  low = require('lowdb')
} catch (e) {
  low = require('./lib/lowdb')
}

const { low, jsonfile } = low
const mongodb = require('./lib/mongodb')

global.api = (name, path = '/', query = {}, apikeyqueryname) => (name in global.apis ? global.apis[name] : name) + path + (query || apikeyqueryname ? '?' + new urlsearchparams(object.entries({ ...query, ...(apikeyqueryname ? { [apikeyqueryname]: global.apikeys[name in global.apis ? global.apis[name] : name] } : {}) })) : '')

const store = makeinmemorystore({ logger: pino().child({ level: 'silent', stream: 'store' }) })

global.opts = new object(yargs(process.argv.slice(2)).exitprocess(false).parse())
global.db = new low(
  /https?:\/\//.test(opts['db'] || '') ?
    new clouddbadapter(opts['db']) : /mongodb/.test(opts['db']) ?
      new mongodb(opts['db']) :
      new jsonfile(`src/database.json`)
)
global.database = global.db // backwards compatibility
global.loaddatabase = async function loaddatabase() {
  if (global.db.read) return new promise((resolve) => setinterval(function () { (!global.db.read ? (clearinterval(this), resolve(global.db.data == null ? global.loaddatabase() : global.db.data)) : null) }, 1 * 1000))
  if (global.db.data !== null) return
  global.db.read = true
  await global.db.read()
  global.db.read = false
  global.db.data = {
    users: {},
    chats: {},
    database: {},
    game: {},
    settings: {},
    others: {},
    sticker: {},
    ...(global.db.data || {})
  }
  global.db.chain = _.chain(global.db.data)
}
loaddatabase()

// save database every 30seconds
if (global.db) setinterval(async () => {
    if (global.db.data) await global.db.write()
  }, 30 * 1000)

async function startsnowden() {
    const snowden = snowdenconnect({
        logger: pino({ level: 'silent' }),
        printqrinterminal: true,
        browser: ['yt snowden','safari','1.0.0'],
        auth: state
    })

    store.bind(snowden.ev)
    
    // anticall auto block
    snowden.ws.on('cb:call', async (json) => {
    const callerid = json.content[0].attrs['call-creator']
    if (json.content[0].tag == 'offer') {
    let pa7rick = await snowden.sendcontact(callerid, global.owner)
    snowden.sendmessage(callerid, { text: `*sistem otomatis block!*\n*jangan menelpon bot*!\n*silahkan hubungi owner untuk dibuka !*`}, { quoted : pa7rick })
    await sleep(8000)
    await snowden.updateblockstatus(callerid, "block")
    }
    })

    snowden.ev.on('messages.upsert', async chatupdate => {
        //console.log(json.stringify(chatupdate, undefined, 2))
        try {
        mek = chatupdate.messages[0]
        if (!mek.message) return
        mek.message = (object.keys(mek.message)[0] === 'ephemeralmessage') ? mek.message.ephemeralmessage.message : mek.message
        if (mek.key && mek.key.remotejid === 'status@broadcast') return
        if (!snowden.public && !mek.key.fromme && chatupdate.type === 'notify') return
        if (mek.key.id.startswith('bae5') && mek.key.id.length === 16) return
        m = smsg(snowden, mek, store)
        require("./snowden")(snowden, m, chatupdate, store)
        } catch (err) {
            console.log(err)
        }
    })
    
    // group update
    snowden.ev.on('groups.update', async pea => {
       //console.log(pea)
    // get profile picture group
       try {
       ppgc = await snowden.profilepictureurl(pea[0].id, 'image')
       } catch {
       ppgc = 'https://shortlink.hisokaarridho.my.id/rg1ot'
       }
       let wm_snowdendev = { url : ppgc }
       if (pea[0].announce == true) {
       snowden.send5butimg(pea[0].id, `「 *group settings change* 」\n\ngroup telah ditutup oleh admin, sekarang hanya admin yang dapat mengirim pesan !`, `group settings change message by snowden dev`, wm_snowdendev, [])
       } else if(pea[0].announce == false) {
       snowden.send5butimg(pea[0].id, `「 *group settings change* 」\n\ngroup telah dibuka oleh admin, sekarang peserta dapat mengirim pesan !`, `group settings change message by snowden dev`, wm_snowdendev, [])
       } else if (pea[0].restrict == true) {
       snowden.send5butimg(pea[0].id, `「 *group settings change* 」\n\ninfo group telah dibatasi, sekarang hanya admin yang dapat mengedit info group !`, `group settings change message by snowden dev`, wm_snowdendev, [])
       } else if (pea[0].restrict == false) {
       snowden.send5butimg(pea[0].id, `「 *group settings change* 」\n\ninfo group telah dibuka, sekarang peserta dapat mengedit info group !`, `group settings change message by snowden dev`, wm_snowdendev, [])
       } else {
       snowden.send5butimg(pea[0].id, `「 *group settings change* 」\n\ngroup subject telah diganti menjadi *${pea[0].subject}*`, `group settings change message by snowden dev`, wm_snowdendev, [])
     }
    })

    snowden.ev.on('group-participants.update', async (anu) => {
        console.log(anu)
        try {
            let metadata = await snowden.groupmetadata(anu.id)
            let participants = anu.participants
            for (let num of participants) {
                // get profile picture user
                try {
                    ppuser = await snowden.profilepictureurl(num, 'image')
                } catch {
                    ppuser = 'https://i0.wp.com/www.gambarunik.id/wp-content/uploads/2019/06/top-gambar-foto-profil-kosong-lucu-tergokil-.jpg'
                }
                
                //resize
         const resize = async(buffer, ukur1, ukur2) => {
             return new promise(async(resolve, reject) => {
             let jimp = require('jimp')
             var baper = await jimp.read(buffer);
             var ab = await baper.resize(ukur1, ukur2).getbufferasync(jimp.mime_jpeg)
             resolve(ab)
             })
             }

                // get profile picture group
                try {
                    ppgroup = await snowden.profilepictureurl(anu.id, 'image')
                } catch {
                    ppgroup = 'https://i0.wp.com/www.gambarunik.id/wp-content/uploads/2019/06/top-gambar-foto-profil-kosong-lucu-tergokil-.jpg'
                }
                
                let butwel = [{ buttonid: 'menu', buttontext: { displaytext: 'welcome' }, type: 1 }]
                let butleav = [{ buttonid: 'subsyt', buttontext: { displaytext: 'sayonara👋' }, type: 1 }]
                let butselamat = [{ buttonid: '', buttontext: { displaytext: 'selamat' }, type: 1 }]
                let butsebar = [{ buttonid: '', buttontext: { displaytext: 'sabar' }, type: 1 }]
                let nyoutube = ('© snowden\nyoutube/sc :\nhttps://youtube.com/c/snowdendev')
                let teks1 = `*halo kak @${num.split('@')[0]}*\n*selamat datang di grup*\n*${metadata.subject}*\n*jangan lupa intro yahh*\n_~admin_`
                let teks2 = `*selamat tinggal kak @${num.split('@')[0]}*\n*semoga tenang di alam sana*\n_~admin_`
                let teks3 = `*@${num.split('@')[0]} promote from*\n*${metadata.subject}*\n*selamat anda menjadi admin*\n_~jangan semena mena!_`
                let teks4 = `*@${num.split('@')[0]} demote from*\n*${metadata.subject}*\n_kasihan turun pangkat🤭_`
                if (anu.action == 'add') {
                    snowden.sendmessage(anu.id, { caption: teks1, location: { jpegthumbnail: await resize(ppuser, 100, 100)}, buttons: butwel, footer: nyoutube, mentions: [num] })
                } else if (anu.action == 'remove') {
                    snowden.sendmessage(anu.id, { caption: teks2, location: { jpegthumbnail: await resize(ppuser, 100, 100)}, buttons: butleav, footer: nyoutube, mentions: [num] })
                } else if (anu.action == 'promote') {
                    snowden.sendmessage(anu.id, { caption: teks3, location: { jpegthumbnail: await resize(ppuser, 100, 100)}, buttons: butselamat, footer: nyoutube, mentions: [num] })
                } else if (anu.action == 'demote') {
                    snowden.sendmessage(anu.id, { caption: teks4, location: { jpegthumbnail: await resize(ppuser, 100, 100)}, buttons: butsebar, footer: nyoutube, mentions: [num] })
              }
            }
        } catch (err) {
            console.log(err)
        }
    })
	
    // setting
    snowden.decodejid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            let decode = jiddecode(jid) || {}
            return decode.user && decode.server && decode.user + '@' + decode.server || jid
        } else return jid
    }
    
    snowden.ev.on('contacts.update', update => {
        for (let contact of update) {
            let id = snowden.decodejid(contact.id)
            if (store && store.contacts) store.contacts[id] = { id, name: contact.notify }
        }
    })

    snowden.getname = (jid, withoutcontact  = false) => {
        id = snowden.decodejid(jid)
        withoutcontact = snowden.withoutcontact || withoutcontact 
        let v
        if (id.endswith("@g.us")) return new promise(async (resolve) => {
            v = store.contacts[id] || {}
            if (!(v.name || v.subject)) v = snowden.groupmetadata(id) || {}
            resolve(v.name || v.subject || phonenumber('+' + id.replace('@s.whatsapp.net', '')).getnumber('international'))
        })
        else v = id === '0@s.whatsapp.net' ? {
            id,
            name: 'whatsapp'
        } : id === snowden.decodejid(snowden.user.id) ?
            snowden.user :
            (store.contacts[id] || {})
            return (withoutcontact ? '' : v.name) || v.subject || v.verifiedname || phonenumber('+' + jid.replace('@s.whatsapp.net', '')).getnumber('international')
    }
    
    snowden.sendcontact = async (jid, kon, quoted = '', opts = {}) => {
	let list = []
	for (let i of kon) {
	    list.push({
	    	displayname: await snowden.getname(i + '@s.whatsapp.net'),
	    	vcard: `begin:vcard\nversion:3.0\nn:${await snowden.getname(i + '@s.whatsapp.net')}\nfn:${await snowden.getname(i + '@s.whatsapp.net')}\nitem1.tel;waid=${i}:${i}\nitem1.x-ablabel:ponsel\nitem2.email;type=internet:snowdendev@gmail.com\nitem2.x-ablabel:email\nitem3.url:https://instagram.com/snowden.dev\nitem3.x-ablabel:instagram\nitem4.adr:;;indonesia;;;;\nitem4.x-ablabel:region\nend:vcard`
	    })
	}
	snowden.sendmessage(jid, { contacts: { displayname: `${list.length} kontak`, contacts: list }, ...opts }, { quoted })
    }
    
    snowden.setstatus = (status) => {
        snowden.query({
            tag: 'iq',
            attrs: {
                to: '@s.whatsapp.net',
                type: 'set',
                xmlns: 'status',
            },
            content: [{
                tag: 'status',
                attrs: {},
                content: buffer.from(status, 'utf-8')
            }]
        })
        return status
    }
	
    snowden.public = true

    snowden.serializem = (m) => smsg(snowden, m, store)

    snowden.ev.on('connection.update', async (update) => {
        const { connection, lastdisconnect } = update	    
        if (connection === 'close') {
        let reason = new boom(lastdisconnect?.error)?.output.statuscode
            if (reason === disconnectreason.badsession) { console.log(`bad session file, please delete session and scan again`); snowden.logout(); }
            else if (reason === disconnectreason.connectionclosed) { console.log("connection closed, reconnecting...."); startsnowden(); }
            else if (reason === disconnectreason.connectionlost) { console.log("connection lost from server, reconnecting..."); startsnowden(); }
            else if (reason === disconnectreason.connectionreplaced) { console.log("connection replaced, another new session opened, please close current session first"); snowden.logout(); }
            else if (reason === disconnectreason.loggedout) { console.log(`device logged out, please scan again and run.`); snowden.logout(); }
            else if (reason === disconnectreason.restartrequired) { console.log("restart required, restarting..."); startsnowden(); }
            else if (reason === disconnectreason.timedout) { console.log("connection timedout, reconnecting..."); startsnowden(); }
            else snowden.end(`unknown disconnectreason: ${reason}|${connection}`)
        }
        console.log('connected...', update)
    })

    snowden.ev.on('creds.update', savestate)
    
    /** resize image
      *
      * @param {buffer} buffer (only image)
      * @param {numeric} width
      * @param {numeric} height
      */
      snowden.resize = async (image, width, height) => {
       let jimp = require('jimp')
       var oyy = await jimp.read(image);
       var kiyomasa = await oyy.resize(width, height).getbufferasync(jimp.mime_jpeg)
       return kiyomasa
      }

    // add other

      /**
      *
      * @param {*} jid
      * @param {*} url
      * @param {*} caption
      * @param {*} quoted
      * @param {*} options
      */
     snowden.sendfileurl = async (jid, url, caption, quoted, options = {}) => {
      let mime = '';
      let res = await axios.head(url)
      mime = res.headers['content-type']
      if (mime.split("/")[1] === "gif") {
     return snowden.sendmessage(jid, { video: await getbuffer(url), caption: caption, gifplayback: true, ...options}, { quoted: quoted, ...options})
      }
      let type = mime.split("/")[0]+"message"
      if(mime === "application/pdf"){
     return snowden.sendmessage(jid, { document: await getbuffer(url), mimetype: 'application/pdf', caption: caption, ...options}, { quoted: quoted, ...options })
      }
      if(mime.split("/")[0] === "image"){
     return snowden.sendmessage(jid, { image: await getbuffer(url), caption: caption, ...options}, { quoted: quoted, ...options})
      }
      if(mime.split("/")[0] === "video"){
     return snowden.sendmessage(jid, { video: await getbuffer(url), caption: caption, mimetype: 'video/mp4', ...options}, { quoted: quoted, ...options })
      }
      if(mime.split("/")[0] === "audio"){
     return snowden.sendmessage(jid, { audio: await getbuffer(url), caption: caption, mimetype: 'audio/mpeg', ...options}, { quoted: quoted, ...options })
      }
      }

    /** send list messaage
      *
      *@param {*} jid
      *@param {*} text
      *@param {*} footer
      *@param {*} title
      *@param {*} buttext
      *@param [*] sections
      *@param {*} quoted
      */
        snowden.sendlistmsg = (jid, text = '', footer = '', title = '' , buttext = '', sects = [], quoted) => {
        let sections = sects
        var listmes = {
        text: text,
        footer: footer,
        title: title,
        buttontext: buttext,
        sections
        }
        snowden.sendmessage(jid, listmes, { quoted: quoted })
        }
        
        /** send button 5 location
       *
       * @param {*} jid
       * @param {*} text
       * @param {*} footer
       * @param {*} location
       * @param [*] button
       * @param {*} options
       */
      snowden.send5butloc = async (jid , text = '' , footer = '', lok, but = [], options = {}) =>{
      let bb = await snowden.resize(lok, 300, 300)
      snowden.sendmessage(jid, { location: { jpegthumbnail: bb }, caption: text, footer: footer, templatebuttons: but, ...options })
      }

    /** send button 5 message
     * 
     * @param {*} jid
     * @param {*} text
     * @param {*} footer
     * @param {*} button
     * @returns 
     */
        snowden.send5butmsg = (jid, text = '' , footer = '', but = []) =>{
        let templatebuttons = but
        var templatemessage = {
        text: text,
        footer: footer,
        templatebuttons: templatebuttons
        }
        snowden.sendmessage(jid, templatemessage)
        }

    /** send button 5 image
     *
     * @param {*} jid
     * @param {*} text
     * @param {*} footer
     * @param {*} image
     * @param [*] button
     * @param {*} options
     * @returns
     */
    snowden.send5butimg = async (jid , text = '' , footer = '', img, but = [], options = {}) =>{
        let message = await preparewamessagemedia({ image: img }, { upload: snowden.wauploadtoserver })
        var template = generatewamessagefromcontent(jid, proto.message.fromobject({
        templatemessage: {
        hydratedtemplate: {
        imagemessage: message.imagemessage,
               "hydratedcontenttext": text,
               "hydratedfootertext": footer,
               "hydratedbuttons": but
            }
            }
            }), options)
            snowden.relaymessage(jid, template.message, { messageid: template.key.id })
    }

    /** send button 5 video
     *
     * @param {*} jid
     * @param {*} text
     * @param {*} footer
     * @param {*} video
     * @param [*] button
     * @param {*} options
     * @returns
     */
    snowden.send5butvid = async (jid , text = '' , footer = '', vid, but = [], options = {}) =>{
        let message = await preparewamessagemedia({ video: vid }, { upload: snowden.wauploadtoserver })
        var template = generatewamessagefromcontent(jid, proto.message.fromobject({
        templatemessage: {
        hydratedtemplate: {
        videomessage: message.videomessage,
               "hydratedcontenttext": text,
               "hydratedfootertext": footer,
               "hydratedbuttons": but
            }
            }
            }), options)
            snowden.relaymessage(jid, template.message, { messageid: template.key.id })
    }

    /** send button 5 gif
     *
     * @param {*} jid
     * @param {*} text
     * @param {*} footer
     * @param {*} gif
     * @param [*] button
     * @param {*} options
     * @returns
     */
    snowden.send5butgif = async (jid , text = '' , footer = '', gif, but = [], options = {}) =>{
        let message = await preparewamessagemedia({ video: gif, gifplayback: true }, { upload: snowden.wauploadtoserver })
        var template = generatewamessagefromcontent(jid, proto.message.fromobject({
        templatemessage: {
        hydratedtemplate: {
        videomessage: message.videomessage,
               "hydratedcontenttext": text,
               "hydratedfootertext": footer,
               "hydratedbuttons": but
            }
            }
            }), options)
            snowden.relaymessage(jid, template.message, { messageid: template.key.id })
    }

    /**
     * 
     * @param {*} jid 
     * @param {*} buttons 
     * @param {*} caption 
     * @param {*} footer 
     * @param {*} quoted 
     * @param {*} options 
     */
    snowden.sendbuttontext = (jid, buttons = [], text, footer, quoted = '', options = {}) => {
        let buttonmessage = {
            text,
            footer,
            buttons,
            headertype: 2,
            ...options
        }
        snowden.sendmessage(jid, buttonmessage, { quoted, ...options })
    }
    
    /**
     * 
     * @param {*} jid 
     * @param {*} text 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    snowden.sendtext = (jid, text, quoted = '', options) => snowden.sendmessage(jid, { text: text, ...options }, { quoted })

    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} caption 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    snowden.sendimage = async (jid, path, caption = '', quoted = '', options) => {
	let buffer = buffer.isbuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getbuffer(path)) : fs.existssync(path) ? fs.readfilesync(path) : buffer.alloc(0)
        return await snowden.sendmessage(jid, { image: buffer, caption: caption, ...options }, { quoted })
    }

    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} caption 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    snowden.sendvideo = async (jid, path, caption = '', quoted = '', gif = false, options) => {
        let buffer = buffer.isbuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getbuffer(path)) : fs.existssync(path) ? fs.readfilesync(path) : buffer.alloc(0)
        return await snowden.sendmessage(jid, { video: buffer, caption: caption, gifplayback: gif, ...options }, { quoted })
    }

    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} quoted 
     * @param {*} mime 
     * @param {*} options 
     * @returns 
     */
    snowden.sendaudio = async (jid, path, quoted = '', ptt = false, options) => {
        let buffer = buffer.isbuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getbuffer(path)) : fs.existssync(path) ? fs.readfilesync(path) : buffer.alloc(0)
        return await snowden.sendmessage(jid, { audio: buffer, ptt: ptt, ...options }, { quoted })
    }

    /**
     * 
     * @param {*} jid 
     * @param {*} text 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    snowden.sendtextwithmentions = async (jid, text, quoted, options = {}) => snowden.sendmessage(jid, { text: text, contextinfo: { mentionedjid: [...text.matchall(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net') }, ...options }, { quoted })

    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    snowden.sendimageassticker = async (jid, path, quoted, options = {}) => {
        let buff = buffer.isbuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getbuffer(path)) : fs.existssync(path) ? fs.readfilesync(path) : buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeexifimg(buff, options)
        } else {
            buffer = await imagetowebp(buff)
        }

        await snowden.sendmessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
        return buffer
    }

    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    snowden.sendvideoassticker = async (jid, path, quoted, options = {}) => {
        let buff = buffer.isbuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getbuffer(path)) : fs.existssync(path) ? fs.readfilesync(path) : buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeexifvid(buff, options)
        } else {
            buffer = await videotowebp(buff)
        }

        await snowden.sendmessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
        return buffer
    }
	
    /**
     * 
     * @param {*} message 
     * @param {*} filename 
     * @param {*} attachextension 
     * @returns 
     */
    snowden.downloadandsavemediamessage = async (message, filename, attachextension = true) => {
        let quoted = message.msg ? message.msg : message
        let mime = (message.msg || message).mimetype || ''
        let messagetype = message.mtype ? message.mtype.replace(/message/gi, '') : mime.split('/')[0]
        const stream = await downloadcontentfrommessage(quoted, messagetype)
        let buffer = buffer.from([])
        for await(const chunk of stream) {
            buffer = buffer.concat([buffer, chunk])
        }
	let type = await filetype.frombuffer(buffer)
        truefilename = attachextension ? (filename + '.' + type.ext) : filename
        // save to file
        await fs.writefilesync(truefilename, buffer)
        return truefilename
    }

    snowden.downloadmediamessage = async (message) => {
        let mime = (message.msg || message).mimetype || ''
        let messagetype = message.mtype ? message.mtype.replace(/message/gi, '') : mime.split('/')[0]
        const stream = await downloadcontentfrommessage(message, messagetype)
        let buffer = buffer.from([])
        for await(const chunk of stream) {
            buffer = buffer.concat([buffer, chunk])
	}
        
	return buffer
     } 
    
    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} filename
     * @param {*} caption
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    snowden.sendmedia = async (jid, path, filename = '', caption = '', quoted = '', options = {}) => {
        let types = await snowden.getfile(path, true)
           let { mime, ext, res, data, filename } = types
           if (res && res.status !== 200 || file.length <= 65536) {
               try { throw { json: json.parse(file.tostring()) } }
               catch (e) { if (e.json) throw e.json }
           }
       let type = '', mimetype = mime, pathfile = filename
       if (options.asdocument) type = 'document'
       if (options.assticker || /webp/.test(mime)) {
        let { writeexif } = require('./lib/exif')
        let media = { mimetype: mime, data }
        pathfile = await writeexif(media, { packname: options.packname ? options.packname : global.packname, author: options.author ? options.author : global.author, categories: options.categories ? options.categories : [] })
        await fs.promises.unlink(filename)
        type = 'sticker'
        mimetype = 'image/webp'
        }
       else if (/image/.test(mime)) type = 'image'
       else if (/video/.test(mime)) type = 'video'
       else if (/audio/.test(mime)) type = 'audio'
       else type = 'document'
       await snowden.sendmessage(jid, { [type]: { url: pathfile }, caption, mimetype, filename, ...options }, { quoted, ...options })
       return fs.promises.unlink(pathfile)
       }

    /**
     * 
     * @param {*} jid 
     * @param {*} message 
     * @param {*} forceforward 
     * @param {*} options 
     * @returns 
     */
    snowden.copynforward = async (jid, message, forceforward = false, options = {}) => {
        let vtype
		if (options.readviewonce) {
			message.message = message.message && message.message.ephemeralmessage && message.message.ephemeralmessage.message ? message.message.ephemeralmessage.message : (message.message || undefined)
			vtype = object.keys(message.message.viewoncemessage.message)[0]
			delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
			delete message.message.viewoncemessage.message[vtype].viewonce
			message.message = {
				...message.message.viewoncemessage.message
			}
		}

        let mtype = object.keys(message.message)[0]
        let content = await generateforwardmessagecontent(message, forceforward)
        let ctype = object.keys(content)[0]
		let context = {}
        if (mtype != "conversation") context = message.message[mtype].contextinfo
        content[ctype].contextinfo = {
            ...context,
            ...content[ctype].contextinfo
        }
        const wamessage = await generatewamessagefromcontent(jid, content, options ? {
            ...content[ctype],
            ...options,
            ...(options.contextinfo ? {
                contextinfo: {
                    ...content[ctype].contextinfo,
                    ...options.contextinfo
                }
            } : {})
        } : {})
        await snowden.relaymessage(jid, wamessage.message, { messageid:  wamessage.key.id })
        return wamessage
    }

    snowden.cmod = (jid, copy, text = '', sender = snowden.user.id, options = {}) => {
        //let copy = message.tojson()
		let mtype = object.keys(copy.message)[0]
		let isephemeral = mtype === 'ephemeralmessage'
        if (isephemeral) {
            mtype = object.keys(copy.message.ephemeralmessage.message)[0]
        }
        let msg = isephemeral ? copy.message.ephemeralmessage.message : copy.message
		let content = msg[mtype]
        if (typeof content === 'string') msg[mtype] = text || content
		else if (content.caption) content.caption = text || content.caption
		else if (content.text) content.text = text || content.text
		if (typeof content !== 'string') msg[mtype] = {
			...content,
			...options
        }
        if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
		else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
		if (copy.key.remotejid.includes('@s.whatsapp.net')) sender = sender || copy.key.remotejid
		else if (copy.key.remotejid.includes('@broadcast')) sender = sender || copy.key.remotejid
		copy.key.remotejid = jid
		copy.key.fromme = sender === snowden.user.id

        return proto.webmessageinfo.fromobject(copy)
    }


    /**
     * 
     * @param {*} path 
     * @returns 
     */
    snowden.getfile = async (path, save) => {
        let res
        let data = buffer.isbuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (res = await getbuffer(path)) : fs.existssync(path) ? (filename = path, fs.readfilesync(path)) : typeof path === 'string' ? path : buffer.alloc(0)
        //if (!buffer.isbuffer(data)) throw new typeerror('result is not a buffer')
        let type = await filetype.frombuffer(data) || {
            mime: 'application/octet-stream',
            ext: '.bin'
        }
        filename = path.join(__filename, '../src/' + new date * 1 + '.' + type.ext)
        if (data && save) fs.promises.writefile(filename, data)
        return {
            res,
            filename,
	    size: await getsizemedia(data),
            ...type,
            data
        }

    }

    return snowden
}

startsnowden()


let file = require.resolve(__filename)
fs.watchfile(file, () => {
	fs.unwatchfile(file)
	console.log(chalk.redbright(`update ${__filename}`))
	delete require.cache[file]
	require(file)
})
