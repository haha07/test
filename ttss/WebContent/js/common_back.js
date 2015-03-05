
$(document).ready(function () {
    //gnb
    $("#gnb > ul").accessibleDropDown();
    style();
    storyShow();
    storyHide();
    resize();
    $(window).resize(function () {
        resize();
    });
});



//gnb
$.fn.accessibleDropDown = function () {

	$('#gnb > ul > li').mouseenter(function(){
		$(this).addClass('active');
		$('#gnb li.active div').show();
		}).mouseleave(function(){
			$(this).removeClass('active');
			$('.submenu').hide();
		});

	$("#gnb > ul > li > a").focus(function() {
		$(this).parents('li').addClass('active');
		$('#gnb li.active div').show();
		if($(this).hasClass('top')){
			$('.submenu').not($(this).parent("li").find(".submenu")).hide();
		}
	});

	$('#gnb > ul > li > a').focusout(function() {
		$(this).parents('li').removeClass('active');
			if($(this).hasClass('top')){
		$('.submenu').not($(this).parent("li").find(".submenu")).hide();
			}else{
		$('.submenu').not($(this).parents('.submenu')).hide(); 
		}
	});

	$('li:last-child > div > ul > li > a:last ').focusout(function(){
		$('.submenu').hide();
	}); 
	
	$('div.submenu > ul > li:last-child > a').addClass('bgnone');

}


function slide() {
    var pos = 0;
    var li_width = 100;
    var totalWidth = $(".scroll li").width() * $(".scroll li").length;
    $(".scroll ul").width(totalWidth)
    $(".right").click(function () {
        if (pos == totalWidth - 400) { return false; }
        pos += li_width;
        $(".scroll").animate({ scrollLeft: pos }, 500);
    });
    $(".left").click(function () {
        if (pos == 0) { return false; }
        pos -= li_width;
        $(".scroll").animate({ scrollLeft: pos }, 500);
    });
}

function leftOpen() {
    $('#leftCloseBt').removeClass('hidden');
    $('#leftOpenBt').addClass('hidden');
    $('#left').css("width", "302px");

}
function leftClose() {
    $('#leftCloseBt').addClass('hidden');
    $('#leftOpenBt').removeClass('hidden');
    $('#left').css("width", "12px");

}

function indexOpen() {
    $('#indexOffBt').removeClass('hidden');
    $('#indexOnBt').addClass('hidden');
    $('.indexmap').removeClass('hidden');
}
function indexClose() {
    $('#indexOffBt').addClass('hidden');
    $('#indexOnBt').removeClass('hidden');
    $('.indexmap').addClass('hidden');

}

function layerOpen() {
    $('#layerOffBt').removeClass('hidden');
    $('#layerOnBt').addClass('hidden');
    $('.layerbx').removeClass('hidden');
}
function layerClose() {
    $('#layerOffBt').addClass('hidden');
    $('#layerOnBt').removeClass('hidden');
    $('.layerbx').addClass('hidden');

}

function style() {
    $('.tblist thead th:last-child, .tblist tbody td:last-child, .tblist tfoot td:last-child').addClass('brnone');
	$('.tbview tbody th:last-child, .tbview tbody td:last-child').addClass('brnone');
	$('.tbview tbody tr:last-child th, .tbview tbody tr:last-child td').addClass('btcolor');

}

function storyShow() {
    $('#stOpen').click(function () {
        $('.stArea').show();
        $('#stOpen').hide();
        $('#stClose').show();
    });
}
function storyHide() {
    $('#stClose').click(function () {
        $('.stArea').hide();
        $('#stClose').hide();
        $('#stOpen').show();
    });
}



/* 지도팝업 리사이즈
-----------------------------------------------*/
function resize() {

        var doc_height = $(window).height();
        var mb_height; //검색결과영역
        var mbtn_height = ($('#map').height()/2) + 17;

        if (doc_height < 780) { mb_height = 780 - 200; }
        else {
            mb_height = doc_height - 200; //브라우저 - (상단메뉴+하단카피)
        }
        $('.resultBx').css("height", mb_height + "px");
       // $('#closeArea').show();
        $('#resultBx').css("height", mb_height - 60 + "px");

        $('.leftBtArea').css("top", mbtn_height + "px");
  

}