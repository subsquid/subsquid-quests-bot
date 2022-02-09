import { SlashCommandBuilder } from '@discordjs/builders';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('createquest')
		.setDescription('Create a new Quest'),
	async execute(interaction: { reply: (arg0: string) => any; }) {
		await interaction.reply('Test');
	},
};