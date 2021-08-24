const { MessageEmbed } = require('discord.js');
const fetch = require("node-fetch");
var lang = require('../lang/en.json');
var MongoClient = require('mongodb').MongoClient;
const dbURL = process.env.DB_URL;

module.exports = {
  name: "manebooru",
  alias: ["booru","brony","clop"],
  admin: false,
  run: async (client, message, command, args, prefix, color, langstr) => {

    lang = require(`../lang/${langstr}.json`);

    var query;
    const clop = command == "clop";
    if (args.length>0) query = message.content.slice(prefix.length+command.length+1);
    if (clop) return checkNSFW(client, query, message, color);
    const filter = await getFilter(message.guild.id);
    if (query!=null) {
      query = `safe,${query}&filter_id=${filter}`;
    } else {
      query = `safe&filter_id=${filter}`;
    }
    query = `${query}&per_page=50`;
    getBooru(client, query, message, color, 1);
  }
}

async function getBooru(client, query, message, color, numberOfPages) {
  message.channel.sendTyping();
  if (numberOfPages > 1) randomPage = Math.floor(Math.random() * numberOfPages)+1;
  else randomPage = 1;
  try {
    await fetch('https://manebooru.art/api/v1/json/search/images?q=' + query + "&page=" + randomPage)
      .then(res => res.json())
      .then(json => {
        if (json.images==null || json.images.length < 1) return message.reply(lang.no_images_found);
        imageCount = json.total;
        if (numberOfPages == 1 && imageCount > 50) {
          numberOfPages = Math.trunc(imageCount/50)+1;
          return getBooru(client, query, message, color, numberOfPages);
        }

        randomImage = json.images[Math.floor(Math.random() * json.images.length)];
        imageID = randomImage.id;
        imageURL = randomImage.view_url;
        postBooru(client, query, message, imageID, imageURL, color);
      })
  } catch (e) {
    return message.reply(lang.no_images_found);
  }
}

async function postBooru(client, query, message, imageID, imageURL, color) {
  const embed = new MessageEmbed()
		.setAuthor("Manebooru","https://pbs.twimg.com/profile_images/1298657279789629440/wzkZYACK_400x400.jpg","https://manebooru.art/")
		.setImage(imageURL)
		.setColor(color)
		.setURL(`https://manebooru.art/images/${imageID}`)
		.setTitle(lang.image_source)
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
}

async function checkNSFW(client, query, message, color) {
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
  db.close();
  filter = await getFilter(message.guild.id);
  if (guild.nsfw) {
    if (!message.channel.nsfw) {
      message.author.send(lang.nsfw_only);
      if (!message.deleted && message.channel.permissionsFor(client.user.id).has('MANAGE_MESSAGES')) message.delete();
      return;
    }
    if (query!=null) {
      if (filter == 229) {
        /* Some extreme tags are hidden by default but they will be
        shown anyways if you explicitly search for them. */
        const fetishes = ["vore","inflation","fat fetish","scat","diaper","gore"];
        for (fetish of fetishes) {
          if (query.includes(fetish)) {
            filter = 267;
            break;
          }
        }
      }
      query = `explicit,${query}&filter_id=${filter}`;
    } else {
      query = `explicit&filter_id=${filter}`;
    }
    getBooru(client, query, message, color, 1);
  }
}

async function getFilter(guildID) {
  const db = new MongoClient(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await db.connect();
  const dbo = db.db("chrysalis");
  const guilds = dbo.collection("guilds");
  const guild = await guilds.findOne({id: guildID});
  const manebooru = guild.modules.find((c) => c.name == 'manebooru');
  db.close();
  if (manebooru == null) return 229;
  if (manebooru.filter == null) return 229;
  return manebooru.filter;
}
