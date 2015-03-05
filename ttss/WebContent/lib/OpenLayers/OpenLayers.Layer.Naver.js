/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Layer/XYZ.js
 */

OpenLayers.Layer.Naver = OpenLayers.Class(OpenLayers.Layer.XYZ, {
    name: "NaverMap",
    url: [
		"http://onetile1.map.naver.net/get/60/0/0/${z}/${x}/${y}/bl_vc_bg/ol_vc_an",
		"http://onetile2.map.naver.net/get/60/0/0/${z}/${x}/${y}/bl_vc_bg/ol_vc_an",
		"http://onetile3.map.naver.net/get/60/0/0/${z}/${x}/${y}/bl_vc_bg/ol_vc_an",
		"http://onetile4.map.naver.net/get/60/0/0/${z}/${x}/${y}/bl_vc_bg/ol_vc_an"
    ],
	sphericalMercator: false,
	transitionEffect: "resize",
	buffer: 1,
	displayOutsideMaxExtent: false,
    initialize: function(name, options) {
		if (!options) options = {resolutions: [2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25]};
		else if (!options.resolutions) options.resolutions = [2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25];
        var newArgs = [name, null, options];
        OpenLayers.Layer.XYZ.prototype.initialize.apply(this, newArgs);
    },
    clone: function(obj) {
        if (obj == null) {
            obj = new OpenLayers.Layer.Naver(
                this.name, this.getOptions());
        }
        obj = OpenLayers.Layer.XYZ.prototype.clone.apply(this, [obj]);
        return obj;
    },
	getXYZ: function(bounds) {
        var res = this.getServerResolution();
        var x = Math.round((bounds.left - this.maxExtent.left) /
            (res * this.tileSize.w));
        var y = Math.round((bounds.bottom - this.maxExtent.bottom) /
            (res * this.tileSize.h));
        var z = this.getServerZoom() + 1;

        if (this.wrapDateLine) {
            var limit = Math.pow(2, z);
            x = ((x % limit) + limit) % limit;
        }

        return {'x': x, 'y': y, 'z': z};
    },
    CLASS_NAME: "OpenLayers.Layer.Naver"
});
