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
            placeholder="Select attribute"
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
import { VContainer, VRow, VCol } from 'vuetify/lib';
import {
  VcsLabel,
  VcsSelect,
  VcsTextField,
  VcsButton,
  VcsFormButton,
  VcsFormSection,
} from '@vcmap/ui';
import { WfsEndpoint } from '@camptocamp/ogc-client';

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
  created() {

  },
  destroyed() {
  },
  data() {
    return {
      isValid: false,
      filtersOn: [],
      selectedLayer: {},
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
    },

    doFlash() {
      return this.flash && !this.isReady;
    },
  },
  methods: {
    activate() {

    },
    validate() {

    },
    conditionRule(value) {
      if (this.filtersOn[this.selectedFilter] === 'integer') {
        return /^\d+(,\d+)*$/.test(value) || this.requiredLegend
      } else if (this.filtersOn[this.selectedFilter] === 'string') {
        return /^\d+(,\d+)*$/.test(value) || this.requiredLegend
      } else if (this.filtersOn[this.selectedFilter] === 'float') {
        return /^\d+(,\d+)*$/.test(value) || this.requiredLegend
      } else {
        console.log("filterOn, sf", this.filtersOn, this.selectedFilter)
        return this.filtersOn[this.selectedFilter] + 'Unnamaged type'
      }
    },
    async runQuery() {
      let wfs = await new WfsEndpoint("https://public.sig.rennesmetropole.fr/geoserver/ows").isReady()

      const url = wfs.getFeatureUrl('dem_stats:iris', {
        asJson: true,
        maxFeatures: 1000
      });
      let pop = wfs.getFeatureTypeFull('dem_stats:iris')
      console.log("Run run !", url, pop)
    },
    async requestFields() {
      let wfs = await new WfsEndpoint(this.selectedLayer.url).isReady()
      console.log("wfs", wfs)
      let pop = await wfs.getFeatureTypeFull(this.selectedLayer.layers)
      this.sampleValues = await wfs.getFeatureTypePropDetails(this.selectedLayer.layers)
      let entries = pop.properties

      this.filtersOn = entries
      console.log("this", this.filtersOn)
    }
  },
};

</script>
