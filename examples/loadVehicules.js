// import { merge } from "grunt";

var colorVehicule = function (properties) {
    return properties.etat === "RETARD" ? color.set(0xFFA500) : color.set(0x32CD32);
}

var geometry = new THREE.BoxGeometry( 100, 50, 200 );
// var material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
// var sphere = new THREE.Mesh( geometry, material );

var styleModel3D = new itowns.Style({
    model: { object: geometry  }
});

var listeVehicule = new Map();
var vehicule3D = new itowns.THREE.Group();
var vehicule = new itowns.FeatureGeometryLayer('Vehicule', {
    object3d : vehicule3D,
    // Use a FileSource to load a single file once
    source: new itowns.FileSource({
        url: 'https://data.bordeaux-metropole.fr/geojson?key=139FGHJPRT&typename=sv_vehic_p',
        crs: 'EPSG:4326',
        format: 'application/json',
    }),
    // zoom: { min: 10 },
    style: styleModel3D
});
/*
vehicule.convert = tmp;
vehicule.update = FeatureProcessing.update;

var tmp = function(param) {
    debugger
    return Feature2Mesh.convert({batchId: config.batchId});
}
*/

function mergeAll ( object ) {

    var geometries = [];
    object.traverse( obj => {
        if(obj.geometry) {
            geometries.push(obj.geometry);
            console.log("pushed");
        }
    })
 
    var result = itowns.BufferGeometryUtils.mergeBufferGeometries( geometries , false) ;


    return result;
  }


function refresh(layer) {
    var rep = layer.source.fetcher(layer.source.url).then(handleResponse);


}

function handleResponse(responseCollection) {

    console.log(responseCollection);
    filterMovingObjects(responseCollection.features);
}

function filterMovingObjects(features) {
    // test juste sur 1 seul
    //features = features.slice(0,1);


    console.log(vehicule.style.model.object);
    features.forEach(element => {
        var key = element.properties.gid;
        if(key != undefined) {
          if(!listeVehicule.has(key)) { // pas trouvé dans les objects existants
            //addModel(element); // add new -- > déjà ajouté dans iTowns
            listeVehicule.set(key,element);
          } else {
                updateModel(element); // déjà présents : à updater 
            }
        }
          

    });

}

function updateModel(element) {
    //console.log("Update du véhicule " + id + element);
    let entity = cesiumViewer.entities.getById(element.properties.gid);

    if(entity == undefined) {
        console.warn("Pas d entity avec cet id");
        return;
    }

    let position;
    if(element.geometry != undefined) 
        position = element.geometry.coordinates; // [longi , lati]
    else 
    {
      console.warn("Pas de position à mettre à jour");
      return;
    }

    var newPosition = Cesium.Cartesian3.fromDegrees(
        position[0],
        position[1],
        0
      );

     /* if(previous.equals(current)) {
          console.log("Le véhicule n'a pas bougé.");
          return;
      }
*/

      // MAJ de l'orientation
      setOrientation(entity, entity.position.getValue(), getOrientation( newPosition, entity.position.getValue()));

      // MAJ position
   /*     var start = cesiumViewer.entities.add({
          id: "line" + Math.random(),
          position: entity.position,
          point: {
            pixelSize: 10,
            color: Cesium.Color.GREEN,
          }
        });

        var end = cesiumViewer.entities.add({
          id: "line" + Math.random(),
          position: newPosition,
          point: {
            pixelSize: 20,
            color: Cesium.Color.RED,
          }
        });
*/
        if(element.properties.vitesse != 0)
        {
          setExtrapolation(element, entity, newPosition)
        }
;
}


// Load a gltf model
    // Instantiate a loader
const loader = new THREE.GLTFLoader();

// Load a glTF resource

loader.load(
    // resource URL
    'http://localhost:9000/bus/scene.gltf',
    // called when the resource is loaded
    (gltf) => {
        // styleModel3D.model.object = gltf.scene; 
        //view.scene.add(gltf.scene);
        //mergeAll(gltf.scene);
        console.log(gltf);        
    },
    // called while loading is progressing
    (xhr) => {
        console.log(`${xhr.loaded / xhr.total * 100}% loaded`);
    },
    // called when loading has errors
    (error) => {
        console.log('An error happened :');
        console.log(error);
    },
); 



view.addLayer(vehicule).then(function menu(layer) {
    var gui = debug.GeometryDebug.createGeometryDebugUI(menuGlobe.gui, view, layer);
});



refresh(vehicule);
setTimeout(() => {
    refresh(vehicule);
}, 10500)