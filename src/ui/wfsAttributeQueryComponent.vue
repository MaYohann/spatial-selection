<template>
  <v-container class="px-0 py-1 main">
    <VcsFormSection heading="Query Options">
      <template #default>
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
                    placeholder="Select attribute"
                    hint="Request layer first"
                    persistent-hint
                />
              </v-col>
            </v-row>
            <v-row >
              <v-col cols="2">
                <VcsLabel html-for="textInput" class="text-caption">
                  Condition:
                </VcsLabel>
              </v-col>
              <v-col>
                <VcsTextField
                    :placeholder="!selectedFilter ? 'disabled' : placeHolder"
                    :disabled=!selectedFilter
                    v-model="listIds"
                    clearable
                    :rules="[rules.required]"
                />
              </v-col>
            </v-row>
            <v-row no-gutters  v-if="sampleValues && sampleValues[selectedFilter]">
              <v-col cols="8">
                <VcsLabel html-for="textInput" class="text-caption">
                  Example value: {{sampleValues[selectedFilter].uniqueValues[0].value}}
                </VcsLabel>
              </v-col>
            </v-row>
            <v-row justify="space-around">
              <v-col cols="6" md="4">
                <VcsFormButton @click="runQuery()" :disabled="querying">Request objects</VcsFormButton>
              </v-col>
            </v-row>
          </v-container>
        </v-container>
      </template>
    </VcsFormSection>
  </v-container>
</template>

<script>
  import {WfsEndpoint} from '@camptocamp/ogc-client';
  import axios from 'axios'
  import {getLayerByClass, getLayerByName} from "../utils/vcsUtils.js";
  import {xmlTemplate} from "../../pattern.js";
  import {VectorStyleItem} from "@vcmap/core";
  import { VContainer, VRow, VCol } from 'vuetify/lib';
  import {
    VcsButton,
    VcsLabel,
    VcsSelect,
    VcsTextField,
    VcsFormButton,
    VcsFormSection,
    VcsUiApp, NotificationType
  } from '@vcmap/ui';
  import { inject, onMounted, ref, computed } from 'vue';
  import { name } from '../../package.json';

  export default {
    name: 'WFSAttributeQuery',
    components: {
      VContainer,
      VcsFormSection,
      VcsLabel,
      VcsSelect,
      VRow,
      VCol,
      VcsFormButton,
      VcsTextField,
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
      }
    },
    methods: {
      activate() {

      },
      validate() {

      },
      highlight3DObjects(app, layerName, objectIDs) {
        const highlightStyle = new VectorStyleItem({
          fill: { color: 'rgb(63,185,30)' },
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
          return /^\d+(,\d+)*$/.test(value) || this.requiredLegend
        } else if (this.filtersOn[this.selectedFilter] === 'float') {
          return /^\d+(,\d+)*$/.test(value) || this.requiredLegend
        } else {
          return this.filtersOn[this.selectedFilter] + 'Unmamaged type'
        }
      },
      async generateQueryUrl() {
        let wfs = await new WfsEndpoint(this.selectedLayer.url).isReady()
        let url = wfs.getFeatureUrl(this.selectedLayer.layers, {
          asJson: true,
          maxFeatures: 1000,
          outputCrs: "EPSG:4326"
        });
        if (this.listIds !== "") {
          url += "&cql_filter=" + this.selectedFilter + " IN (" + this.listIds + ")"
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

      /**
       * 1) Run standard WFS Query to request the envelope geometry of the actives filters
       * 2) create 3D WFS request to get all the ids of the building inside the envelope
       * 3) Highlight the buildings
       * @returns {Promise<void>}
       */
      async runQuery() {
        this.startQueryingUi();
        let setToHighlight = new Set()
        let url = await this.generateQueryUrl();
        let response = await axios.get(url);
        let nbBuildings = 0;
        for (const feature of response.data.features) {
          let data = feature.geometry.coordinates.toString().replaceAll(',', ' ')
          let modifiedXmlString = xmlTemplate.replace('{{coordinatesList}}', data);
          let cityObjects = await axios.post("https://wfs.apps.gs-fr-prod.camptocamp.com/wfs?", modifiedXmlString, this.config);
          let cityObjectsElements =  Object.values(cityObjects.data.CityObjects);
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
        let pop = await wfs.getFeatureTypeFull(this.selectedLayer.layers)
        this.sampleValues = await wfs.getFeatureTypePropDetails(this.selectedLayer.layers)
        this.activeFilterInput = true
        this.filtersOn = pop.properties
      }
    },
    setup() {
      const app = inject('vcsApp');
      const { state } = app.plugins.getByKey(name);

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

      onMounted(() => {});

      return {
        app,
        state,
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
        isValid: false,
        querying: false,
        filtersOn: [],
        listIds: '',
        selectedLayer: {},
        activeFilterInput: false,
        selectedFilter: {},
        sampleValues: {},
        state: {},
        rules: {
          required: value => this.conditionRule(value)
        },
        config: {
          headers: {'Content-Type': 'text/xml'}
        }
      };
    },
  };
</script>

<style scoped></style>
