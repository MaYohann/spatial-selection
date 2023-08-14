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

function getLayerByName(app, name) {
    const layer = app.layers.getByKey(name)
    return layer
}

export {getLayerByClass, getLayerByName}
