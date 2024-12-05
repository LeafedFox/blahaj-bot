const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
require('dotenv').config(); // Use environment variables for security

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const PREFIX = "!";

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity("Supporting Trans Rights 🏳️‍⚧️", { type: "WATCHING" });
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.channel.type === 'DM') {
        const ventingChannel = client.channels.cache.find(channel => channel.name === '⚠venting');

        if (!ventingChannel) {
            return message.author.send('The #venting channel does not exist on the server. Please ask a moderator to set it up.');
        }

        // Forward the DM to the #venting channel anonymously
        try {
            await ventingChannel.send(`**Anonymous Vent:**\n${message.content}`);
            await message.author.send('Your message has been sent anonymously to the #venting channel. ❤️');
        } catch (error) {
            console.error(error);
            await message.author.send('I encountered an error while sending your message. Please try again later.');
        }
        return;
    }

    if (message.content.startsWith(PREFIX)) {
        const args = message.content.slice(PREFIX.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        switch (command) {
            case 'help':
                const helpEmbed = new EmbedBuilder()
                    .setColor('#ff66b3')
                    .setTitle('Help Commands')
                    .setDescription('Here are some commands you can use:')
                    .addFields(
                        { name: '!help', value: 'Display this help message' },
                        { name: '!pronouns [your pronouns]', value: 'Set your pronouns and assign a role' },
                        { name: '!color [hex code]', value: 'Choose a custom color role or create one' },
                        { name: '!resources', value: 'Get a list of transgender resources' }
                    )
                    .setFooter({ text: 'We love you and support you!' });
                message.channel.send({ embeds: [helpEmbed] });
                break;

            case 'pronouns':
                const pronouns = args.join(' ');
                if (!pronouns) {
                    return message.reply('Please provide your pronouns. Example: `!pronouns xe/xem`');
                }

                const normalizedPronouns = pronouns.toLowerCase();
                let role = message.guild.roles.cache.find(r => r.name.toLowerCase() === normalizedPronouns);

                if (!role) {
                    try {
                        role = await message.guild.roles.create({
                            name: pronouns,
                            color: 'RANDOM',
                            mentionable: true
                        });
                        message.channel.send(`Created a new role for pronouns: **${pronouns}**.`);
                    } catch (error) {
                        console.error(error);
                        return message.reply('I couldn’t create the role. Please ensure I have the `Manage Roles` permission.');
                    }
                }

                try {
                    const member = message.guild.members.cache.get(message.author.id);
                    await member.roles.add(role);
                    message.reply(`Your pronouns have been set to **${pronouns}**, and the role has been assigned! 🌟`);
                } catch (error) {
                    console.error(error);
                    message.reply('I encountered an error while trying to assign your role. Please ensure I have the necessary permissions.');
                }
                break;

            case 'color':
                const color = args[0];
                const colorRegex = /^#([0-9A-F]{3}){1,2}$/i;

                if (!color || !colorRegex.test(color)) {
                    return message.reply('Please provide a valid hex color code. Example: `!color #FF5733`');
                }

                const normalizedColorName = `Color: ${color.toUpperCase()}`;

                // Check if a role for the color already exists
                let colorRole = message.guild.roles.cache.find(r => r.name === normalizedColorName);

                // Create the role if it doesn't exist
                if (!colorRole) {
                    try {
                        colorRole = await message.guild.roles.create({
                            name: normalizedColorName,
                            color: color,
                            mentionable: false
                        });
                        message.channel.send(`Created a new color role: **${normalizedColorName}**.`);
                    } catch (error) {
                        console.error(error);
                        return message.reply('I couldn’t create the color role. Please ensure I have the `Manage Roles` permission.');
                    }
                }

                const existingColorRoles = member.roles.cache.filter(r => r.name.startsWith('Color:'));
                try {
                if (existingColorRoles.size > 0) {
                    for (const role of existingColorRoles.values()) {
                        await member.roles.remove(role);
                    }
                }
                } catch (error) {
                    console.error(error);
                    return message.reply('I couldn’t remove your existing colour roles.');
                }

                // Assign the color role to the user
                try {
                    const member = message.guild.members.cache.get(message.author.id);
                    await member.roles.add(colorRole);
                    message.reply(`You have been assigned the color role: **${normalizedColorName}**! 🎨`);
                } catch (error) {
                    console.error(error);
                    message.reply('I couldn’t assign the color role. Please ensure I have the necessary permissions.');
                }
                break;

            case 'resources':
                const resourceEmbed = new EmbedBuilder()
                    .setColor('#66ccff')
                    .setTitle('Transgender Resources')
                    .setDescription('Here are some resources to support you:')
                    .addFields(
                        { name: 'Trans Lifeline', value: '[Visit Website](https://www.translifeline.org/)' },
                        { name: 'The Trevor Project', value: '[Visit Website](https://www.thetrevorproject.org/)' },
                        { name: 'National Center for Transgender Equality', value: '[Visit Website](https://transequality.org/)' }
                    )
                    .setFooter({ text: 'You are valid 💖' });
                message.channel.send({ embeds: [resourceEmbed] });
                break;

            default:
                message.reply("I don't recognize that command! Try `!help` for a list of commands.");
        }
    }
    if(message.content.toLowerCase().includes('trans')) {
        // React with a trans emoji
        try {
            message.react('🏳️‍⚧️');
        } catch (error) {
            console.log(error);
        }
    }
});


client.login(process.env.TOKEN); // Ensure you have your token in a .env file

