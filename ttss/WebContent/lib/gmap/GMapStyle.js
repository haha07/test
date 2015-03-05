(function() {
	// css 적용
	// webapp 기준경로 이후의 CSS경로 입력
    var cssfiles = new Array(
		"/css/map.css",
		"/css/gmap/GMapStyle.css",
		"/lib/jstree/themes/default/style.min.css"
    );
    var agent = navigator.userAgent;
    var docWrite = (agent.match("MSIE") || agent.match("Safari"));
    if(docWrite) {
        var allCssTags = new Array(cssfiles.length);
    }
    
    for (var i=0, len=cssfiles.length; i<len; i++) {
        if (docWrite) {
        	allCssTags[i] = "<link rel='stylesheet' type='text/css' href='" + cssfiles[i] + "'/>"; 
        } else {
            var s = document.createElement("link");
            s.href = cssfiles[i];
            s.rel = "stylesheet";
            s.type = "text/css";
            var h = document.getElementsByTagName("head").length ? 
                       document.getElementsByTagName("head")[0] : 
                       document.body;
            h.appendChild(s);
        }
    }
    if (docWrite) {
        document.write(allCssTags.join(""));
    }
    
})();