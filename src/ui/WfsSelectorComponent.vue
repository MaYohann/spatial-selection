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
      <v-tab :value="0">Spatial</v-tab>
      <v-tab :value="1">Attribute</v-tab>
    </v-tabs>
    <v-window v-model="tab">
      <v-window-item :value="0" :key="0" :eager="true">
        <v-card-text
          >Filter an area (a city, a neighborhood, ...), then highlight or
          download all the 3d elements of this area</v-card-text
        >
        <VcsFormSection class="mt-2 mb-2" heading="Source of spatial selection">
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
        <VcsFormSection
          class="mt-2 mb-2"
          heading="Layer to filter and fetch area"
        >
          <v-container class="py-0 px-1">
            <v-row class="mt-1 mb-1">
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
          </v-container>
        </VcsFormSection>
        <VcsFormSection heading="Attribute Filter" class="mt-3">
          <v-container v-if="canAddFilter">
            <v-row align="center" justify="center" class="mb-1">
              <v-col> Operator </v-col>
              <v-col>
                <VcsSelect
                  v-model="cqlOperator"
                  :items="['AND', 'OR']"
                  placeholder="Select the source of the spatial selection"
                />
              </v-col>
            </v-row>
            <v-divider></v-divider>
            <v-container class="py-0 px-1">
              <AttributeFilterItem
                v-for="af in attributeFilters"
                :key="af.uuid"
                :uuid="af.uuid"
                :sample-values="sampleValues"
                :attributes="
                  Object.entries(filtersOn).map((elt) => {
                    return { name: elt[0], type: elt[1] };
                  })
                "
                @selectedAttributeFilter="selectedAttributeFilterChanged"
                @deleteAttributeFilter="deleteAttributeFilter"
              ></AttributeFilterItem>
              <v-row class="mt-1">
                <v-col cols="6">
                  <VcsButton @click="addFilter()" color="primary"
                    >+ Add filter</VcsButton
                  >
                </v-col>
              </v-row>
            </v-container>
          </v-container>
          <v-container v-else>
            <v-row class="mt-1">
              <v-col>
                Select and request a layer before configuring filters
              </v-col>
            </v-row>
          </v-container>
        </VcsFormSection>
      </v-window-item>
      <v-window-item :value="1" :key="1" :eager="true">
        <v-card-text class="mb-1"
          >Filter 3d elements by attribute (ex: get all flat roof)</v-card-text
        >
        <VcsFormSection class="mt-2 mb-2" heading="Source of spatial selection">
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
        <VcsFormSection class="mt-2 mb-2" heading="Layer to filter and match">
          <v-container class="py-0 px-1">
            <v-row class="mt-1 mb-1">
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
            <v-row no-gutters>
              <v-col cols="2">
                <VcsLabel html-for="textInput" class="text-caption">
                  GML ID
                </VcsLabel>
              </v-col>
              <v-col v-if="activeFilterInput">
                <VcsSelect
                  v-model="selectedGMLIDAttribute"
                  :items="Object.entries(filtersOn)"
                  :item-text="(item) => item[0] + ':' + item[1]"
                  :item-value="(item) => item[0]"
                  placeholder="Attribute for GML ID"
                />
              </v-col>
              <v-col v-else cols="8">
                <VcsLabel> Select and request a layer first</VcsLabel>
              </v-col>
            </v-row>
          </v-container>
        </VcsFormSection>
        <VcsFormSection heading="Attribute Filter" class="mt-3">
          <v-container v-if="canAddFilter">
            <v-row align="center" justify="center" class="mb-1">
              <v-col> Operator </v-col>
              <v-col>
                <VcsSelect
                  v-model="cqlOperator"
                  :items="['AND', 'OR']"
                  placeholder="Select the source of the spatial selection"
                />
              </v-col>
            </v-row>
            <v-divider></v-divider>
            <v-container class="py-0 px-1">
              <AttributeFilterItem
                v-for="af in attributeFilters"
                :key="af.uuid"
                :uuid="af.uuid"
                :sample-values="sampleValues"
                :attributes="
                  Object.entries(filtersOn).map((elt) => {
                    return { name: elt[0], type: elt[1] };
                  })
                "
                @selectedAttributeFilter="selectedAttributeFilterChanged"
                @deleteAttributeFilter="deleteAttributeFilter"
              ></AttributeFilterItem>
              <v-row class="mt-1">
                <v-col cols="6">
                  <VcsButton @click="addFilter()" color="primary"
                    >+ Add filter</VcsButton
                  >
                </v-col>
              </v-row>
            </v-container>
          </v-container>
          <v-container v-else>
            <v-row class="mt-1">
              <v-col>
                Select and request a layer before configuring filters
              </v-col>
            </v-row>
          </v-container>
        </VcsFormSection>
      </v-window-item>
    </v-window>
    <v-row justify="space-around" class="mt-5">
      <v-col cols="4">
        <VcsFormButton variant="filled" @click="clear()">Clear</VcsFormButton>
      </v-col>
      <v-col cols="4">
        <VcsFormButton
          @click="runQuery()"
          :disabled="!canRequest"
          :loading="querying"
          :tooltip="'Display all elements matching request'"
          >Display</VcsFormButton
        >
      </v-col>
      <v-col cols="3" v-if="tab === 1">
        <VcsFormButton
          @click="downloadJSON()"
          :icon="'mdi-download-circle'"
          :disabled="!canRequest"
          :loading="querying"
          :tooltip="'Download all features match with the filter'"
        ></VcsFormButton>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import { WfsEndpoint } from '@camptocamp/ogc-client';
  import axios from 'axios';
  import { VectorStyleItem } from '@vcmap/core';
  import { VContainer, VRow, VCol, VTab } from 'vuetify/lib';
  import {
    VcsButton,
    VcsLabel,
    VcsSelect,
    VcsTextField,
    VcsFormButton,
    VcsFormSection,
    NotificationType,
    VcsTextArea,
    VcsRadio,
  } from '@vcmap/ui';
  import { inject, ref } from 'vue';
  import {
    VCard,
    VCardText,
    VDivider,
    VTabs,
    VWindow,
    VWindowItem,
  } from 'vuetify/lib/components';
  import { name } from '../../package.json';
  import { xmlTemplate } from '../pattern.js';
  import { getLayerByClass, getLayerByName } from '../utils/vcsUtils.js';
  import AttributeFilter from './attributeFilter.js';
  import Attribute from './attribute.js';
  import AttributeFilterItem from './AttributeFilterItem.vue';

  export default {
    name: 'WFSSelection',
    components: {
      VCard,
      VCardText,
      VContainer,
      VTab,
      VTabs,
      VcsButton,
      VcsFormSection,
      VcsLabel,
      VcsSelect,
      VcsTextArea,
      VRow,
      VCol,
      VcsFormButton,
      VcsTextField,
      VcsRadio,
      AttributeFilterItem,
      VWindow,
      VWindowItem,
      VDivider,
    },
    computed: {
      active() {},
      isReady() {},
      canAddFilter() {
        return this.activeFilterInput;
      },
      canRequest() {
        if (this.tab === 1) {
          if (!this.selectedGMLIDAttribute) return false;
        }
        return (
          this.activeFilterInput &&
          this.attributeFilters.length > 0 &&
          this.areFiltersValid &&
          this.selectedObject3D
        );
      },
    },
    watch: {
      tab(value) {
        this.clear();
      },
    },
    methods: {
      addFilter() {
        this.attributeFilters.push(
          new AttributeFilter(new Attribute('', ''), '', ''),
        );
      },

      deleteAttributeFilter(attributeFilter) {
        let deletedIndex = -1;
        this.attributeFilters.forEach((af, index) => {
          if (af.uuid === attributeFilter.uuid) {
            deletedIndex = index;
          }
        });
        if (deletedIndex > -1) {
          this.attributeFilters.splice(deletedIndex, 1);
        }
      },

      selectedAttributeFilterChanged(value) {
        let updatedIndex = -1;
        this.attributeFilters.forEach((af, index) => {
          if (af.uuid === value.uuid) {
            updatedIndex = index;
          }
        });
        if (updatedIndex > -1) {
          this.attributeFilters[updatedIndex] = value;
        }
        this.areFiltersValid = !this.attributeFilters.find(
          (attributeFilter) => !attributeFilter.isValid(),
        );
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
        this.activeFilterInput = false;
        this.attributeFilters = [];
      },

      generateCQLStatement(attributeFilters) {
        return attributeFilters
          .map((af) => `(${af.toCQL()})`)
          .join(this.cqlOperator);
      },

      async generateQueryUrlAttribute() {
        const wfs = await new WfsEndpoint(this.selectedLayer.url).isReady();
        let url = wfs.getFeatureUrl(this.selectedLayer.layers, {
          asJson: true,
          maxFeatures: 10000,
          outputCrs: 'EPSG:4326',
        });
        if (this.attributeFilters !== []) {
          url += `&cql_filter=${this.generateCQLStatement(
            this.attributeFilters,
          )}`;
        }
        return url;
      },

      /**
       * Display notif of request pending
       */
      startQueryingUi() {
        this.notification = this.app.notifier.add({
          type: NotificationType.INFO,
          message: `Querying...`,
          timeout: 60000,
        });
        this.querying = true;
      },

      /**
       * Display notif of request ending
       */
      endQueryingUiSuccess(msg) {
        this.app.notifier.remove(this.notification);
        this.app.notifier.add({
          type: NotificationType.SUCCESS,
          message: msg,
        });
        this.querying = false;
      },

      endQueryingUiFailure(msg) {
        this.app.notifier.remove(this.notification);
        this.app.notifier.add({
          type: NotificationType.ERROR,
          message: msg,
        });
        this.querying = false;
      },

      addCase() {
        this.conditions.push(''); // Add a new text input
      },
      removeCase() {
        this.conditions.splice(0, 1); // Add a new text input
      },
      clearForms() {
        this.isValid = false;
        this.querying = false;
        this.activeFilterInput = false;
        this.filtersOn = [];
        this.conditions = [''];
        this.selectedLayer = {};
        this.selectedFilter = {};
        this.sampleValues = {};
        this.attributes = [];
        this.selectedGMLIDAttribute = null;
        this.attributeFilters = [];
      },

      clearDatas() {
        if (this.selectedObject3D) {
          const object3DLayer = this.app.layers.getByKey(
            this.selectedObject3D.name,
          );
          if (object3DLayer) {
            object3DLayer.featureVisibility.clearHighlighting();
          }
          this.selectedObject3D = null;
        }
      },

      clear() {
        this.clearDatas();
        this.clearForms();
      },

      /**
       * 1) Run standard WFS Query to request the envelope geometry of the actives filters
       * 2) create 3D WFS request to get all the ids of the building inside the envelope
       * 3) Highlight the buildings
       * @returns {Promise<void>}
       */
      async runSpatialQuery() {
        this.startQueryingUi();
        const setToHighlight = new Set();
        const url = await this.generateQueryUrlAttribute();
        try {
          const response = await axios.get(url, { timeout: this.timeout });
          let nbBuildings = 0;
          for (const feature of response.data.features) {
            const data = feature.geometry.coordinates
              .toString()
              .replaceAll(',', ' ');
            const modifiedXmlString = xmlTemplate.replace(
              '{{coordinatesList}}',
              data,
            );
            const cityObjects = await axios.post(
              this.config.wfs3dServer,
              modifiedXmlString,
              this.postConfig,
            );
            const cityObjectsElements = Object.values(
              cityObjects.data.CityObjects,
            );
            nbBuildings += cityObjectsElements.length;
            cityObjectsElements.forEach((elt) => {
              elt.geometry[0]?.semantics?.surfaces?.forEach((surface) => {
                setToHighlight.add(surface.id);
              });
            });
          }
          this.endQueryingUiSuccess(
            `Querying successfull:  ${nbBuildings} buildings returned`,
          );
          this.highlight3DObjects(
            this.app,
            this.selectedObject3D.name,
            setToHighlight,
          );
        } catch {
          this.endQueryingUiFailure(`Failure retrieving data`);
          console.log('API call failed');
        }
      },

      async runAttributeQuery() {
        if (!this.canRequest) {
          this.app.notifier.add({
            type: NotificationType.ERROR,
            message: 'Please select 3D object first',
          });
        } else {
          this.startQueryingUi();
          const url = await this.generateQueryUrlAttribute();
          try {
            const response = await axios.get(url, { timeout: this.timeout });
            // Parse Data
            const queryResult = this.parseQueryData(
              response.data,
              this.selectedGMLIDAttribute,
            );
            this.endQueryingUiSuccess(
              `Highlight ${queryResult.numberReturned} of ${queryResult.numberMatched} matched features`,
            );
            // Highlight
            this.highlight3DObjects(
              this.app,
              this.selectedObject3D.name,
              queryResult.selectedGmlIds,
            );
          } catch {
            this.endQueryingUiFailure(`Failure retrieving data`);
            console.log('API call failed');
          }
        }
      },

      async runQuery() {
        if (this.tab === 0) {
          await this.runSpatialQuery();
        } else {
          await this.runAttributeQuery();
        }
      },

      async downloadJSON() {
        this.startQueryingUi();
        const url = await this.generateQueryUrlAttribute();
        try {
          const response = await axios.get(url, { timeout: this.timeout });
          const queryResult = this.parseQueryData(
            response.data,
            this.selectedGMLIDAttribute,
          );
          // Create a JSON object
          const blob = new Blob([JSON.stringify(queryResult)], {
            type: 'application/json',
          });

          // Prepare filename
          const cdt = new Date();
          const suffix = cdt.toISOString().slice(0, -5).replace(/\D/g, '');

          const virtualLink = document.createElement('a');
          virtualLink.href = URL.createObjectURL(blob);
          virtualLink.download = `filtered-GML-IDs-${suffix}.json`;
          virtualLink.style.display = 'none';
          document.body.appendChild(virtualLink);
          virtualLink.click();
          URL.revokeObjectURL(virtualLink.href);
          document.body.removeChild(virtualLink);
          this.endQueryingUiSuccess(
            `${queryResult.numberReturned} selected GML ID are downloaded.`,
          );
        } catch (err) {
          this.endQueryingUiFailure(`Failure retrieving data`);
          console.log('API call failed');
        }
      },

      parseQueryData(queryData, gmlIDAttribute) {
        const selectedGmlIds = [];
        queryData.features.forEach((f) => {
          selectedGmlIds.push(f.properties[gmlIDAttribute]);
        });
        return {
          selectedGmlIds,
          totalFeatures: queryData.totalFeatures,
          numberMatched: queryData.numberMatched,
          numberReturned: queryData.numberReturned,
        };
      },

      async requestFields() {
        const wfs = await new WfsEndpoint(this.selectedLayer.url).isReady();
        const prop = await wfs.getFeatureTypeFull(this.selectedLayer.layers);
        const url = wfs.getFeatureUrl(this.selectedLayer.layers, {
          asJson: true,
          maxFeatures: 1,
          outputCrs: 'EPSG:4326',
        });
        const res = await axios.get(url);
        this.sampleValues = res.data.features[0].properties;
        this.activeFilterInput = true;
        this.filtersOn = prop.properties;
      },
    },
    setup() {
      const app = inject('vcsApp');
      const { state, config } = app.plugins.getByKey(name);

      const object3Ds = ref([]);
      const wmsLayers = ref([]);
      const attributes = ref([]);
      const wfsLayers = ref([]);
      const selectedGMLIDAttribute = ref();

      const selectedObject3D = ref();
      const selectedWMSLayer = ref({});

      // TODO: Make it work with multiple attributes, operator, and criteria
      const selectedAttribute = ref('');
      const selectedCriteria = ref('');

      // Set the values from the app
      object3Ds.value = getLayerByClass(app, ['CesiumTilesetLayer']);
      wmsLayers.value = getLayerByClass(app, ['WMSLayer']);
      wfsLayers.value = getLayerByName(app, 'toDisplay');

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
        selectedGMLIDAttribute,
      };
    },
    data() {
      return {
        timeout: 30000,
        tab: '0',
        cqlOperator: 'OR',
        areFiltersValid: false,
        isValid: false,
        querying: false,
        filtersOn: [],
        notification: {},
        conditions: [''],
        selectedMapLayer: {},
        selectedLayer: {},
        activeFilterInput: false,
        selectedFilter: {},
        sampleValues: {},
        state: {},
        attributeFilters: [],
        postConfig: {
          headers: { 'Content-Type': 'text/xml' },
        },
      };
    },
  };
</script>

<style scoped></style>
