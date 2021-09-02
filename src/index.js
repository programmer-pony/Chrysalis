const { Client, Intents, Collection, MessageEmbed, MessageButton, MessageActionRow, MessageAttachment } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.DIRECT_MESSAGES] });
const colors = require('colors');
require('dotenv').config();
const path = require('path');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
const dbURL = process.env.DB_URL;
const Canvas = require('canvas');
const defaultColor = "#245128";
const defaultModules = require('./defaultModules.json').modules;
const presence = require('./presence.json');

// Fetch servers and set Rich Presence
client.on('ready', () => {
	console.log(colors.bgWhite.black(`Bot started as ${client.user.tag}`));
  for (guild of client.guilds.cache) {
    client.guilds.fetch(guild[0],{force:true}).then(console.log(`${guild[1].name} fetched`));
  }
	client.user.setPresence(presence)
	console.log(colors.bgWhite.black(`Ready!`));
});

// Load commands
client.commands = new Collection();
let commands = fs.readdirSync(path.resolve(__dirname, 'commands')).filter((f) => f.endsWith(".js"));
for (var jsfile of commands) {
	let commandfile = require("./commands/"+jsfile);
	client.commands.set(commandfile.name, commandfile);
	console.log(jsfile+" loaded");
}

client.on('guildCreate', (guild) => {
  console.log("Client joined guild with ID "+guild.id)
  createGuild(guild.id);
});

client.on('messageCreate', async (message) => {

	showChatInConsole(message);

	if (message.guild == null) return; // Ignore if message is a DM
	if (message.author.bot) return;

  // Send help if bot is tagged
  if (message.content == `<@!${client.user.id}>` || message.content == `<@${client.user.id}>`) await sendHelp(message);

	// Check the suggestions channel (if enabled)
  checkSuggestion(message);

	// Blocked / Banned Words
	if (await bannedWords(message)) return;

	// Execute command
  command(message);

});

client.on('messageUpdate', (oldMessage, newMessage) => {
	sendEditedMessage(oldMessage, newMessage);
  bannedWords(newMessage);
});

client.on('messageDelete', (message) => {
	if (message.author.id == client.user.id) return;
	sendDeletedMessage(message);
});

client.on('guildMemberAdd', async (member) => {

	const langstr = await getLang(member.guild.id);
  const lang = require(`./lang/${langstr}.json`);

	const user = member.user;

	const guildID = member.guild.id;
	const db = new MongoClient(dbURL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	await db.connect();
	const dbo = db.db("chrysalis");
	const guilds = dbo.collection("guilds");
	const guild = await guilds.findOne({id: guildID});
	db.close();
	if (guild==null) return;
	const modules = guild.modules;
	if (modules == null) return;
	const welcome = modules.find((c) => c.name == 'welcome');
	if (welcome == null) return;
	if (!welcome.enabled) return;
	const bgURL = welcome.background;


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
	ctx.fillText(`${user.username.length > 21 ? user.username.toUpperCase().substring(0,18)+'...' : user.username.toUpperCase()}#${user.discriminator}`, canvas.width/2, canvas.height/2+180);
	ctx.font = '96px Montserrat Black';
	ctx.fillText(lang.welcome.toUpperCase(), canvas.width/2, canvas.height/2+136);
	ctx.font = '36px Montserrat Black';
	ctx.fillText(lang.you_are_the_member_n.toUpperCase().replace('{0}',member.guild.memberCount), canvas.width/2, canvas.height/2+220);

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
	const channel = client.channels.cache.find(channel => channel.id == welcome.channel)
	if (channel != null) {
		if (!channel.permissionsFor(client.user.id).has('SEND_MESSAGES')) return;
		if (!channel.permissionsFor(client.user.id).has('ATTACH_FILES')) return;
		if (welcome.message == null) welcome.message = 'default';
		if (welcome.message == 'off' || welcome.message.trim() == '' || welcome.message == 'none' || welcome.message == 'null' || welcome.message == 'false') {
			channel.send({files: [attachment]});
		} else {
			if (welcome.message == 'default') welcome.message = lang.welcome_to_guild;
			channel.send({content: welcome.message.replaceAll('{user}',member).replaceAll('{guild}',member.guild.name), files: [attachment]});
		}
	}
});

client.on('guildMemberRemove', async (member) => {

	const langstr = await getLang(member.guild.id);
  const lang = require(`./lang/${langstr}.json`);

	const user = member.user;

	const guildID = member.guild.id;
	const db = new MongoClient(dbURL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	await db.connect();
	const dbo = db.db("chrysalis");
	const guilds = dbo.collection("guilds");
	const guild = await guilds.findOne({id: guildID});
	db.close();
	if (guild==null) return;
	const modules = guild.modules;
	if (modules == null) return;
	const goodbye = modules.find((c) => c.name == 'goodbye');
	if (goodbye == null) return;
	if (!goodbye.enabled) return;

	const channel = client.channels.cache.find(channel => channel.id == goodbye.channel)
	if (channel != null) {
		if (goodbye.message == null || goodbye.message.trim() == '') goodbye.message = 'default';
		if (goodbye.message == 'default') goodbye.message = lang.goodbye_user;
		channel.send(goodbye.message.replaceAll('{user}',user.tag).replaceAll('{guild}',member.guild.name));
	}
});

client.on('guildMemberUpdate', (oldMember, newMember) => {
  if (oldMember.premiumSinceTimestamp == 0 && newMember.premiumSinceTimestamp!=0)
	boostEmbed(newMember);
});

client.on('interactionCreate', async (i) => {
	if (!i.isButton()) return;
	if (i.guild == null) return i.deferUpdate();
	if (!i.customId.startsWith("role-")) return;
	if (!i.guild.me.permissions.has('MANAGE_ROLES')) return;
	i.deferUpdate();
	let roleID = i.customId.replace("role-", "");
	if (!i.member) i.member = await i.guild.members.fetch(i.user.id);
	await i.member.fetch(true);
	if (i.guild.me.roles.highest.position < i.guild.roles.cache.get(roleID).position) {
		const langstr = await getLang(i.guild.id);
	  const lang = require(`./lang/${langstr}.json`);
		return i.user.send(lang.chrysalis_role_too_low);
	}
	if (!i.member.roles.cache.get(roleID)) i.member.roles.add(roleID);
	else i.member.roles.remove(roleID);

});

client.login(process.env.DISCORD_TOKEN);

async function getPrefix(guildID) {
  const db = new MongoClient(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await db.connect();
  const dbo = db.db("chrysalis");
  const guilds = dbo.collection("guilds");
  const guild = await guilds.findOne({id: guildID});
	db.close();
  if (guild==null) {
    await createGuild(guildID);
    return "c!";
  } else {
    if (guild.prefix == null) return "c!";
    return guild.prefix;
  }
}

async function getLang(guildID) {
  const db = new MongoClient(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await db.connect();
  const dbo = db.db("chrysalis");
  const guilds = dbo.collection("guilds");
  const guild = await guilds.findOne({id: guildID});
	db.close();
  if (guild==null) {
		await createGuild(guildID);
		return "en";
	}
  else {
    if (guild.lang == null) return "en";
    return guild.lang;
  }
}

async function getColor(guildID) {
  const db = new MongoClient(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await db.connect();
  const dbo = db.db("chrysalis");
  const guilds = dbo.collection("guilds");
  const guild = await guilds.findOne({id: guildID});
	db.close();
  if (guild==null) {
		await createGuild(guildID);
		return defaultColor;
	}
  else {
    if (guild.color == null) return defaultColor;
    return guild.color;
  }
}

async function isRestricted(command, message) {
  const guildID = message.guild.id
  const channelID = message.channel.id
  const db = new MongoClient(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await db.connect();
  const dbo = db.db("chrysalis");
  const guilds = dbo.collection("guilds");
  const guild = await guilds.findOne({id: guildID});
	if (guild==null) {
		await createGuild(message.guild.id);
		return false;
	}
  const modules = guild.modules;
  if (modules==null) {
    await guilds.updateOne({id: guildID},{ $set: { modules: [{"name":command,"enabled":true,"restricted":false,"allowedChannels":[]}]}})
    db.close();
    return false;
  } else {
    const cmdModule = modules.find((c) => c.name == command);
    if (cmdModule==null) {
			const defaultModules = require('./defaultModules.json').modules;
      moduleModel = defaultModules.find((c) => c.name == command);
      modules.push(moduleModel);
      await guilds.updateOne({id: guildID},{ $set: { modules: modules}});
      db.close();
      return false;
    } else {
      if (!cmdModule.enabled) return true;
      if (cmdModule.restricted) {
        db.close();
        return (cmdModule.allowedChannels.indexOf(channelID) == -1);
      } else {
        db.close();
        return false;
      }
    }
  }
}

async function showChatInConsole(message) {
  var d = new Date();
  var h = d.getHours();
  var m = d.getMinutes();
  if (m<10) m = "0"+m;
  var channel;
  if (message.guild== null) channel = "DM";
  else channel = `${message.guild.name} | ${message.channel.name}`;
	if (message.content !="") {
		console.log(colors.gray(`${h}:${m} | ${channel} | ${message.author.tag}: ${message.content}`));
	} else {
		console.log(colors.gray(`${h}:${m} | ${channel} | ${message.author.tag}: (Image)`));
	}
}

async function command(message) {

  if (!message.channel.permissionsFor(client.user.id).has('SEND_MESSAGES')) return;

  const prefix = await getPrefix(message.guild.id);
  const langstr = await getLang(message.guild.id);
  const lang = require(`./lang/${langstr}.json`);

  if (message.content.startsWith(prefix)) {
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    let cmd = client.commands.get(command) || client.commands.find((c) => c.alias.includes(command));
    if (cmd) {
      var restricted = false;
      if (!cmd.admin) restricted = await isRestricted(cmd.name, message);
			else if (!message.member.permissions.has('ADMINISTRATOR')) return;
      if (restricted) {
        message.author.send(lang.wrong_channel);
        if (!message.deleted && message.channel.permissionsFor(client.user.id).has('MANAGE_MESSAGES')) message.delete();
      } else {
        const color = await getColor(message.guild.id)
        cmd.run(client, message, command, args, prefix, color, langstr);
      }
    }
  }
}

async function bannedWords(message) {

	if (message.member == null) return;
  if (message.member.permissions.has('ADMINISTRATOR')) return;
  if (!message.channel.permissionsFor(client.user.id).has('MANAGE_MESSAGES')) return;

  const langstr = await getLang(message.guild.id);
  const lang = require(`./lang/${langstr}.json`);

  const guildID = message.guild.id
  const channelID = message.channel.id
  const db = new MongoClient(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await db.connect();
  const dbo = db.db("chrysalis");
  const guilds = dbo.collection("guilds");
  const guild = await guilds.findOne({id: guildID});
  if (guild == null) {
    await createGuild(message.guild.id);
    db.close();
    return false;
  } else {
    const modules = guild.modules
    if (modules==null) {
			db.close();
			return false;
		} else {
      const bannedwords = modules.find((c) => c.name == "bannedwords");
      const logs = modules.find((c) => c.name == "logs");
			db.close();
      if (bannedwords == null) return false;
      if (logs == null) return false;
      for (word of bannedwords.words) {
        if (message.content.toLowerCase().includes(word.toLowerCase())) {
          message.author.send(lang.message_deleted_dm);
          message.delete();
					return true;
        }
        if (message.attachments.size>0) {
          for (word of bannedwords.words) {
            for (attachment of message.attachments) {
              if (attachment[1].name.toLowerCase().includes(word.toLowerCase())) {
                message.author.send(lang.message_deleted_dm);
                message.delete();
                return true;
              }
        		}
          }
        }
      }
			return false;
    }
  }
}

async function sendHelp(message) {

  if (!message.channel.permissionsFor(client.user.id).has('SEND_MESSAGES')) return;

	const langstr = await getLang(message.guild.id);
  const lang = require(`./lang/${langstr}.json`);

	const embed = new MessageEmbed()
		.setTitle('Chrysalis')
		.setThumbnail(client.user.displayAvatarURL())
		.setDescription(`[${lang.invite_the_bot}](https://discord.com/api/oauth2/authorize?client_id=797161820594634762&permissions=8&scope=bot%20applications.commands) | [${lang.website}](https://giorgioproductions.es/Chrysalis/) | [${lang.support_server}](https://discord.gg/Vj2jYQKaJP)`)
		.setColor(await getColor(message.guild.id))
		.addField('💻 GitHub','[Source Code](https://github.com/GiorgioProductions/Chrysalis)',true)
		.addField(`💞 ${lang.support_the_project}`,'[Buy me a Coffe](https://ko-fi.com/giorgioproductions)',true)
		.setFooter(`${lang.the_current_prefix_for_this_server_is} ${await getPrefix(message.guild.id)}`)
	message.channel.send({embeds:[embed]});
}

async function boostEmbed(newMember) {

  const langstr = await getLang(newMember.guild.id);
  const lang = require(`./lang/${langstr}.json`);

  const guildID = newMember.guild.id;
  const db = new MongoClient(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await db.connect();
  const dbo = db.db("chrysalis");
  const guilds = dbo.collection("guilds");
  const guild = await guilds.findOne({id: guildID});
  db.close();
  if (guild==null) return;
  const modules = guild.modules;
  if (modules==null) return;
  const nitro = modules.find((c) => c.name == "nitro");
  if (nitro==null) return;
  if (nitro.enabled && nitro.channel!="") {
			boosterRole = newMember.guild.roles.premiumSubscriberRole;
			if (boosterRole == null) embedColor = "#db6de2";
			else embedColor = boosterRole.color;
      const emoji = client.emojis.cache.find(emoji => emoji.name == "NitroBoost");
      boostembed = new MessageEmbed()
      	.setTitle(`${lang.boost_title}`)
      	.setDescription(`<a:${emoji.name}:${emoji.id}> ${lang.boost_description} <a:${emoji.name}:${emoji.id}>`)
      	.setThumbnail(newMember.user.displayAvatarURL())
      	.setColor(embedColor)
      const channel = client.channels.cache.find(channel => channel.id == nitro.channel)
			if (channel!=null) channel.send({content:`${lang.boost_message.replace("{0}",newMember.user)}`,embeds:[boostembed]});
  }
}

async function createGuild(guildID) {
  const db = new MongoClient(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await db.connect();
  const dbo = db.db("chrysalis");
  const guilds = dbo.collection("guilds");
  const guild = await guilds.findOne({id: guildID});
  if (guild==null) {
    await guilds.insertOne({
      id: guildID,
			lang: "en",
      prefix: "c!",
			nsfw: true,
      color: defaultColor,
      modules: defaultModules
    });
		console.log('Created guild with ID '+guildID);
  }
  db.close();
}

async function checkSuggestion(message) {
  const guildID = message.guild.id;
  const db = new MongoClient(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await db.connect();
  const dbo = db.db("chrysalis");
  const guilds = dbo.collection("guilds");
  const guild = await guilds.findOne({id: guildID});
  db.close();
  if (guild==null) return;
  else {
    const modules = guild.modules;
    if (modules==null) return;
    else {
      const suggestions = modules.find((c) => c.name == "suggestions");
      if (suggestions==null) return;
      else {
        if (suggestions.enabled) {
          if (suggestions.channel!="") {
            if (message.channel.id == suggestions.channel) {
              if (message.content.includes("http://") || message.content.includes("https://") || message.attachments.size>0) {
                message.react("✅");
                message.react("❌");
              }
            }
          }
        }
      }
    }
  }
}

async function sendDeletedMessage(message) {

	const langstr = await getLang(message.guild.id);
  const lang = require(`./lang/${langstr}.json`);

	const color = await getColor(message.guild.id);

	const guildID = message.guild.id
  const channelID = message.channel.id

	if (guildID == null || guildID == '') return;

  const db = new MongoClient(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await db.connect();
  const dbo = db.db("chrysalis");
  const guilds = dbo.collection("guilds");
  const guild = await guilds.findOne({id: guildID});
	if (guild == null) {
    await createGuild(message.guild.id);
    db.close();
    return sendDeletedMessage(message);
  } else {
		const modules = guild.modules;
    if (modules==null) return db.close();
		const logs = modules.find((c) => c.name == 'logs');
		if (logs == null) {
			modules.push({"name":"logs","enabled":true,"channel":""});
      await guilds.updateOne({id: guildID},{ $set: { modules: modules}});
			db.close();
			return sendDeletedMessage(message);
		} else {
			if (logs.enabled && logs.channel != "") {
				const embed = new MessageEmbed()
					.setTitle(lang.message_deleted)
					.setAuthor(`${message.author.username}#${message.author.discriminator}`,message.author.displayAvatarURL())
					.setColor(color)
					.addField(lang.author,`<@!${message.author.id}>`)

				if (message.content != null && message.content != "")
				embed.addField(lang.message,message.content.substring(0,1024));

				if (message.attachments.size>0)
				embed.addField(lang.attachments,message.attachments.map(a => a.name.substring(0,1024)).toString().split(',').join('\n'));

				embed.addField(lang.message_id, message.id);

  			embed.addField(lang.channel,`${message.channel} [${lang.jump_to_moment}](${message.url})`)

				const channel = client.channels.cache.find(channel => channel.id == logs.channel);
				if (channel != null && channel != "" && channel.guild.id == message.guild.id)
				channel.send({embeds:[embed]});
			}
		}
	}

}

async function sendEditedMessage(oldMessage, newMessage) {

	if (oldMessage.attachments.size == newMessage.attachments.size && oldMessage.content == newMessage.content) return;

	const langstr = await getLang(newMessage.guild.id);
  const lang = require(`./lang/${langstr}.json`);

	const color = await getColor(newMessage.guild.id);

	const guildID = newMessage.guild.id
  const channelID = newMessage.channel.id

	if (guildID == null || guildID == '') return;

  const db = new MongoClient(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await db.connect();
  const dbo = db.db("chrysalis");
  const guilds = dbo.collection("guilds");
  const guild = await guilds.findOne({id: guildID});
	if (guild == null) {
    await createGuild(newMessage.guild.id);
    db.close();
    return sendEditedMessage(oldMessage, newMessage);
  } else {
		const modules = guild.modules;
    if (modules==null) return db.close();
		const logs = modules.find((c) => c.name == 'logs');
		if (logs == null) {
			modules.push({"name":"logs","enabled":true,"channel":""});
      await guilds.updateOne({id: guildID},{ $set: { modules: modules}});
			db.close();
			return sendEditedMessage(oldMessage, newMessage);
		} else {
			if (logs.enabled && logs.channel != "") {
				const embed = new MessageEmbed()
					.setTitle(lang.message_edited)
					.setAuthor(`${newMessage.author.username}#${newMessage.author.discriminator}`,newMessage.author.displayAvatarURL())
					.setColor(color)
					.addField(lang.author,`<@!${newMessage.author.id}>`)

				if (oldMessage.content != newMessage.content) {

					if (oldMessage.content != null && oldMessage.content != "") {
						embed.addField(lang.old_message,oldMessage.content.substring(0,1024));
					}

					if (newMessage.content != null && newMessage.content != "") {
						embed.addField(lang.new_message,newMessage.content.substring(0,1024));
					}

				}

				if (oldMessage.attachments.size>0 && oldMessage.attachments.size != newMessage.attachments.size) {
					embed.addField(lang.old_attachments,oldMessage.attachments.map(a => a.name.substring(0,1024)).toString().split(',').join('\n'));
					if (newMessage.attachments.size>0) embed.addField(lang.new_attachments,oldMessage.attachments.map(a => a.name.substring(0,1024)).toString().split(',').join('\n'));
				}

				embed.addField(lang.message_id, newMessage.id);

  			embed.addField(lang.channel,`${newMessage.channel} [${lang.jump_to_moment}](${newMessage.url})`)

				const channel = client.channels.cache.find(channel => channel.id == logs.channel);
				if (channel != null && channel != "" && channel.guild.id == newMessage.guild.id)
				channel.send({embeds:[embed]});
			}
		}
	}

}
