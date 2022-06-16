import joplin from 'api';
import { ToolbarButtonLocation, MenuItemLocation } from 'api/types';
import { SECTION_NAME, PLUGIN_ICON } from './constants'
import { setting } from './setting';


export default class App {

    async init() {
        await this.setupSetting();
        await this.setupToolbar();
    }

    async setupSetting() {

        await joplin.settings.registerSection(SECTION_NAME, {
            label: 'Email Plugin',
            iconName: PLUGIN_ICON,
            description: 'Fetch your important emails as notes.'
        });

        await joplin.settings.registerSettings(setting)
    }

    async setupToolbar() {

        await joplin.commands.register({
            name: 'toolBar',
            label: 'Email Plugin',
            iconName: PLUGIN_ICON,
            execute: async () => {
                // take-off point
                console.log('Email Plugin Started.');
                // new Panel
            },
        });

        // Two starting points.
        await joplin.views.toolbarButtons.create('toolbarButton', 'toolBar', ToolbarButtonLocation.NoteToolbar);
        await joplin.views.menuItems.create('menuItem', 'toolBar', MenuItemLocation.Tools);


    }

}