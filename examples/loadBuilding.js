/**
 * 
 * Buildings
 **/

 function colorBuildings(properties) {
    if (properties.geojson.id.indexOf('bati_remarquable') === 0) {
        return color.set(0x5555ff);
    } else if (properties.geojson.id.indexOf('bati_industriel') === 0) {
        return color.set(0xff5555);
    }
    return color.set(0xeeeeee);
}

function altitudeBuildings(properties) {
    return properties.z_min - properties.hauteur;
}

function extrudeBuildings(properties) {
    return properties.hauteur;
}

function acceptFeature(properties) {
    return !!properties.hauteur;
}

scaler = function update(/* dt */) {
    var i;
    var mesh;
    if (meshes.length) {
        view.notifyChange(view.camera.camera3D, true);
    }
    for (i = 0; i < meshes.length; i++) {
        mesh = meshes[i];
        if (mesh) {
            mesh.scale.z = Math.min(
                1.0, mesh.scale.z + 0.1);
            mesh.updateMatrixWorld(true);
        }
    }
    meshes = meshes.filter(function filter(m) { return m.scale.z < 1; });
};

view.addFrameRequester(itowns.MAIN_LOOP_EVENTS.BEFORE_RENDER, scaler);


var wfsBuildingSource = new itowns.WFSSource({
    url: 'https://wxs.ign.fr/3ht7xcw6f7nciopo16etuqp2/geoportail/wfs?',
    version: '2.0.0',
    typeName: 'BDTOPO_BDD_WLD_WGS84G:bati_remarquable,BDTOPO_BDD_WLD_WGS84G:bati_indifferencie,BDTOPO_BDD_WLD_WGS84G:bati_industriel',
    crs: 'EPSG:4326',
    ipr: 'IGN',
    format: 'application/json',
    extent: {
        west: -0.69918,
        east: -0.49,
        south: 44.76,
        north: 44.89,
    },
});

var wfsBuildingLayer = new itowns.FeatureGeometryLayer('WFS Building',{
    batchId: function (property, featureId) { return featureId; },
    onMeshCreated: function scaleZ(mesh) {
        mesh.children.forEach(c => {
            c.scale.z = 0.01;
            meshes.push(c);
        })
    },
    filter: acceptFeature,
    source: wfsBuildingSource,
    zoom: { min: 15 },

    style: new itowns.Style({
        fill: {
            color: colorBuildings,
            base_altitude: altitudeBuildings,
            extrusion_height: extrudeBuildings,
        }
    })
});

view.addLayer(wfsBuildingLayer).then(function menu(layer) {
    var gui = debug.GeometryDebug.createGeometryDebugUI(menuGlobe.gui, view, layer);
});