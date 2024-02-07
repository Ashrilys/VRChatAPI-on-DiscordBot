const Discord = require('discord.js');
const { request } = require('undici');
const config = require('./config.json');
const client = new Discord.Client({ intents: [Discord.GatewayIntentBits.Guilds] });

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    const commands = [
        new Discord.SlashCommandBuilder()
            .setName('grade')
            .setDescription('Obtenez votre grade VRChat')
            .addStringOption(option => option
                .setName('username')
                .setDescription('Votre nom d\'utilisateur VRChat')
                .setRequired(true)
                .setMinLength(4))

    ];

    const rest = new Discord.REST({ version: '10' }).setToken(config.TOKEN);

    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(Discord.Routes.applicationCommands(client.user.id), { body: commands });

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
});

const cache = new Map();

client.on('interactionCreate', async interaction => {
    if (interaction.isMessageComponent()) {
        var cached = cache.get(interaction.member.id);
        if (!cached)
            return await interaction.reply({ content: 'Error', embeds: [], components: [] });
        switch (interaction.customId) {
            case 'confirm':
                cache.delete(interaction.member.id);
                return await cached.interaction.editReply({ content: `User ${cached.users[cached.index].displayName}`, embeds: [], components: [] });
            case 'next':
                cached.index = (cached.index + 1) % cached.users.length;
                return await cached.interaction.editReply({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setDescription(cached.users[cached.index].displayName)
                            .setImage(cached.users[cached.index].userIcon || cached.users[cached.index].currentAvatarThumbnailImageUrl)
                            .setFooter({ text: cached.users[cached.index].id })
                    ]
                })
            case 'cancel':
                cache.delete(interaction.member.id);
                return await cached.interaction.editReply({ content: `Annulé.`, embeds: [], components: [] });
        }
        await interaction.deferUpdate();
        return;
    }

    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'grade') {
        const username = interaction.options.getString('username', true);
        const rusers = await request("https://api.vrchat.cloud/api/1/users?search=" + username, {
            headers: {
                'cookie': `auth=${config.auth}; twoFactorAuth=${config.twofa}`,
                'user-agent': 'Mozilla/5.0'
            }
        })
        const ruser = await request("https://api.vrchat.cloud/api/1/users/" + username, {
            headers: {
                'cookie': `auth=${config.auth}; twoFactorAuth=${config.twofa}`,
                'user-agent': 'Mozilla/5.0'
            }
        })
        const users = (await rusers.body.json());
        const user = (await ruser.body.json());
        const lusers = [...(user.id ? [user] : []), ...(users.length > 0 ? users : [])];
        if (lusers.length === 0)
            return await interaction.reply({ ephemeral: true, content: "Rien trouvé." });

        const i = 0;
        const confirm = new Discord.ButtonBuilder()
            .setCustomId('confirm')
            .setLabel("Confirmer")
            .setStyle(Discord.ButtonStyle.Primary);
        const next = new Discord.ButtonBuilder()
            .setCustomId('next')
            .setLabel("Suivant")
            .setStyle(Discord.ButtonStyle.Secondary);
        const cancel = new Discord.ButtonBuilder()
            .setCustomId('cancel')
            .setLabel("Annuler")
            .setStyle(Discord.ButtonStyle.Secondary);
        const row = new Discord.ActionRowBuilder()
            .addComponents(confirm, next, cancel);

        await interaction.reply({
            ephemeral: true,
            embeds: [
                new Discord.EmbedBuilder()
                    .setDescription(lusers[i].displayName)
                    .setImage(lusers[i].userIcon || lusers[i].currentAvatarThumbnailImageUrl)
                    .setFooter({ text: lusers[i].id })
            ],
            components: [row]
        });
        cache.set(interaction.member.id, { index: i, users: lusers, interaction });
        return;


        var found = 'visitor';
        for (const [role, tag] of [['trusted', 'system_trust_veteran'], ['know', 'system_trust_trusted'], ['user', 'system_trust_known'], ['new_user', 'system_trust_basic']]) {
            if (json.tags.includes(tag)) {
                found = role;
                break;
            }
        }
        await interaction.reply(`${json.displayName} ${found}`);
    }
});

client.login(config.TOKEN);
