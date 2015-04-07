# slider-widget
usege:
require('./slider.js',function(SliderShow){
	var slideShow = SliderShow.init('div.slide-page-con', 'div.slide-cnt');
        slideShow.$slideCnt[0].scrollLeft = 0;
        slideShow.addEventListener("slideMoved",function(evt){
        sliderCtr.currIndex=evt.realIdx;
    });

    // and you can call turnLeft turnRight to control slideShow
})
