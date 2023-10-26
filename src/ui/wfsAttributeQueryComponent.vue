<template>
  <v-container>
    <v-tabs
        v-model="tab"
        align-tabs="center"
        density="compact"
        height="30"
        color="primary"
        grow
    >
          <v-tab :value="0">Attribute</v-tab>
          <v-tab :value="1">Spatial</v-tab>

    </v-tabs>
    <v-window v-model="tab">
      <v-window-item :value="0" :key="0" :eager="true">
        <v-container class="px-0 py-1 main">

          <VcsFormSection heading="Source of spatial selection">
            <v-container class="py-0 px-1">
              <v-row>
                <v-col cols="4">
                  <VcsLabel html-for="textInput" class="text-caption">
                    3D Object
                  </VcsLabel>
                </v-col>
                <v-col>
                  <VcsSelect
                      v-model="selectedObject3D"
                      :items="object3Ds"
                      :item-text="(item) => item.name"
                      :item-value="
                      (item) => {
                        return {
                          name: item.name,
                          url: item.url,
                        };
                      }
                    "
                      placeholder="Select the source of the spatial selection"
                  />
                </v-col>
              </v-row>
            </v-container>
          </VcsFormSection>
          <VcsFormSection heading="Attribute on which the mapping has to be done">
            <v-container class="py-0 px-1">
              <v-row>
                <v-col cols="2">
                  <VcsLabel html-for="textInput" class="text-caption">
                    Layer
                  </VcsLabel>
                </v-col>
                <v-col cols="7">
                  <VcsSelect
                      v-model="selectedLayer"
                      :items="layers"
                      :item-text="(item) => item.name"
                      :item-value="
                          (item) => {
                            return {
                              name: item.name,
                              url: item.url,
                              layers: item.layers,
                            };
                          }
                        "
                      @change="onLayerChange"
                      placeholder="Please select a layer"
                  />
                </v-col>
                <v-col cols="1" md="2">
                  <VcsFormButton @click="requestFields()">&#10227;</VcsFormButton>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="2">
                  <VcsLabel html-for="textInput" class="text-caption">
                    From:
                  </VcsLabel>
                </v-col>
                <v-col>
                  <VcsSelect
                      v-model="selectedFilter"
                      :items="Object.entries(filtersOn)"
                      :item-text="(item) => item[0] + ':' + item[1]"
                      :item-value="(item) => item[0]"
                      :disabled=!activeFilterInput
                      :placeholder="!activeFilterInput ? 'You need to select and request a layer first' : 'Select attribute'"
                      hint="Request layer first"
                      persistent-hint
                  />
                </v-col>
              </v-row>
              <v-row no-gutters v-if="sampleValues && sampleValues[selectedFilter]">
                <v-col cols="8">
                  <VcsLabel html-for="textInput" class="text-caption">
                    Example value: {{ sampleValues[selectedFilter] }}
                  </VcsLabel>
                </v-col>
              </v-row>
              <v-row class="mt-0 pt-0 mb-0 pb-0">
                <v-col cols="10" class="mb-0 pb-0">
                  <VcsLabel html-for="textInput" class="text-caption">
                    Conditions (equality):
                  </VcsLabel>
                </v-col>
              </v-row>
              <v-row v-for="(condition, index) in conditions" :key="index" class="d-flex pt-0 mt-0 py-1 pr-1 align-center">
                <v-col class="mt-0 pt-1">
                  <div class="text-center">
                    <VcsTextField
                        :placeholder="!selectedFilter.length ? 'You need to select a attribute first' : placeHolder"
                        :disabled="!selectedFilter.length"
                        v-model="conditions[index]"
                        clearable
                        :rules="[rules.required]"
                    />
                  </div>
                </v-col>
                <v-col cols="2" fluid fill-height text-center class="mt-0 pt-1">
                  <VcsButton @click="removeCase" color="primary" icon="mdi-pause-circle"
                  >X
                  </VcsButton>
                </v-col>
              </v-row>
              <v-row class="pt-0 mt-1">
                <v-col cols="5" class="pt-0 mt-0">
                  <VcsButton @click="addCase" color="primary">+ Add condition</VcsButton>
                </v-col>
              </v-row>
              <v-row justify="space-around">
                <v-col>
                  <VcsFormButton variant="filled" @click="clear()">Clear</VcsFormButton>
                </v-col>
                <v-col>
                  <VcsFormButton @click="runQuery()" :disabled="!canRequest">Request objects</VcsFormButton>
                </v-col>
              </v-row>
            </v-container>
          </VcsFormSection>
        </v-container>
      </v-window-item>
      <v-window-item :value="1" :key="1">
        Salut
      </v-window-item>
    </v-window>
  </v-container>
</template>

<script>
import {WfsEndpoint} from '@camptocamp/ogc-client';
import axios from 'axios'
import {getLayerByClass, getLayerByName} from "../utils/vcsUtils.js";
import {xmlTemplate} from "../../pattern.js";
import {VectorStyleItem} from "@vcmap/core";
import {VContainer, VRow, VCol, VTab} from 'vuetify/lib';
import {
  VcsButton,
  VcsLabel,
  VcsSelect,
  VcsTextField,
  VcsFormButton,
  VcsFormSection,
  VcsUiApp, NotificationType
} from '@vcmap/ui';
import {inject, onMounted, ref, computed} from 'vue';
import {name} from '../../package.json';
import {VCard, VCardText, VTabs, VWindow, VWindowItem} from "vuetify/lib/components";

export default {
  name: 'WFSAttributeQuery',
  components: {
    VCard, VCardText,
    VContainer,
    VTab,
    VTabs,
    VcsButton,
    VcsFormSection,
    VcsLabel,
    VcsSelect,
    VRow,
    VCol,
    VcsFormButton,
    VcsTextField,
    VWindow, VWindowItem
  },
  computed: {
    active() {
    },
    isReady() {
    },
    placeHolder() {
      return 'List of ' + this.filtersOn[this.selectedFilter] + ' separated by a comma'
    },
    requiredLegend() {
      return 'Must be a ' + this.placeHolder
    },
    canRequest() {
      return this.activeFilterInput && this.conditions[0] !== ""
    }
  },
  methods: {
    activate() {

    },
    validate() {

    },
    highlight3DObjects(app, layerName, objectIDs) {
      const highlightStyle = new VectorStyleItem({
        fill: {color: 'rgb(63,185,30)'},
      });

      const object3DLayer = this.app.layers.getByKey(layerName);
      const hightlightParameters = {};
      objectIDs.forEach((x) => {
        hightlightParameters[x] = highlightStyle;
      });
      object3DLayer.featureVisibility.clearHighlighting();
      object3DLayer.featureVisibility.highlight(hightlightParameters);
    },

    onLayerChange() {
      this.activeFilterInput = false
    },

    //TODO: fake type condition atm
    conditionRule(value) {
      if (this.filtersOn[this.selectedFilter] === 'integer') {
        return /^\s*\d+\s*(,\s*\d+\s*)*$/.test(value) || this.requiredLegend
      } else if (this.filtersOn[this.selectedFilter] === 'string') {
        return /^(\d+)(,\s*\d+)*$/.test(value) || this.requiredLegend
      } else {
        return this.filtersOn[this.selectedFilter] + 'Unmanaged type'
      }
    },
    async generateQueryUrl() {
      let wfs = await new WfsEndpoint(this.selectedLayer.url).isReady()
      let url = wfs.getFeatureUrl(this.selectedLayer.layers, {
        asJson: true,
        maxFeatures: 1000,
        outputCrs: "EPSG:4326"
      });
      if (this.conditions !== "") {
        url += "&cql_filter=" + this.selectedFilter + " IN (" + this.conditions.join(',') + ")"
      }
      return url;
    },

    /**
     * Display notif of request pending
     */
    startQueryingUi() {
      this.app.notifier.add({
        type: NotificationType.INFO,
        message: `Start querying...`,
      });
      this.querying = true
    },

    /**
     * Display notif of request ending
     */
    endQueryingUi(msg) {
      this.app.notifier.add({
        type: NotificationType.SUCCESS,
        message: msg
      });
      this.querying = false
    },

    addCase() {
      this.conditions.push(''); // Add a new text input
    },
    removeCase() {
      this.conditions.splice(0, 1); // Add a new text input
    },
    clearForms() {
      this.isValid = false
      this.querying = false
      this.activeFilterInput = false
      this.filtersOn = []
      this.conditions = ['']
      this.selectedLayer = {}
      this.selectedFilter = {}
    },

    clearDatas() {
      const object3DLayer = this.app.layers.getByKey(this.selectedObject3D.name);
      object3DLayer.featureVisibility.clearHighlighting();
    },

    clear() {
      this.clearForms()
      this.clearDatas()
    },

    /**
     * 1) Run standard WFS Query to request the envelope geometry of the actives filters
     * 2) create 3D WFS request to get all the ids of the building inside the envelope
     * 3) Highlight the buildings
     * @returns {Promise<void>}
     */
    async runQuery() {
      this.startQueryingUi()
      let setToHighlight = new Set()
      let url = await this.generateQueryUrl()
      let response = await axios.get(url)
      let nbBuildings = 0
      for (const feature of response.data.features) {
        let data = feature.geometry.coordinates.toString().replaceAll(',', ' ')
        let modifiedXmlString = xmlTemplate.replace('{{coordinatesList}}', data)
        let cityObjects = await axios.post(this.config.wfs3dServer, modifiedXmlString, this.postConfig);
        let cityObjectsElements = Object.values(cityObjects.data.CityObjects);
        nbBuildings += cityObjectsElements.length;
        cityObjectsElements.forEach((elt) => {
          elt.geometry[0]?.semantics?.surfaces?.forEach(surface => {
            setToHighlight.add(surface.id)
          })
        })
      }
      this.endQueryingUi(`Querying successfull:  ${nbBuildings} buildings returned`);
      this.highlight3DObjects(this.app, this.selectedObject3D.name, setToHighlight);
    },
    async requestFields() {
      let wfs = await new WfsEndpoint(this.selectedLayer.url).isReady()
      let prop = await wfs.getFeatureTypeFull(this.selectedLayer.layers)
      let url = wfs.getFeatureUrl(this.selectedLayer.layers, {
        asJson: true,
        maxFeatures: 1,
        outputCrs: "EPSG:4326"
      });
      let res = await axios.get(url)
      this.sampleValues = res.data.features[0].properties
      this.activeFilterInput = true
      this.filtersOn = prop.properties
    }
  },
  setup() {
    const app = inject('vcsApp');
    const {state, config} = app.plugins.getByKey(name);

    const object3Ds = ref([]);
    const wmsLayers = ref([]);
    const attributes = ref([]);
    const wfsLayers = ref([]);

    const selectedObject3D = ref({});
    const selectedWMSLayer = ref({});

    // TODO: Make it work with multiple attributes, operator, and criteria
    const selectedAttribute = ref('');
    const selectedCriteria = ref('');

    // Set the values from the app
    object3Ds.value = getLayerByClass(app, ['CesiumTilesetLayer']);
    wmsLayers.value = getLayerByClass(app, ['WMSLayer']);
    wfsLayers.value = getLayerByName(app, 'toDisplay');

    onMounted(() => {
    });

    return {
      app,
      state,
      config,
      object3Ds,
      layers: wmsLayers,
      attributes,
      selectedObject3D,
      selectedLayer: selectedWMSLayer,
      selectedAttribute,
      selectedCriteria,
    };
  },
  data() {
    return {
      tab: "1",
      isValid: false,
      querying: false,
      filtersOn: [],
      conditions: [''],
      selectedLayer: {},
      activeFilterInput: false,
      selectedFilter: {},
      sampleValues: {},
      state: {},
      rules: {
        required: value => this.conditionRule(value)
      },
      postConfig: {
        headers: {'Content-Type': 'text/xml'}
      }
    };
  },
};
</script>

<style scoped></style>
