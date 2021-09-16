const { MessageEmbed } = require('discord.js');
const fetch = require("node-fetch");
var lang;
var MongoClient = require('mongodb').MongoClient;
const dbURL = process.env.DB_URL;

module.exports = {
  name: "booru",
  alias: ["manebooru","brony"],
  admin: false,
  run: async (client, message, command, args, prefix, color, langv) => {

    lang = langv;
    var query;
    if (args.length>0) {
      if (message.author) query = message.content.slice(prefix.length+command.length+1);
      else query = args[0];
    }
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
  if (numberOfPages > 1) randomPage = Math.floor(Math.random() * numberOfPages)+1;
  else randomPage = 1;
  try {
    await fetch('https://manebooru.art/api/v1/json/search/images?q=' + query + "&page=" + randomPage)
      .then(res => res.json())
      .then(json => {
        if (json.images==null || json.images.length < 1)
        if (message.author)
        return message.reply(lang.no_images_found);
        else return message.editReply(lang.no_images_found);
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
    if (message.author)
    return message.reply(lang.no_images_found);
    else return message.editReply(lang.no_images_found);
  }
}

async function postBooru(client, query, message, imageID, imageURL, color) {
  const embed = new MessageEmbed()
		.setAuthor("Manebooru","https://pbs.twimg.com/profile_images/1298657279789629440/wzkZYACK_400x400.jpg","https://manebooru.art/")
		.setImage(imageURL)
		.setColor(color)
		.setURL(`https://manebooru.art/images/${imageID}`)
		.setTitle(lang.image_source)
		.setDescription(`${lang.requested_by} ${message.member}`)
		.setFooter(lang.how_to_delete);

  if (message.author) sentEmbed = await message.channel.send({embeds:[embed]});
  else sentEmbed = await message.editReply({embeds:[embed]});
  sentEmbed.react("❤️");
  sentEmbed.react("❌");
  sentEmbed.createReactionCollector().on('collect', (r, u) => {
      if (r.emoji.name != '❌') return;
      if (r.count > 2 || u.id == message.member.user.id) {
        if (!sentEmbed.deleted) sentEmbed.delete();
        if (message.author && !message.deleted && message.channel.permissionsFor(client.user.id).has('MANAGE_MESSAGES')) message.delete();
    }
  });
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
  const booru = guild.modules.find((c) => c.name == 'booru');
  db.close();
  if (booru == null) return 229;
  if (booru.filter == null) return 229;
  return booru.filter;
}
