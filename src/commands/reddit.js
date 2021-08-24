const { MessageEmbed } = require('discord.js');
const fetch = require("node-fetch");
var lang = require('../lang/en.json');
var MongoClient = require('mongodb').MongoClient;
const dbURL = process.env.DB_URL;

module.exports = {
  name: "reddit",
  alias: ["yiff","furry","meme"],
  admin: false,
  run: (client, message, command, args, prefix, color, langstr) => {

    lang = require(`../lang/${langstr}.json`);

	  if (command == "reddit") return;
    var nsfw = new Array;
    nsfw = ["yiff"];
    const isnsfw = nsfw.find((c) => c.includes(command));
    if (isnsfw) {
      checkNSFW(command, message, color);
    }
    else {
      getReddit(client, command, message, color);
	  }
  }
}

function getReddit(client, query, message, color) {
  message.channel.sendTyping();
  if (!message.deleted && message.channel.permissionsFor(client.user.id).has('MANAGE_MESSAGES')) message.delete();
	fetch('https://www.reddit.com/r/' + query + '.json?limit=100&?sort=top&t=all')
    .then(res => res.json())
    .then(json => json.data.children.map(v => v.data.url))
    .then(urls => postReddit(query, message, urls, color));
}

function postReddit(query, message, urls, color) {
	const randomURL = urls[Math.floor(Math.random() * urls.length) + 1];
	try {
		if (randomURL.endsWith("gif") || randomURL.endsWith("jpg") || randomURL.endsWith("png")) {
	  	const embed = new MessageEmbed()
			.setAuthor("/r/"+query,"https://i.redd.it/qupjfpl4gvoy.jpg","https://reddit.com/r/"+query)
			.setImage(randomURL)
			.setColor(color)
			.setURL(randomURL)
			.setTitle(randomURL)
			.setDescription(`${lang.requested_by} ${message.author.toString()}`)
			.setFooter(lang.how_to_delete);
				message.channel.send({embeds:[embed]}).then(sentEmbed => {
    		  sentEmbed.react("❤️");
    			sentEmbed.react("❌");
          sentEmbed.createReactionCollector().on('collect', (r, u) => {
            if (r.emoji.name != '❌') return;
            if (r.count > 2 || u.id == message.author.id) {
              if (!sentEmbed.deleted) sentEmbed.delete();
              if (!message.deleted && message.channel.permissionsFor(client.user.id).has('MANAGE_MESSAGES')) message.delete();
            }
          });
    		});
		} else {
			console.log('Image format is not supported. Choosing another image...');
			postReddit(query, message, urls, color);
		}
	} catch (e) {
			console.log('Image not found. Retrying...');
			postReddit(query, message, urls, color);
	}

}

async function checkNSFW(command, message, color) {
  const guildID = message.guild.id;
  const db = new MongoClient(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await db.connect();
  const dbo = db.db("chrysalis");
  const guilds = dbo.collection("guilds");
  const guild = await guilds.findOne({id: guildID});
  if (guild.nsfw == null || guild.nsfw == "") {
    await guilds.updateOne({id: guildID},{ $set: { nsfw: true}});
    guild.nsfw = true;
  }
  if (guild.nsfw) {
    if (message.channel.nsfw) {
      getReddit(command, message, color);
    } else {
      message.author.send(lang.nsfw_only);
    }
  }
}
