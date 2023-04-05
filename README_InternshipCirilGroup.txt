This document describes the work of Adrien HAMERS during his 2 month internship (June-July 2022).


Dynamic opacity :
	Implemented a button allowing dynamic opacity. The closest the camera is to the ground, the more transparent the ground gets. This feature can be enabled/disabled in the debug menu.
	To instantiate the menu :
		//Requires import : "examples/js/GUI/GuiTools.js"
		//Requires import : "utils/debug/Debug.js"
		//View can be a GlobeView or a PlanarView
		//'menuDiv' is the name of the generated HTML div containing the debug menu
		var menuGlobe = new GuiTools('menuDiv', view);
		debug.createTileDebugUI(menuGlobe.gui, view);

	You can then check the 'Dynamic opacity' button. When true, the atmosphere will be disabled, making the background black, and the dynamic opacity will be toggled.
	The code for this feature is in TileDebug.js and View.js.
	In the options you provide when you create a View, you can now options.altitudeForZeroOpacity and options.altitudeForFullOpacity to configure the range of the dynamic opacity. Defaults are respectively 420 and 2400.
	Possible improvements :
		- When the ground is partly transparent, we can see the junction between the tiles. Fixing that would be a nice visual improvement.
		- The dynamic opacity feature can enter in conflict with the opacity slider in the debug menu. The solution would be to dynamically update the opacity slider when dynamicOpacity is enabled.

Underground camera :
	Parametered the camera, allowing it to go through the ground. Simply modify the following options of your view :
		//minDistance, when negative, allows to go through the ground by the provided distance.
		view.controls.minDistance = -50;
        	view.controls.handleCollision = false;

Displaying lines :
	Observed a problem with lines displaying using threeJS. On most windows machines, webGL is unable to display lines with variable width. It displays line of 1 pixel width instead. This is not the case on most linux/mac.
	Considered solutions :
		- Using FatLines, which is a workaround using dense chains of dots to simulate a line. Most promising option. It has allowed itowns to display variable width lines, but we couldn't figure out how to index the segments and to color them.
		- Using MeshLines, which is a workaround creating a 3D doubled sided flat textured mesh to display a line. Couldn't make it work in iTowns.
		- Using extruded cylinders. This is a good solution visually but can easily be resource-consuming on generation and displaying as we manipulate big data sets. Couldn't make it work in iTowns.
	The code for these implementation trials is in Feature2Mesh.js . At the bottom of the file, you can find the calls for these methods in a switch/case block. 

Vertical lines :
	Any dataset providing lines with Vector3 coordinates is considered vertical and will display as such. This allows two points of the line to be on top of each other.
	The default altitude of a dataset can be set in layer.style.stroke.base_altitude 