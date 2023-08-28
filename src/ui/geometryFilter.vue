<template>

</template>
<style>

</style>
<script>
import {VCol, VContainer, VRow} from 'vuetify/lib';
import {VcsButton, VcsFormButton, VcsFormSection, VcsLabel, VcsSelect, VcsTextField, VcsUiApp,} from '@vcmap/ui';
import {WfsEndpoint} from '@camptocamp/ogc-client';
import axios from 'axios'
import {GeoJSON} from "ol/format.js";
import {inject, ref} from "vue";
import {getLayerByClass, getLayerByName} from "../utils/vcsUtils.js";
import {xmlTemplate} from "../../pattern.js";
import {FeatureAtPixelInteraction, VectorStyleItem, EventType} from "@vcmap/core";
import * as Cesium from "@vcmap-cesium/engine";
export default {
  props: {
    source: {
      type: Array,
      required: true,
    },
    selectedObject3D: {
      type: Object,
      required: true
    }
  },
  components: {
    VContainer,
    VcsFormSection,
    VcsLabel,
    VcsSelect,
    VRow,
    VCol,
    VcsFormButton,
    VcsTextField,
    VcsButton
  },
  setup() {
    const app = inject('vcsApp');
    const wfsLayers = ref([]);
    // app.maps.eventHandler.featureInteraction.setActive(EventType.CLICK);
    wfsLayers.value = getLayerByName(app, 'toDisplay');
    return {
      app,
      wfsLayers
    }
  },
  created() {

  },
  destroyed() {
  },
  data() {
    return {
      isValid: false,
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
  watch: {
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
      console.log("Highlight objects", objectIDs)
      const highlightStyle = new VectorStyleItem({
        fill: { color: 'rgb(63,185,30)' },
      });

      const object3DLayer = this.app.layers.getByKey(layerName);
      console.log("object3dLayer", object3DLayer);
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

    conditionRule(value) {
      if (this.filtersOn[this.selectedFilter] === 'integer') {
        return /^\s*\d+\s*(,\s*\d+\s*)*$/.test(value) || this.requiredLegend
      } else if (this.filtersOn[this.selectedFilter] === 'string') {
        return /^\d+(,\d+)*$/.test(value) || this.requiredLegend
      } else if (this.filtersOn[this.selectedFilter] === 'float') {
        return /^\d+(,\d+)*$/.test(value) || this.requiredLegend
      } else {
        console.log("filterOn, sf", this.filtersOn, this.selectedFilter)
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

    async runQuery() {
      let setToHighlight = new Set()
      let url = await this.generateQueryUrl();
      let response = await axios.get(url);
      for (const feature of response.data.features) {
        let data = feature.geometry.coordinates.toString().replaceAll(',', ' ')
        let modifiedXmlString = xmlTemplate.replace('{{coordinatesList}}', data);
        let cityObjects = await axios.post("https://wfs.apps.gs-fr-prod.camptocamp.com/wfs?", modifiedXmlString, this.config);
        Object.values(cityObjects.data.CityObjects).forEach((elt) => {
          elt.geometry[0]?.semantics?.surfaces?.forEach(surface => {
            setToHighlight.add(surface.id)
          })
        })
      }
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
};

</script>
