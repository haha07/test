var singleFile = false;

(function() {
    if(!singleFile) {
        var jsfiles = new Array(
    		"GUtil.js",
			"GError.js",
			"GMapUtil.js",
			"GMap.js",
			"GRequest.js",
			"GMarker.js",
			"GIcon.js",
			"GIndexMap.js",
			"gbasetypes/GBounds.js",
			"gbasetypes/GSize.js",
			"gbasetypes/GLonLat.js",
			"gbasetypes/GPixel.js",
			"gcontrol/GAcss.js",
			"gcontrol/GAlis.js",
			"gcontrol/GDrag.js",
			"gcontrol/GDrawFeature.js",
			"gcontrol/GGetFeature.js",
			"gcontrol/GMeasure.js",
			"gcontrol/GModifyFeature.js",
			"gcontrol/GNavigationHistory.js",
			"gcontrol/GProfile.js",
			"gcontrol/GSelectFeature.js",
			"gcontrol/GZoomBoxIndex.js",
			"gcontrol/GZoomIn.js",
			"gcontrol/GZoomOut.js",
			"gcontrol/GPanZoomBar.js",
			//"gformat/gsld/v1_1_0.js",
			//"gformat/gsld/v1_1.js",
			"gformat/GSLD.js",
			"ghandler/GBox.js",
			"ghandler/GPath.js",
			"ghandler/GPathMeasure.js",
			"ghandler/GPathMeasure1.js",
			"ghandler/GPoint.js",
			"ghandler/GPolygon.js",
			"ghandler/GPolygonDraw.js",
			"ghandler/GPolygonMeasure.js",
			"ghandler/GPolygonMeasure1.js",
			"ghandler/GRegularPolygonDraw.js",
			"ghandler/GRegularPolygonDrawAttr.js",
			"ghandler/GTextDraw.js",
			"glayer/GTileCache.js",
			"glayer/GVector.js",
			"glayer/GWMS.js",
			"glayer/GWMSPost.js",
			//"gpopup/GAnchoredBubble.js",
			"gpopup/GPopup.js",
			"gtile/image/IFrame.js",
			"gtool/GDrawTool.js",
			"gtool/GLegendTool.js",
			"gtool/GSaveTool.js",
			"gtool/GSLDTool.js",
			"gtool/GTMapLayerTool.js",
			//"GMapParams.js",
			//"GGetFeatureParams.js",
			//"gmashup/OpenLayers.Layer.VWorldHybrid.js",
			"gopenapi/ginnoToc.js",
			"gopenapi/ginnoMap.js"
        );

        var agent = navigator.userAgent;
        var docWrite = (agent.match("MSIE") || agent.match("rv:11.0") || agent.match("Safari"));
        if(docWrite) {
            var allScriptTags = new Array(jsfiles.length);
        }
        // webapp 폴더를 기준으로 GMap Class 파일들이 위치한 경로
        var host = "lib/gmap/lib/";
        for (var i=0, len=jsfiles.length; i<len; i++) {
            if (docWrite) {
                allScriptTags[i] = "<script src='" + host + jsfiles[i] +
                                   "'></script>"; 
            } else {
                var s = document.createElement("script");
                s.src = host + jsfiles[i];
                var h = document.getElementsByTagName("head").length ? 
                           document.getElementsByTagName("head")[0] : 
                           document.body;
                h.appendChild(s);
            }
        }

        if (docWrite) {
            document.write(allScriptTags.join(""));
        }
    }
})();
