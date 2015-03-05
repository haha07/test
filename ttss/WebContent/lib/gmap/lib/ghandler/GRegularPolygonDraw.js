GRegularPolygonDraw = OpenLayers.Class(OpenLayers.Handler.RegularPolygon, {
	
	attributes : null,
	
	callback: function (name, args) {
        // override the callback method to always send the polygon geometry
        if (this.callbacks[name]) {
            this.callbacks[name].apply(this.control,
                                       [this.feature.geometry.clone(), this.attributes]);
        }
        // since sketch features are added to the temporary layer
        // they must be cleared here if done or cancel
        if(!this.persist && (name == "done" || name == "cancel")) {
            this.clear();
        }
    },

	CLASS_NAME: "GRegularPolygonDraw"
});