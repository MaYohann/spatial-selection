import { createToggleAction, ToolboxType, WindowSlot } from '@vcmap/ui';
import { version, name } from '../package.json';
import WFSAttributeQuery from './ui/wfsAttributeQueryComponent.vue';
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
          id: 'wfsAttributeQueryWidgetAction',
          title: 'WFS Spatial Selection',
          name: 'WFS Spatial Selection',
          icon: 'mdi-database-search',
        },
        {
          id: 'wfsAttributeQueryWidgetAction',
          component: WFSAttributeQuery,
          slot: WindowSlot.DYNAMIC_LEFT,
          state: {
            headerTitle: 'WFS Spatial Selection',
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
      console.log("Config loaded", this._pluginConfig)
    },
    destroy() {
      this._destroyToggleAction();
      this._removeToolbox();
    },
    i18n: {
      en: {
        'wfs-attribute-query': {
          title: 'WFS Spatial Selection',
        },
      },
    },
  };
}
