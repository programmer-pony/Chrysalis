const { MessageEmbed } = require('discord.js');
var fs = require('fs');
const path = require('path');
var MongoClient = require('mongodb').MongoClient;
const dbURL = process.env.DB_URL;
const reloadSlashCommands = require('../utils/reloadSlashCommands.js');
var lang;

module.exports = {
  name: "lang",
  alias: ["setlang","language","setlanguage"],
  admin: true,
  run: (client, message, command, args, prefix, color, langv) => {

    lang = langv;

    validLangs = fs.readdirSync(path.resolve(__dirname, '../lang/')).filter((f) => f.endsWith(".json")).map(f => f.slice(0,f.indexOf('.json')));

      if (args[0]==null || args[0]=="" || validLangs.indexOf(args[0])==-1) {
        embed = new MessageEmbed()
        .setTitle(lang.available_languages)
        .setColor(color)
        .setDescription(validLangs.toString().split(',').join('\n'));
        if (message.author) message.channel.send({embeds:[embed]});
        else message.editReply({embeds:[embed]})
      } else {
        changeLang(client, message, args[0]);
      }
  }
}

async function changeLang(client, message, newLang) {
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
  if (guild.lang == null) return db.close();
  await guilds.updateOne({id: guildID},{ $set: { lang: newLang}});
  db.close();
  lang = require(`../lang/${newLang}.json`);
  reloadSlashCommands(client, message.guild, lang);
  if (message.author) message.channel.send(lang.new_lang_message);
  else message.editReply(lang.new_lang_message);
}
