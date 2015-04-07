//change1: add your jquery
var $ = require("your-jquery");

function SlideShow ($el, $slides, isAutoAnimate, options) {
    var that = this;
    this.$el = $el;
    this.$cnt;
    this.$slideCnt;

    this.duration = options.duration;
    this.isCycle = options.isCycle;
    this.curIdx = 0;
    this.slideWidth = this.$el.width();
    this.slidesNum = $slides.length;
    this.autoAnimateInterval = options.autoAnimateInterval || 5000;
    this.autoTurning = isAutoAnimate;

    this._leftBtnClickHandler = function (evt) {
        evt.preventDefault();
        that.turnLeft();
    };
    this._rightBtnClickHandler = function (evt) {
        evt.preventDefault();
        that.turnRight();
    };
    this._animationFinish = function (){
        that.isAnimating = false;
    };
    this._autoTurning = function () {
        that._timer = null;
        that.turnRight();
        that.startAutoAnimation();
    };
    this._mouseEnterHandler = function () {
        that.stopAutoAnimation();
    };
    this._mouseLeaveHandler = function () {
        that.startAutoAnimation();
    };
    this.realIdx = 0;

    $slides.addClass('slide-show-ctn');
    this._buildContainer($slides);
    $slides = null;

    if (isAutoAnimate) {
        this.startAutoAnimation();
    }
}
$.extend(SlideShow.prototype, {
    _buildContainer: function ($slides) {
        this.$el.append('<div class="mod-slide-show"><div class="cnt"></div></div>');
        this.$cnt = this.$el.find('div.cnt');
        this.$slideCnt = this.$el.find('div.mod-slide-show');
        this.$cnt.width(this.slideWidth * this.slidesNum);
        if (this.autoTurning) {
            this.$el.bind('mouseenter', this._mouseEnterHandler);
            this.$el.bind('mouseleave', this._mouseLeaveHandler);
        }

        $slides.appendTo(this.$cnt);
    },
    _moveSlide: function (moveTo, ele) {
        var method = {
            'first': 'prepend',
            'last': 'append'
        };
        this.$cnt[method[moveTo]](ele);
    },
    _moveFirstSlideToLast: function () {
        this._moveSlide('last', this.$cnt.children(':first'));
        this.curIdx--;
        this.$slideCnt[0].scrollLeft = this.slideWidth * this.curIdx;
    },
    _moveLastSlideToFirst: function () {
        this._moveSlide('first', this.$cnt.children(':last'));
        this.curIdx++;
        this.$slideCnt[0].scrollLeft = this.slideWidth * this.curIdx;
    },
    turnLeft: function () {
        if (this.isAnimating) {
            return this;
        }
        // this.stopAutoAnimation();
        if (this.curIdx == 0) {
            if (this.isCycle){
                this._moveLastSlideToFirst();
            }
            else {
                return;
            }
        }
        this._animate('left');
        this.curIdx--;
        this.realIdx--;
        if (this.realIdx < 0) {
            this.realIdx = this.slidesNum - 1;
        }
        // this.startAutoAnimation();
        //change2: add your event Dispatch
        dispatchEvent('slideMoved', {realIdx: this.realIdx});
        return this;
    },
    turnRight: function () {
        var pro;
        if (this.isAnimating){
            return this;
        }
        // this.stopAutoAnimation();
        if (this.curIdx == this.slidesNum - 1) {
            if (this.isCycle) {
                this._moveFirstSlideToLast();
            }
            else {
                return;
            }
        }
        pro = this._animate('right');
        this.curIdx++;
        this.realIdx++;
        if (this.realIdx >= this.slidesNum) {
            this.realIdx = 0;
        }
        // pro.then(this._animationFinish);
        // this.startAutoAnimation();
        //change3: add your event dispatch
        dispatchEvent('slideMoved', {realIdx: this.realIdx});
        return this;
    },
    _animate: function (direction) {
        var operator = {
            'left': '-=',
            'right': '+='
        }
        this.isAnimating = true;
        this.stopAutoAnimation();
        return this.$slideCnt.animate({"scrollLeft":operator[direction] + this.slideWidth}, this.duration, this._animationFinish);
    },
    setBtns: function ($leftBtn, $rightBtn) {
        $leftBtn.bind('click', this._leftBtnClickHandler);
        $rightBtn.bind('click', this._rightBtnClickHandler);
    },
    startAutoAnimation: function () {
        if (!this.autoTurning) {
            return;
        }
        if (!this._timer) {
            this._timer = setTimeout(this._autoTurning, this.autoAnimateInterval);
        }
    },
    stopAutoAnimation: function () {
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }
    },
    updateContentWidth: function () {
        this.stopAutoAnimation();
        if (this.isAnimating) {
            setTimeout(this.updateContentWidth.bind(this), this.duration);
            return ;
        }
        this.slideWidth = this.$el.width();
        this.$cnt.width(this.slideWidth * this.slidesNum);
        this.$slideCnt[0].scrollLeft = this.curIdx * this.slideWidth;
        this.startAutoAnimation();
    }
});
module.exports = {
    init: function (cntSel, slideSel, options) {
        var $cnt = $(cntSel),
            $slides = $(slideSel),
            $leftBtn,
            $rightBtn,
            settings = {
                leftBtnSel: '.slide-left-btn',
                rightBtnSel: '.slide-right-btn',
                autoAnimate: true,
                duration: 800,
                isCycle: true
            },
            slideObj,
            emptyFunc;
        if (!$cnt.length || $slides.length <= 1) {
            emptyFunc = new Function();
            return {
                updateContentWidth: emptyFunc,
                stopAutoAnimation: emptyFunc,
                startAutoAnimation: emptyFunc,
                setBtns: emptyFunc,
                turnRight: emptyFunc,
                turnLeft: emptyFunc,
                addEventListener: emptyFunc,
                removeEventListener: emptyFunc
            };
        }
        $.extend(settings, options);
        $leftBtn = $(settings.leftBtnSel);
        $rightBtn = $(settings.rightBtnSel);

        slideObj = new SlideShow($cnt, $slides, settings.autoAnimate, {
            duration: settings.duration,
            isCycle: settings.isCycle
        });
        if ($leftBtn.length && $rightBtn.length) {
            slideObj.setBtns($leftBtn, $rightBtn);
        }

        return slideObj;
    }
};