import { App, MenuItem, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface PluginSettings {
	inboxFile: string;
}

const DEFAULT_SETTINGS: PluginSettings = {
	inboxFile: 'Inbox'
}

export default class MobileInboxPlugin extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();

		this.registerEvent(
			//eslint-disable-next-line @typescript-eslint/ban-ts-comment
			//@ts-ignore
			this.app.workspace.on('receive-text-menu', (menu: Menu, shareText: string) => {
				menu.addItem((item: MenuItem) => {
					item.setTitle('Mobile Inbox');
					item.setIcon('inbox');
					item.onClick(async () => {
						const leaf = this.app.workspace.getLeaf(false);
						const inFile = this.app.vault.getFileByPath(this.settings.inboxFile + ".md");
						if (!inFile) return;
						await this.app.vault.append(inFile, "\n\n" + shareText + "\n");
						await leaf.openFile(inFile, {active: true});
					});
				});
			}),
		);

		this.addSettingTab(new MobileInboxSettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class MobileInboxSettingTab extends PluginSettingTab {
	plugin: MobileInboxPlugin;

	constructor(app: App, plugin: MobileInboxPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Inbox File')
			.setDesc('Note to append with shared text.')
			.addText(text => text
				.setPlaceholder('Note path')
				.setValue(this.plugin.settings.inboxFile)
				.onChange(async (value) => {
					this.plugin.settings.inboxFile = value;
					await this.plugin.saveSettings();
				}));
	}
}
