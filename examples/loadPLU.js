
 function colorPLU(properties) {
    if (properties.geojson.id.indexOf('bati_remarquable') === 0) {
        return color.set(0x5555ff);
    } else if (properties.geojson.id.indexOf('bati_industriel') === 0) {
        return color.set(0xff5555);
    }
    return color.set(0xeeeeee);
}


function extrudePLU(properties) {
    return 1000;
}

var PLU = new itowns.FeatureGeometryLayer('PLU', {
    // Use a FileSource to load a single file once
    source: new itowns.FileSource({
        url: 'https://data.bordeaux-metropole.fr/geojson?key=139FGHJPRT&typename=p_zoneurba_s',
        crs: 'EPSG:4326',
        format: 'application/json',
    }),
    style: new itowns.Style({
        fill: {
            color: colorPLU
        }
    })
    // zoom: { min: 10 },
});


view.addLayer(PLU).then(function menu(layer) {
    var gui = debug.GeometryDebug.createGeometryDebugUI(menuGlobe.gui, view, layer);
});