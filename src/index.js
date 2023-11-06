import { createToggleAction, ToolboxType, WindowSlot } from '@vcmap/ui';
import { version, name } from '../package.json';
import WfsSelector from './ui/WfsSelectorComponent.vue';
import getDefaultOptions from './defaultOptions.js';

/**
 * @param {T} config - the configuration of this plugin instance, passed in from the app.
 * @param {string} baseUrl - the absolute URL from which the plugin was loaded (without filename, ending on /)
 * @returns {import("@vcmap/ui/src/vcsUiApp").VcsPlugin<T, PluginState>}
 * @template {Object} T
 */
export default function plugin(config, baseUrl) {
  // eslint-disable-next-line no-console
  console.log(config, baseUrl);

  return {
    _pluginConfig: undefined,
    get name() {
      return name;
    },
    get version() {
      return version;
    },
    get config() {
      return this._pluginConfig;
    },
    _destroyToggleAction: () => {},
    _removeToolbox: () => {},
    state: {},
    initialize(vcsUiApp, state) {
      this._pluginConfig = getDefaultOptions();
      const { action, destroy } = createToggleAction(
        {
          id: 'wfsSelectionWidgetAction',
          title: 'WFS Selection',
          name: 'WFS Selection',
          icon: 'mdi-database-search',
        },
        {
          id: 'wfsSelectionWidgetAction',
          component: WfsSelector,
          slot: WindowSlot.DYNAMIC_LEFT,
          state: {
            headerTitle: 'WFS Selection',
            headerIcon: 'mdi-database-search',
          },
        },
        vcsUiApp.windowManager,
        name,
      );

      this._destroyToggleAction = destroy;

      const { id } = vcsUiApp.toolboxManager.add(
        {
          type: ToolboxType.SINGLE,
          action,
        },
        name,
      );

      this._removeToolbox = () => {
        vcsUiApp.toolboxManager.remove(id);
      };
      console.log('Config loaded', this._pluginConfig);
    },
    destroy() {
      this._destroyToggleAction();
      this._removeToolbox();
    },
    i18n: {
      en: {
        'wfs-selection': {
          title: 'WFS Selection',
        },
      },
    },
  };
}
