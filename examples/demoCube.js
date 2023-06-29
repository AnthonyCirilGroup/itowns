let view;

function genCubemap() {
    const zip = new JSZip();
    const button = document.createElement('button');
    button.id = 'savebtn';
    button.style.bottom = '0px';
    button.style.position = 'absolute';
    button.style.right = '0';
    button.style.zIndex = '1';
    button.textContent = 'SAVE';
    document.body.appendChild(button);


    // Create a div element with class loaderDiv
    const loaderDiv = $('<div></div>').addClass('loaderDiv');

    // Create a div element with class loading and text Loading...
    const loading = $('<div></div>').addClass('loading').text('Loading...');

    // Append the loading div to the loaderDiv
    loaderDiv.append(loading);

    // Hide the loaderDiv by default
    loaderDiv.hide();

    // Create a style element with the CSS rules for the loaderDiv and loading classes
    const style = $('<style></style>').text(`
    /* Transparent Overlay */
    .loading:before {
        content: '';
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(rgba(20, 20, 20, .8), rgba(0, 0, 0, .8));

        background: -webkit-radial-gradient(rgba(20, 20, 20, .8), rgba(0, 0, 0, .8));
    }
`);

    // Append the style element to the head of the document
    $('head').append(style);

    // Append the loaderDiv element to the body of the document
    $('body').append(loaderDiv);



    console.log(view.getLayers());


    // let THREE = itowns.THREE;
    let container; let stats; let
        controls;

    let camera; let scene; let
        renderer;
    // var faces = ["nx", "nz", "px", "ny", "py", "pz"];
    const faces = ['px', 'nz', 'nx', 'ny', 'py', 'pz'];

    const rotations = [
        [new THREE.Vector3(0, 1, 0), -Math.PI / 2], // droite    nx
        [new THREE.Vector3(0, 1, 0), Math.PI], // derriere   nz
        [new THREE.Vector3(0, 1, 0), Math.PI / 2], // gauche px

        [new THREE.Vector3(1, 0, 0), -Math.PI / 2], // bas   ny
        [new THREE.Vector3(1, 0, 0), Math.PI / 2], // haut   py

        [new THREE.Vector3(0, 0, 0), 0], // face pz
    ];

    document.querySelector('#savebtn').addEventListener('click', save);
    const loaderContainer = document.querySelector('.loaderDiv');
    camera = view.camera.camera3D;
    const near = camera.near;

    camera.updateProjectionMatrix();
    const g = view.mainLoop.gfxEngine;
    renderer = g.renderer;

    let i = 0;

    const clientSize = new THREE.Vector2();
    renderer.getSize(clientSize);

    const fov = camera.fov;

    const aspect = camera.aspect;

    function cubemap3() {
        const allReady = view.getLayers().every(layer => layer.ready);
        if (
            !(
                allReady &&
                view.mainLoop.scheduler.commandsWaitingExecutionCount() == 0 &&
                view.mainLoop.renderingState == 0
            )
        )
        // todo remove 0, crete new event
        { return; }

        renderer.render(view.scene, view.camera.camera3D);
        // view.notifyChange(view.camera.camera3D);

        if (i > 0) {
            const dataURL = renderer.domElement.toDataURL('image/png');

            // Extraire les données binaires de l'URL
            const data = dataURL.split(',')[1];
            zip.file(faces[i - 1] + '.png', data, { base64: true });


            // Créer un élément a avec les attributs appropriés
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = 'image.png';
            link.textContent = 'Télécharger ' + faces[i - 1];
            //      document.body.appendChild(link);

            camera.rotateOnAxis(rotations[i - 1][0], rotations[i - 1][1] * -1.0);
            // Ajouter les données binaires au fichier zip avec le nom de la face
        }

        if (i < 6) {
            camera.rotateOnAxis(rotations[i][0], rotations[i][1]);

            renderer.render(view.scene, view.camera.camera3D);
            view.notifyChange(view.camera.camera3D);
        }

        if (i == 6) {
            // Générer le fichier zip et le télécharger
            zip.generateAsync({ type: 'blob' }).then(function (blob) {
                saveAs(blob, 'cubemappng.zip'); // Utiliser la fonction saveAs de FileSaver.js
            });
            endCubemap();
            i = 0;
        } else { i++; }
    }

    function initCubemap() {
        loaderContainer.style.display = 'block';

        renderer.setSize(2048, 2048);
        // renderer.setSize(1024, 1024);
        camera.fov = 90;
        camera.aspect = 1.0;
        camera.near = 5;

        camera.updateProjectionMatrix();
        // old view.mainLoop.addEventListener("command-queue-empty", cubemap3);
        view.mainLoop.addEventListener('command-queue-empty', toCube);


        renderer.render(view.scene, view.camera.camera3D);
        view.notifyChange(view.camera.camera3D);
    }
    function endCubemap() {
        //   view.mainLoop.removeEventListener("command-queue-empty", cubemap3);
        view.mainLoop.removeEventListener('command-queue-empty', toCube);

        camera.near = near;
        renderer.setSize(clientSize.x, clientSize.y);
        camera.fov = fov;
        camera.aspect = aspect;
        camera.updateProjectionMatrix();
        renderer.render(view.scene, view.camera.camera3D);
        view.notifyChange(view.camera.camera3D);
        loaderContainer.style.display = 'none';
    }
    function save() {
        initCubemap();
    }


    let locked = false;

    function toCube() {
        if (locked) { return; } else { locked = true; }

        setTimeout(function () {
            cubemap3();
            locked = false;
        }, 5000);
    }



    const layers = view.getLayers();
    // Utiliser la méthode find() avec une fonction fléchée anonyme
    const pntsLayer = layers.find(o => o.name === 'fressines geredis');

    pntsLayer.onTileContentLoaded = function (tileContent) {
        tileContent.traverse(function (obj) {
            if (obj.isPoints) {
                // obj.material.size = 1.0;
                obj.material.size = 0.5;
            }
        });
    };
}
setTimeout(function () {
    /*
  var nuage_points_luxembourg = cesiumViewer.scene.primitives.get(0);
nuage_points_luxembourg.pointCloudShading.attenuation = true;
nuage_points_luxembourg.pointCloudShading.maximumAttenuation = 2;

  $.getScript("https://dev.business-geografic.com/yann/Module 3D 2.0/storytelling_lidar.js");

$.getScript("https://dev.business-geografic.com/yann/Module 3D 2.0/classification.js");

$('#classification').show ();

  $.getScript("https://dev.business-geografic.com/yann/Module 3D 2.0/lidar.js");

  */




    $.getScript(
        'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.0/FileSaver.min.js',
    );

    /* $.getScript(
    "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"
  ); */

    $.getScript(
        'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.js',
        function () {
            const mapService3D = angular
                .element(document.body)
                .injector()
                .get('mapService3D');
            mapService3D.getMap().then((mapView) => {
                view = mapView.view;
                // addAdministrativeLayer();
                //  debugger;

                genCubemap();
            });
        });
}, 4000);
