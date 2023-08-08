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
          <v-row>

          </v-row>
          <GeometryFilter :source="layers"></GeometryFilter>
        </v-container>
      </template>
    </VcsFormSection>
  </v-container>
</template>

<script>
  import { VContainer, VRow, VCol } from 'vuetify/lib';
  import {
    VcsLabel,
    VcsSelect,
    VcsTextField,
    VcsFormButton,
    VcsFormSection,
  } from '@vcmap/ui';
  import { VectorStyleItem } from '@vcmap/core';
  import { inject, onMounted, ref, computed } from 'vue';

  import { name } from '../../package.json';
  import GeometryFilter from "./geometryFilter.vue";

  function getLayerByClass(app, classNames) {
    const layers = [];
    [...app.layers].forEach((l) => {
      if (classNames.includes(l.className)) {
        if (l.className === 'WMSLayer') {
          console.log("WMS ! ", l)
          layers.push({
            name: l.name,
            url: l.url,
            layers: l.parameters.LAYERS,
          });
        } else if (l.className === 'CesiumTilesetLayer') {
          layers.push({
            name: l.name,
            url: l.url,
          });
        } else {
          layers.push({
            name: l.name,
          });
        }
      }
    });
    return layers;
  }

  // async function getLayerByName(app, layerName) {
  //   const layer = app.layers.getByKey(layerName);
  //   await layer.fetchData();

  //   return layer;
  // }

  async function getLayerAttributes(app, layerName) {
    // How to:
    // Guess the WFS layer from the WMS layer
    // Get the list of attributes and their type
    // https://firms.modaps.eosdis.nasa.gov/mapserver/wfs/Canada/YourMapKey/?SERVICE=WFS&REQUEST=DescribeFeatureType&VERSION=2.0.0&typeNames=ms:fires_snpp_7days&application/json

    return [
      { name: `Attribute ${layerName.name} double`, type: 'double' },
      { name: `Attribute ${layerName.name} text`, type: 'string' },
      { name: `Attribute ${layerName.name} bool`, type: 'boolean' },
    ];
  }

  function buildQuery(wmsLayer, attribute, operator, criteria) {
    console.log(
      `query params: ${JSON.stringify(wmsLayer)}, ${JSON.stringify(
        attribute,
      )}, ${operator}, ${criteria}`,
    );
    // TODO: build query here based on the selected options
    return '';
  }

  function runQuery(query) {
    // TODO: Implement on running the query to the WFS
    // It should return the list of gml id
    if (query === '') {
      // Fake result for now
      return [22328, 26610];
    }
    return [];
  }

  export default {
    name: 'WFSAttributeQuery',
    components: {
      GeometryFilter,
      VContainer,
      VcsFormSection,
      VcsLabel,
      VcsSelect,
      VRow,
      VCol,
      VcsFormButton,
      VcsTextField,
    },

    setup() {
      const app = inject('vcsApp');
      const { state } = app.plugins.getByKey(name);
      const operator = {
        number: ['=', '!=', '<', '<=', '>', '>='],
        boolean: ['=', '!='],
        string: ['LIKE', 'ILIKE'],
      };

      const object3Ds = ref([]);
      const wmsLayers = ref([]);
      const attributes = ref([]);

      const selectedObject3D = ref({});
      const selectedWMSLayer = ref({});

      // TODO: Make it work with multiple attributes, operator, and criteria
      const selectedAttribute = ref('');
      const selectedOperator = ref('');
      const selectedCriteria = ref('');

      // Set the values from the app
      object3Ds.value = getLayerByClass(app, ['CesiumTilesetLayer']);
      wmsLayers.value = getLayerByClass(app, ['WMSLayer']);

      onMounted(() => {});

      async function selectedLayerChanged(wmsLayer) {
        // use v-model instead
        selectedWMSLayer.value = wmsLayer;
        selectedAttribute.value = '';
        attributes.value = await getLayerAttributes(app, wmsLayer);
      }

      const highlightStyle = new VectorStyleItem({
        fill: { color: 'rgb(63,185,30)' },
      });

      function clearHightlight() {
        object3Ds.value.forEach((layer) => {
          const object3DLayer = app.layers.getByKey(layer.name);
          if (object3DLayer) {
            object3DLayer.featureVisibility.clearHighlighting();
          }
        });
      }

      function highlightObjects(layerName, objectIDs) {
        const object3DLayer = app.layers.getByKey(layerName);
        const hightlightParameters = {};
        objectIDs.forEach((x) => {
          hightlightParameters[x] = highlightStyle;
        });
        object3DLayer.featureVisibility.clearHighlighting();
        object3DLayer.featureVisibility.highlight(hightlightParameters);
      }

      function startQuery() {
        const query = buildQuery(
          selectedWMSLayer.value,
          selectedAttribute.value,
          selectedOperator.value,
          selectedCriteria.value,
        );
        const selectedObjectIDs = runQuery(query);
        if (selectedObject3D.value.name === undefined) {
          console.log('Please select 3D Object first');
        } else {
          highlightObjects(selectedObject3D.value.name, selectedObjectIDs);
        }
      }

      const availableOperators = computed(() => {
        // TODO: Make sure the type and the operator are available in WFS
        const selectedType = selectedAttribute.value.type;
        if (['number', 'double', 'integer'].includes(selectedType)) {
          return operator.number;
        } else if (selectedType === 'string') {
          return operator.string;
        } else if (selectedType === 'boolean') {
          return operator.boolean;
        } else {
          return [];
        }
      });

      return {
        state,
        operator,
        startQuery,
        clearHightlight,
        selectedLayerChanged,
        object3Ds,
        layers: wmsLayers,
        attributes,
        selectedObject3D,
        selectedLayer: selectedWMSLayer,
        selectedAttribute,
        selectedOperator,
        selectedCriteria,
        availableOperators,
      };
    },
  };
</script>

<style scoped></style>
