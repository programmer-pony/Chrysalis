const { MessageEmbed, MessageAttachment } = require('discord.js');
var MongoClient = require('mongodb').MongoClient;
const dbURL = process.env.DB_URL;
const Canvas = require('canvas');
const { fillTextWithTwemoji } = require('node-canvas-with-twemoji-and-discord-emoji');

module.exports = {
  name: "welcome",
  alias: ["welcome-image","greeting","greeting-image"],
  admin: true,
  run: async (client, message, command, args, prefix, color, lang) => {

    if (!message.channel.permissionsFor(client.user.id).has('ATTACH_FILES')) return message.reply(lang.attach_files_permission_missing);

    var taggedUser = args[0];
    if (taggedUser!=null) {
      var user = await message.guild.members.cache.get(taggedUser);
      if (taggedUser.includes("<@!")) taggedUser = taggedUser.substring(3,taggedUser.length-1);
      if (taggedUser.startsWith("<@")) taggedUser = taggedUser.substring(2,taggedUser.length-1);
      try {
        user ??= await client.users.fetch(taggedUser);
      } catch (e) {
        if (message.author) return message.reply(lang.couldn_t_find_that_user);
        else return message.editReply(lang.couldn_t_find_that_user);
      }
    }
    user ??= message.member;
    if (user.user!=null) user = user.user;

    const guildID = message.guild.id;
    const db = new MongoClient(dbURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await db.connect();
    const dbo = db.db("chrysalis");
    const guilds = dbo.collection("guilds");
    const guild = await guilds.findOne({id: guildID});
    if (guild==null) return db.close();
    const modules = guild.modules;
    if (modules == null) return db.close();
    const welcome = modules.find((c) => c.name == 'welcome');
    if (welcome == null) {
      const defaultModules = require('../defaultModules.json').modules;
      moduleModel = defaultModules.find((c) => c.name == 'welcome');
      modules.push(moduleModel);
      await guilds.updateOne({id: guildID},{ $set: { modules: modules}});
      bgURL = '';
    } else bgURL = welcome.background;
    db.close();

    // Create canvas
    const canvas = Canvas.createCanvas(960,540);
    const ctx = canvas.getContext('2d');

    // Set background image (if any)
    if (bgURL!=null && bgURL!='') {
      try {
        const bg = await Canvas.loadImage(bgURL);
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
      } catch (e) {/* Image URL is invalid */}
    }

    // Text
    Canvas.registerFont('./src/fonts/Montserrat-Black.ttf',{ family: 'Montserrat', weight: 'Black' });
    ctx.font = '48px Montserrat Black';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.shadowColor = "rgba(0,0,0,1)";
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 10;
    await fillTextWithTwemoji(ctx, `${user.username.length > 21 ? user.username.toUpperCase().substring(0,18)+'...' : user.username.toUpperCase()}#${user.discriminator}`, canvas.width/2, canvas.height/2+180);
    ctx.font = '96px Montserrat Black';
    ctx.fillText(lang.welcome.toUpperCase(), canvas.width/2, canvas.height/2+136);
    ctx.font = '36px Montserrat Black';
    ctx.fillText(lang.you_are_the_member_n.toUpperCase().replace('{0}',message.guild.memberCount), canvas.width/2, canvas.height/2+220);

    // Profile picture
    const radius = 128;
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height/2-80, radius, 0, Math.PI * 2, true);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = '15';
    ctx.stroke();
    ctx.closePath();
    ctx.clip();
    const avatar = await user.displayAvatarURL({format: 'png'}) + "?size=1024";
    try {
      pfp = await Canvas.loadImage(avatar);
      ctx.drawImage(pfp, canvas.width/2-radius, canvas.height/2-radius-80, radius*2, radius*2);
    } catch (e) {
      /* Thank you Discord API for being trash */
    }

    // Send the image
    const attachment = new MessageAttachment(canvas.toBuffer(), 'welcome.png');
    if (message.author) message.channel.send({files: [attachment]});
    else message.editReply({files: [attachment]});

  }

}
