const { MessageEmbed } = require('discord.js');
var fs = require('fs');
var lang;
var MongoClient = require('mongodb').MongoClient;
const dbURL = process.env.DB_URL;

module.exports = {
  name: "bannedwords", // Name of the DB module
  alias: ["addword","addwords","delword","deleteword","removeword","delwords","deletewords","removewords","listwords","wordslist","wordlist"], // Actual command names
  admin: true,
  run: (client, message, command, args, prefix, color, langv) => {

    lang = langv;

    if (command == "bannedwords") return;

    switch (command) {
      case "addword":
      case "addwords":
        addWords(message, command, args, color);
        break;
      case "delword":
      case "deleteword":
      case "removeword":
      case "delwords":
      case "deletewords":
      case "removewords":
        delWords(message, command, args, color);
        break;
      case "listwords":
      case "wordslist":
      case "wordlist":
        listWords(message, command, args, color);
        break;
    }
  }
}

async function listWords(message, command, args, color) {
  const guildID = message.guild.id
  const db = new MongoClient(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await db.connect();
  const dbo = db.db("chrysalis");
  const guilds = dbo.collection("guilds");
  const guild = await guilds.findOne({id: guildID});
  const defaultcolor = "#245128";
  if (guild == null) {
    await guilds.insertOne({id: guildID, prefix: "c!", color: defaultcolor});
    db.close();
    return;
  } else {
    const modules = guild.modules
    if (modules==null) {
      await guilds.updateOne({id: guildID},{ $set: { modules: [{"name":"bannedwords","enabled":true,"words":[]}]}});
      await guilds.updateOne({id: guildID},{ $set: { modules: [{"name":"logs","enabled":true,"channel":""}]}});
      db.close();
      return;
    } else {
      const bannedwords = modules.find((c) => c.name == "bannedwords");
      if (bannedwords == null) {
        modules.push({"name":"bannedwords","enabled":true,"words":[]});
        await guilds.updateOne({id: guildID},{ $set: { modules: modules}});
        db.close();
        return;
      } else {
        const embed = new MessageEmbed()
        .setTitle(lang.blocked_words)
        .setColor(color)
        if (bannedwords.words.length>0) {
          embed.addField(lang.list,bannedwords.words.toString().split(',').join('\n'));
        }
        message.channel.send({embeds:[embed]})
      }
    }
  }
}

async function addWords(message, command, args, color) {
  const guildID = message.guild.id
  const db = new MongoClient(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await db.connect();
  const dbo = db.db("chrysalis");
  const guilds = dbo.collection("guilds");
  const guild = await guilds.findOne({id: guildID});
  if (guild == null) {
    await guilds.insertOne({id: guildID, prefix: "c!", color: defaultcolor});
    db.close();
    return;
  } else {
    const modules = guild.modules
    if (modules==null) {
      await guilds.updateOne({id: guildID},{ $set: { modules: [{"name":"bannedwords","enabled":true,"words":[]}]}});
      await guilds.updateOne({id: guildID},{ $set: { modules: [{"name":"logs","enabled":true,"channel":""}]}});
    }
    var bannedwords = modules.find((c) => c.name == "bannedwords");
    if (bannedwords == null) {
      modules.push({"name":"bannedwords","enabled":true,"words":[]});
      await guilds.updateOne({id: guildID},{ $set: { modules: modules}});
      bannedwords = {"name":"bannedwords","enabled":true,"words":["sexooooooooo"]};
    }
    if (bannedwords.words == null) bannedwords.words = [];
    words = [];
    if (command.endsWith('s')) words.push(args.toString().split(',').join(' '))
    else {
    for (word of args) {
        if (bannedwords.words.indexOf(word) == -1) {
          words.push(word);
        }
      }
    }
    parsedWords = [...new Set(words)];

    if (parsedWords == "") {
      db.close();
      return message.channel.send(lang.no_new_words_added);
    }

    bannedwords.words = bannedwords.words.concat(parsedWords);
    await guilds.updateOne({id: guildID},{ $set: { modules: modules}});
    db.close();

    const embed = new MessageEmbed()
    .setTitle(lang.word_s_blocked)
    .addField(lang.word_s,parsedWords.toString().split(',').join('\n'))
    .addField(lang.word_s_blocked_by,`${message.author}`)
    .setColor(color)
    message.channel.send({embeds:[embed]});
  }
}

async function delWords(message, command, args, color) {
  const guildID = message.guild.id
  const db = new MongoClient(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await db.connect();
  const dbo = db.db("chrysalis");
  const guilds = dbo.collection("guilds");
  const guild = await guilds.findOne({id: guildID});
  if (guild == null) {
    await guilds.insertOne({id: guildID, prefix: "c!", color: defaultcolor});
    db.close();
    return;
  } else {
    const modules = guild.modules
    if (modules==null) {
      await guilds.updateOne({id: guildID},{ $set: { modules: [{"name":"bannedwords","enabled":true,"words":[]}]}});
      await guilds.updateOne({id: guildID},{ $set: { modules: [{"name":"logs","enabled":true,"channel":""}]}});
    }
    const bannedwords = modules.find((c) => c.name == "bannedwords");
    if (bannedwords == null) {
      modules.push({"name":"bannedwords","enabled":true,"words":[]});
      await guilds.updateOne({id: guildID},{ $set: { modules: modules}});
    }
    words = [...new Set(args)];
    unbannedWords = [];
    if (command.endsWith('s')) {
      const argwords = args.toString().replace(',',' ');
      const index = bannedwords.words.indexOf(argwords)
      if (index > -1) {
        bannedwords.words.splice(index, 1);
        unbannedWords.push(argwords);
      }
    } else {
      for (word of words) {
        const index = bannedwords.words.indexOf(word);
        if (index > -1) {
          bannedwords.words.splice(index, 1);
          unbannedWords.push(word);
        }
      }
    }
    if (unbannedWords == "") {
      db.close();
      return message.channel.send(lang.no_words_were_removed);
    } else {

      await guilds.updateOne({id: guildID},{ $set: { modules: modules}});
      db.close();

      const embed = new MessageEmbed()
      .setTitle(lang.word_s_unblocked)
      .addField(lang.word_s, unbannedWords.toString().split(',').join('\n'))
      .addField(lang.word_s_unblocked_by,`${message.author}`)
      .setColor(color)
      message.channel.send({embeds:[embed]});

    }
  }
}
