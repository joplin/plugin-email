import joplin from 'api';
import {ToolbarButtonLocation, MenuItemLocation} from 'api/types';
import {SECTION_NAME, PLUGIN_ICON} from './constants';
import {setting} from './setting';
import {Panel} from './ui/panel';


export default class App {
    panel: Panel;

    async init() {
        await this.setupSetting();
        await this.setupToolbar();

        this.panel = new Panel();
        await this.panel.setupPanel();
    }

    async setupSetting() {
        await joplin.settings.registerSection(SECTION_NAME, {
            label: 'Email Plugin',
            iconName: PLUGIN_ICON,
            description: 'Fetch your important emails as notes.',
        });

        await joplin.settings.registerSettings(setting);
    }

    async setupToolbar() {
        await joplin.commands.register({
            name: 'toolBar',
            label: 'Email Plugin',
            iconName: PLUGIN_ICON,
            execute: async () => {
                // When clicking on an email icon or an email plugin button in Tools, it will close the panel if the panel is open and vice versa.
                this.panel.closeOpenPanel();
            },
        });

        // Two starting points.
        await joplin.views.toolbarButtons.create('toolbarButton', 'toolBar', ToolbarButtonLocation.NoteToolbar);
        await joplin.views.menuItems.create('menuItem', 'toolBar', MenuItemLocation.Tools);
    }
}
