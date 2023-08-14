<template>
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
            :items="source"
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
            :disabled=!this.activeFilterInput
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
            :placeholder="!this.selectedFilter ? 'disabled' : this.placeHolder"
            :disabled=!this.selectedFilter
            v-model="listIds"
            clearable
            :rules="[rules.required]"
        />
      </v-col>
    </v-row>
    <v-row no-gutters  v-if="this.sampleValues && this.sampleValues[this.selectedFilter]">
      <v-col cols="8">
        <VcsLabel html-for="textInput" class="text-caption">
          Example value: {{this.sampleValues[this.selectedFilter].uniqueValues[0].value}}
        </VcsLabel>
      </v-col>
    </v-row>
    <v-row justify="space-around">
      <v-col cols="6" md="4">
        <VcsFormButton @click="runQuery()">Clear</VcsFormButton>
      </v-col>
    </v-row>
  </v-container>
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
export default {
  props: {
    source: {
      type: Array,
      required: true,
    },
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

    wfsLayers.value = getLayerByName(app, 'toDisplay');
    return {
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
    async runQuery() {
      let wfs = await new WfsEndpoint(this.selectedLayer.url).isReady()

      let url = wfs.getFeatureUrl(this.selectedLayer.layers, {
        asJson: true,
        maxFeatures: 1000,
        outputCrs: "EPSG:4326"
      });
      if (this.listIds !== "") {
        url += "&cql_filter=" + this.selectedFilter + " IN (" + this.listIds + ")"
      }
      axios.get(url).then((response) => {
        console.log(response.data)
        let data = response.data.features[0].geometry.coordinates.toString().replaceAll(',', ' ')
        let modifiedXmlString = xmlTemplate.replace('{{coordinatesList}}', data);
        let config = {
          headers: {'Content-Type': 'text/xml'}
        };
        axios.post("http://localhost:8080/wfs?", modifiedXmlString, config).then((jsonResponse) => {
          console.log("Response", Object.keys(jsonResponse.data.CityObjects))
        })
      })
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
