/*

 Copyright (C) 2022 programmerpony

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.

*/

const { Client, Intents, Collection, MessageEmbed } = require('discord.js');
const presence = require('./presence.js');
const client = new Client({
	failIfNotExists: false,
	presence: presence,
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.GUILD_PRESENCES,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_VOICE_STATES,
		Intents.FLAGS.GUILD_BANS,
		Intents.FLAGS.DIRECT_MESSAGES
	]
});
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const reloadSlashCommands = require('./utils/reloadSlashCommands.js');
const announceLevelUp = require('./utils/embed/announceLevelUp.js');
const boostEmbed = require('./utils/embed/boostEmbed.js');
const connectToDatabase = require('./utils/connectToDatabase.js');
const defaultModules = require('./defaultModules.js');
const onCooldown = new Set();
const onVoiceChat = new Set();
const banned = new Set();

client.on('ready', async () => {
	console.log(highlight(`Bot started as ${client.user.tag}`));
	await registerCommands();
	setInterval((() => { client.user.setPresence(presence); }), 1800000); // Refresh presence every half an hour so it doesn't vanish
	let totalMembers = 0;
	for (guild of client.guilds.cache.values()) totalMembers+=guild.memberCount;
	console.log(highlight(`${client.user.username} is ready on ${client.guilds.cache.size} server${client.guilds.cache.size !== 1 ? 's' : ''} with a total of ${totalMembers} members!`));
});

client.on('guildCreate', (guild) => {
	console.log(`Client joined guild ${guild.name} with ID ${guild.id}`);
	createGuild(guild, true);
});

client.on('messageCreate', async (message) => {

	if (!message.guild || message.author.bot) return; // Ignore DMs and bots

	let guildInfo = await getGuildInfo(message.guild);

	// Send help if bot is tagged
	if (message.content == `<@!${client.user.id}>` || message.content == `<@${client.user.id}>`) await sendHelp(message, guildInfo);

	// Blocked / Banned Words
	if (await bannedWords(message, guildInfo)) return;

	// Run command and add XP
	runTextCommand(message, guildInfo);

	// Check the suggestions channel (if enabled)
	checkSuggestion(message, guildInfo.modules);

});

client.on('messageUpdate', async (oldMessage, newMessage) => {
	if (newMessage.guild) {
		sendEditedMessage(oldMessage, newMessage);
		bannedWords(newMessage, await getGuildInfo(newMessage.guild));
	}
});

client.on('messageDelete', async (message) => {
	if (message.author.id == client.user.id) return;
	if (message.guild) sendDeletedMessage(message);
});

client.on('guildMemberAdd', async (member) => {
	let guildInfo = await getGuildInfo(member.guild);
	let lang = require(`./lang/${guildInfo.lang}.js`);
	let welcome = guildInfo.modules.find((c) => c.name == 'welcome');
	if (!welcome.enabled) return;
	let channel = client.channels.cache.find(channel => channel.id == welcome.channel);
	if (!channel) return;
	if (!channel.permissionsFor(client.user.id).has('VIEW_CHANNEL')) return;
	if (!channel.permissionsFor(client.user.id).has('SEND_MESSAGES')) return;
	if (!channel.permissionsFor(client.user.id).has('ATTACH_FILES')) return;
	const welcomeCard = require('./utils/canvas/welcomeCard.js');
	welcomeCard(lang, welcome.background, channel, member.user, welcome.message || 'default');
});

client.on('guildMemberRemove', async (member) => {
	let isBan = banned.has(member.user.id);
	if (isBan) banned.delete(member.user.id);
	let guildInfo = await getGuildInfo(member.guild);
	let lang = require(`./lang/${guildInfo.lang}.js`);
	let goodbye = guildInfo.modules.find((c) => c.name == 'goodbye');
	if (!goodbye.enabled) return;
	let channel = client.channels.cache.find(channel => channel.id == goodbye.channel);
	if (channel) {
		goodbye.message ||= 'default';
		if (goodbye.message == 'default') goodbye.message = lang.defaultValues.goodbye.message;
		goodbye.banMessage ||= 'default';
		if (goodbye.banMessage == 'default') goodbye.banMessage = lang.defaultValues.goodbye.banMessage;
		if (!channel.permissionsFor(client.user.id).has('VIEW_CHANNEL')) return;
		if (!channel.permissionsFor(client.user.id).has('SEND_MESSAGES')) return;
		let message = isBan ? goodbye.banMessage : goodbye.message;
		channel.send(message.replaceAll('{user}',member.user.tag).replaceAll('{guild}',member.guild.name));
	}
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
	if (!oldMember.premiumSinceTimestamp && newMember.premiumSinceTimestamp) boostEmbed(newMember, await getGuildInfo(newMember.guild));
});

client.on('guildBanAdd', async (ban) => {
	if (!banned.has(ban.user.id)) banned.add(ban.user.id);
});

client.on('voiceStateUpdate', async (oldState, newState) => {
	if (newState.member.user.bot) return;
	if ((newState.channel?.id && !oldState.channel?.id) || (newState.channel?.guild?.id && oldState.channel?.guild?.id != newState.channel?.guild?.id)) {
		// User joins a voice channel (not switch)
		onVoiceChat.add(`${newState.member.user.id},${newState.guild.id};${new Date()}`);
	}
	if ((oldState.channel?.id && !newState.channel?.id) || (oldState.channel?.guild?.id && oldState.channel?.guild?.id != newState.channel?.guild?.id)) {
		// User leaves a voice channel
		addVoiceXP(oldState);
	}
});

client.on('interactionCreate', async (i) => {
	if (i.isCommand()) return runSlashCommand(i);
	if (!i.isButton()) return;
	if (!i.guild) return i.deferUpdate();

	// Role menu
	if (i.customId.startsWith('role-')) {
		await i.deferUpdate().catch(r=>{return});
		let roleID = i.customId.replace('role-', '');
		await i.member.fetch(true);
		try {
			if (!i.member.roles.cache.get(roleID)) await i.member.roles.add(roleID);
			else await i.member.roles.remove(roleID);
		} catch (e) {
			let guildInfo = await getGuildInfo(i.guild);
			let lang = require(`./lang/${guildInfo.lang}.js`);
			if (!i.guild.me.permissions.has('MANAGE_ROLES')) await i.followUp({ content:lang.manage_roles_permission_required, ephemeral:true }).catch(r=>{});
			else if (i.guild.me.roles.highest.position < i.guild.roles.cache.get(roleID).position) await i.followUp({ content:lang.chrysalis_role_too_low, ephemeral:true }).catch(r=>{});
			else await i.followUp({ content: lang.roles_managed_by_integrations_cannot_be_manually_assigned, ephemeral: true }).catch(r=>{});
		}
	}

	// Delete inappropriate images
	if (i.customId.startsWith('report')) {
		await i.deferReply({ephemeral:true}).catch(r=>{return});
		let args = i.customId.split('-');
		let reportURL = args[1];
		let commandMessage = args[2];
		let guildInfo = await getGuildInfo(i.guild);
		let lang = require(`./lang/${guildInfo.lang}.js`);
		let embed = new MessageEmbed()
			.setTitle(lang.please_report)
			.setURL(reportURL)
			.setColor(guildInfo.color);
		await i.editReply({embeds:[embed],ephemeral:true});
		try {
			i.message.delete();
			if (commandMessage) await i.channel.messages.fetch(commandMessage).then(m => m.delete());
		} catch (e) {}
	}
});

client.login(process.env.DISCORD_TOKEN);

async function isRestricted(command, message, modules) {
	if (command == 'leaderboard') return isRestricted('rank', message, modules);
	let cmdModule = modules.find((c) => c.name == command);
	if (!cmdModule.enabled) return true;
	if (cmdModule.restricted) return (cmdModule.allowedChannels.indexOf(message.channel.id) == -1);
	else return false;
}

async function runTextCommand(message, guildInfo) {

	if (!message.channel.permissionsFor(client.user.id).has('SEND_MESSAGES') || !message.channel.permissionsFor(client.user.id).has('VIEW_CHANNEL')) return;

	let lang = require(`./lang/${guildInfo.lang}.js`);
	let args = message.content.slice(guildInfo.prefix.length).split(/ +/);
	let command = args.shift().toLowerCase();
	const noxp = ['rank','leaderboard','lb','highscores','top','leaderboards','setxp'];
	if (noxp.indexOf(command) == -1 && guildInfo.modules.find(m => m.name == 'rank').enabled) await addMessageXP(message, guildInfo);

	if (message.content.startsWith(guildInfo.prefix)) {
		let cmd = client.commands.get(command) || client.commands.find((c) => c.alias.includes(command));
		if (cmd) {
			if (cmd.nsfw && !message.channel.nsfw) return message.author.send(lang.nsfw_only).catch(r=>{});
			let restricted = false;
			if (!cmd.admin) restricted = await isRestricted(cmd.name, message, guildInfo.modules);
			else if (!message.member.permissions.has('ADMINISTRATOR')) return;
			if (restricted) return message.author.send(lang.wrong_channel).catch(r=>{/*User blocked Chrysalis*/});
			if (cmd.name!='clean') await message.channel.sendTyping().catch(r=>{});
			cmd.run(client, message, command, args, lang, guildInfo);
    }
  }
}

async function runSlashCommand(i) {

	let guildInfo = await getGuildInfo(i.guild);
	if (!i.channel.permissionsFor(client.user.id).has('SEND_MESSAGES') || !i.channel.permissionsFor(client.user.id).has('VIEW_CHANNEL')) return;
	let lang = require(`./lang/${guildInfo.lang}.js`);

	let command = i.commandName;
	let args = i.options.data.map(d => d.value);
	let cmd = client.commands.get(command) || client.commands.find((c) => c.alias.includes(command));
	if (cmd) {
		if (cmd.nsfw && !i.channel.nsfw) return i.reply({content:lang.nsfw_only,ephemeral:true});
		let restricted = false;
		if (!cmd.admin) restricted = await isRestricted(command, i, guildInfo.modules);
		else if (!i.member.permissions.has('ADMINISTRATOR')) return;
		if (restricted) return i.reply({content:lang.wrong_channel,ephemeral:true}).catch(r=>{});
		else {
			await i.deferReply({ephemeral:cmd.ephemeral}).catch(r=>{return});
			cmd.run(client, i, command, args, lang, guildInfo);
		}
	}
}

async function registerCommands() {
	client.commands = new Collection();
	let commands = fs.readdirSync(path.resolve(__dirname, 'commands')).filter((f) => f.endsWith('.js'));
	for (let jsfile of commands) {
		let commandfile = require(`./commands/${jsfile}`);
		client.commands.set(commandfile.name, commandfile);
		console.log(`${jsfile} loaded`);
	}
	for (guild of client.guilds.cache.values()) {
		let guildInfo = await getGuildInfo(guild);
		await reloadSlashCommands(client, guild, guildInfo);
	}
}

async function bannedWords(message, guildInfo) {

	if (message.member && message.member.permissions.has('ADMINISTRATOR')) return;
	if (message.author.id == client.user.id) return;
	if (!message.channel.permissionsFor(client.user.id).has('MANAGE_MESSAGES')) return;
	let bannedwords = guildInfo.modules.find((c) => c.name == 'bannedwords');
	if (!bannedwords.enabled) return false;
	let lang = require(`./lang/${guildInfo.lang}.js`);

	for (word of bannedwords.words) {
		if (message.content.toLowerCase().includes(word.toLowerCase())) {
			try {
				await message.delete();
				if (message.member) await message.author.send(lang.message_deleted_dm);
			} catch (e) {} finally {
				return true;
			}
		}
		if (message.attachments.size>0) {
			for (word of bannedwords.words) {
				for (attachment of message.attachments.values()) {
					if (attachment.name.toLowerCase().includes(word.toLowerCase())) {
						try {
							await message.delete();
							if (message.member) await message.author.send(lang.message_deleted_dm);
						} catch (e) {} finally {
							return true;
						}
					}
				}
			}
		}
	}
	return !message.member;
}

async function sendHelp(message, guildInfo) {
	if (!message.channel.permissionsFor(client.user.id).has('SEND_MESSAGES') || !message.channel.permissionsFor(client.user.id).has('VIEW_CHANNEL')) return;
	let lang = require(`./lang/${guildInfo.lang}.js`);
	let embed = new MessageEmbed()
		.setTitle(client.user.username)
		.setThumbnail(client.user.displayAvatarURL())
		.setDescription(`[${lang.invite_the_bot}](https://discord.com/api/oauth2/authorize?client_id=797161820594634762&permissions=8&scope=bot%20applications.commands) | [${lang.website}](https://chrysalis.programmerpony.com) | [${lang.support_server}](https://discord.gg/Vj2jYQKaJP)`)
		.setColor(guildInfo.color)
		.addField(`💻 ${lang.source_code}`,'[GitLab](https://gitlab.com/programmerpony/Chrysalis) | [GitHub](https://github.com/programmer-pony/Chrysalis)',true)
		.addField(`💞 ${lang.support_the_project}`,'[Buy me a Coffee](https://ko-fi.com/programmerpony)',true)
		.setFooter({text: `${lang.the_current_prefix_for_this_server_is} ${guildInfo.prefix}`})
	message.channel.send({embeds:[embed]});
}

async function createGuild(guild, rsc) {
	let db = await connectToDatabase();
	let guilds = db.db('chrysalis').collection('guilds');
	if (!(await guilds.findOne({id: guild.id}))) {
		await guilds.insertOne({
			id: guild.id,
			lang: client.commands.get('lang').validLangs.indexOf(guild.preferredLocale.slice(0,2)) >= 0 ? guild.preferredLocale.slice(0,2) : 'en',
			prefix: 'c!',
			color: '#3e804c',
			modules: defaultModules
		});
		console.log(`Created guild ${guild.name} with ID ${guild.id}`);
	}
	db.close();
	if (rsc) await reloadSlashCommands(client, guild, await getGuildInfo(guild));
}

async function checkSuggestion(message, modules) {
	let suggestions = modules.find((c) => c.name == 'suggestions');
	if (suggestions.enabled && message.channel.id == suggestions.channel)
	if (suggestions.reactToLinks && (message.content.includes('http://') || message.content.includes('https://')) || suggestions.reactToFiles && message.attachments.size>0) {
		await message.react(suggestions.approvalEmoji).catch(r=>{});
		await message.react(suggestions.disapprovalEmoji).catch(r=>{});
	}
}

async function sendDeletedMessage(message) {
	let guildInfo = await getGuildInfo(message.guild);
	let modules = guildInfo.modules;
	let lang = require(`./lang/${guildInfo.lang}.js`);
	let logs = modules.find((c) => c.name == 'logs');
	if (logs.enabled && logs.channel != '') {
		let embed = new MessageEmbed()
			.setTitle(lang.message_deleted)
			.setAuthor({name: message.author.tag, iconURL: message.author.displayAvatarURL()})
			.setColor(guildInfo.color)
			.addField(lang.author,`<@!${message.author.id}>`)

		if (message.content)
		embed.addField(lang.message,message.content.substring(0,1024));

		if (message.attachments.size>0)
		embed.addField(lang.attachments,message.attachments.map(a => a.name.substring(0,1024)).join('\n'));

		embed.addField(lang.message_id, message.id);

		embed.addField(lang.channel,`${message.channel} [${lang.jump_to_moment}](${message.url})`)

		let channel = client.channels.cache.find(channel => channel.id == logs.channel);
		if (channel && channel.guild.id == message.guild.id) channel.send({embeds:[embed]});
	}
}

async function sendEditedMessage(oldMessage, newMessage) {

	if (oldMessage.attachments.size == newMessage.attachments.size && oldMessage.content == newMessage.content) return;
	if (newMessage.author.id == client.user.id) return;
	let guildInfo = await getGuildInfo(newMessage.guild);
	let lang = require(`./lang/${guildInfo.lang}.js`);
	let modules = guildInfo.modules;
	let logs = modules.find((c) => c.name == 'logs');
	if (logs.enabled && logs.channel != '') {
		let embed = new MessageEmbed()
			.setTitle(lang.message_edited)
			.setAuthor({name: newMessage.author.tag, iconURL: newMessage.author.displayAvatarURL()})
			.setColor(guildInfo.color)
			.addField(lang.author,`<@!${newMessage.author.id}>`)

		if (oldMessage.content != newMessage.content) {
			if (oldMessage.content) embed.addField(lang.old_message,oldMessage.content.substring(0,1024));
			if (newMessage.content) embed.addField(lang.new_message,newMessage.content.substring(0,1024));
		}

		if (oldMessage.attachments.size>0 && oldMessage.attachments.size != newMessage.attachments.size) {
			embed.addField(lang.old_attachments,oldMessage.attachments.map(a => a.name.substring(0,1024)).join('\n'));
			if (newMessage.attachments.size>0) embed.addField(lang.new_attachments,oldMessage.attachments.map(a => a.name.substring(0,1024)).join('\n'));
		}

		embed.addField(lang.message_id, newMessage.id);
		embed.addField(lang.channel,`${newMessage.channel} [${lang.jump_to_moment}](${newMessage.url})`);

		let channel = client.channels.cache.find(channel => channel.id == logs.channel);
		if (channel && channel.guild.id == newMessage.guild.id) channel.send({embeds:[embed]});
	}
}

async function addMessageXP(message, guildInfo) {

	if (onCooldown.has(`${message.author.id},${message.guild.id}`)) return;
	let rank = guildInfo.modules.find((c) => c.name == 'rank');
	if (!rank.enabled) return;
	if (rank.xpBlacklistChannels.indexOf(message.channel.id) != -1) return;
	if (rank.xpPerMessage <= 0) return;
	let user = rank.users.find(u => u.id == message.author.id);
	if (user?.xp >= Number.MAX_SAFE_INTEGER) return;

	let db = await connectToDatabase();
	let guilds = db.db('chrysalis').collection('guilds');
	let guild = await guilds.findOne({id: message.guild.id});
	let modules = guild.modules;
	rank = modules.find((c) => c.name == 'rank');
	user = rank.users.find(u => u.id == message.author.id);
	if (!user) user = rank.users[rank.users.push({id: message.author.id, xp: 0})-1];

	let currentLevel = Math.trunc((Math.sqrt(5)/5)*Math.sqrt(user.xp));

	user.xp+=rank.xpPerMessage;

	let newLevel = Math.trunc((Math.sqrt(5)/5)*Math.sqrt(user.xp));

	if (!isNaN(parseInt(user.xp))) {
		await guilds.updateOne({id: message.guild.id},{ $set: { modules: modules}});
		if ((currentLevel < newLevel) && rank.announceLevelUp)
		announceLevelUp(
			client,
			message.author,
			newLevel,
			rank.announceLevelUpChannel,
			guild.color,
			require(`./lang/${guild.lang}.js`)
		);
	}
	db.close();
	if (rank.messageCooldown > 0) {
		onCooldown.add(`${message.author.id},${message.guild.id}`);
		setTimeout(() => {
			onCooldown.delete(`${message.author.id},${message.guild.id}`);
		}, rank.messageCooldown*1000);
	}
}

async function addVoiceXP(state) {

	let guildInfo = await getGuildInfo(state.guild); // Just to make sure guild exists
	let rank = guildInfo.modules.find((c) => c.name == 'rank');
	if (!rank.enabled) return;
	if (rank.xpBlacklistChannels.indexOf(state.channel.id) != -1) return;
	if (rank.voiceChatCooldown <= 0 || rank.xpInVoiceChat <= 0) return;
	let user = rank.users.find(u => u.id == state.member.user.id);
	if (user?.xp >= Number.MAX_SAFE_INTEGER) return;

	let ovc = Array.from(onVoiceChat).find(e=>e.startsWith(`${state.member.user.id},${state.guild.id};`));
	if (onVoiceChat.delete(ovc)) {
		let db = await connectToDatabase();
		let guilds = db.db('chrysalis').collection('guilds');
		let guild = await guilds.findOne({id: state.guild.id});
		let modules = guild.modules;
		rank = modules.find((c) => c.name == 'rank');
		user = rank.users.find(u => u.id == state.member.user.id);
		if (!user) user = rank.users[rank.users.push({id: state.member.user.id, xp: 0})-1];
		let currentLevel = Math.trunc((Math.sqrt(5)/5)*Math.sqrt(user.xp));

		let timestamp = new Date(ovc.slice(ovc.indexOf(';')+1));
		let secondsInVoiceChat = Math.trunc(Math.abs(new Date() - timestamp)/1000);
		if (secondsInVoiceChat >= rank.voiceChatCooldown) user.xp+=Math.trunc(secondsInVoiceChat/rank.voiceChatCooldown)*rank.xpInVoiceChat;
		let newLevel = Math.trunc((Math.sqrt(5)/5)*Math.sqrt(user.xp));

		if (!isNaN(parseInt(user.xp))) {
			await guilds.updateOne({id: state.guild.id},{ $set: { modules: modules}});
			if ((currentLevel < newLevel) && rank.announceLevelUp)
			announceLevelUp(
				client,
				state.member.user,
				newLevel,
				rank.announceLevelUpChannel,
				guild.color,
				require(`./lang/${guild.lang}.js`)
			);
		}
		db.close();
	}
}

async function getGuildInfo(guild) {
	let db = await connectToDatabase();
	let guilds = db.db('chrysalis').collection('guilds');
	let guildInfo = await guilds.findOne({id: guild.id});
	if (!guildInfo) {
		await createGuild(guild, false);
		guildInfo = await guilds.findOne({id: guild.id});
	}
	let modules = guildInfo.modules;
	let fixedModules = modules.filter(m => {
		return m !== null;
	});
	if (fixedModules.length != modules.length) {
		console.log(`Broken modules found on guild with ID ${guild.id}`);
		modules = fixedModules;
		await guilds.updateOne({id: guild.id},{ $set: { modules: modules}});
	}
	for (dm of defaultModules) {
		if (!modules.find((c) => c.name == dm.name)) modules.push(dm);
	}
	for (m of modules) {
		moduleModel = defaultModules.find((c) => c.name == m.name);
		if (!moduleModel) {
			delete m;
			continue;
		}
		for (key in moduleModel) if (!(key in m)) m[key] = moduleModel[key];
		for (key in m) if (!(key in moduleModel)) {
			delete m[key];
			continue;
		}
	}
	await guilds.updateOne({id: guild.id},{ $set: { modules: modules}});
	db.close();
	return guildInfo;
}

function highlight(s) { return `\u001b[47m\u001b[30m${s}\u001b[49m\u001b[39m`; }
