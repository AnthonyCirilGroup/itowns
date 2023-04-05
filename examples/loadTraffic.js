 
            var colorLine = function (properties) {
                switch (properties.etat) {
                    case 'FLUIDE':
                        color.set(0x18B62A);
                        break;
                    case 'EMBOUTEILLE':
                        color.set(0xDA1B1B);
                        break;
                    case 'DENSE':
                        color.set(0xDA9A1B);
                        break;
                    case 'INCONNU':
                    default:
                        color.set(0x6c6c6c);
                }
                return color;

            }

            var ligne = new itowns.FeatureGeometryLayer('LigneTransport', {
                // Use a FileSource to load a single file once
                source: new itowns.FileSource({
                    url: 'https://data.bordeaux-metropole.fr/geojson?key=139FGHJPRT&typename=ci_trafi_l',
                    crs: 'EPSG:4326',
                    format: 'application/json',
                }),
                style: new itowns.Style({
                    stroke : { color: colorLine, width: 5.0, opacity : 0.8 }
                })
                // zoom: { min: 10 },
            });
           
/*
            var PLU = new itowns.FeatureGeometryLayer('PLU', {
                // Use a FileSource to load a single file once
                source: new itowns.FileSource({
                    url: 'https://data.bordeaux-metropole.fr/geojson?key=139FGHJPRT&typename=p_info_s',
                    crs: 'EPSG:4326',
                    format: 'application/json',
                }),
                style: new itowns.Style({
                    fill: {
                        color: colorBuildings,
                    }
                }),
                convert : toto
                // zoom: { min: 10 },
            });*/




    
            view.addLayer(ligne).then(function menu(layer) {
                var gui = debug.GeometryDebug.createGeometryDebugUI(menuGlobe.gui, view, layer);
            });