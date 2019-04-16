'use strict'


let RectSight = function () {
    // 預設為低於 32 毫秒不重新更新
    let windowRectUpdateInterval = 32;
    let itemRectUpdateInterval = 32;

    function RectSight(helTarget) {
        this.target = helTarget;
        this.prevUpdateStamp = 0;
        this.visible = false;
        this.visibility = 0;
        this.visibilityX = 0;
        this.visibilityY = 0;
        this.w = 0;
        this.h = 0;
        this.x = 0;
        this.y = 0;

        this.update(true);
    }

    RectSight.prototype.update = function (forse) {
        let helTarget = this.target;
        let currUpdateTimeMs = +new Date();

        if (!forse && currUpdateTimeMs - this.prevUpdateStamp < itemRectUpdateInterval) {
            return;
        }

        this.prevUpdateStamp = currUpdateTimeMs;

        let scrollX = window.scrollX;
        let scrollY = window.scrollY;
        let clientRect = helTarget.getBoundingClientRect();
        this.w = clientRect.width;
        this.h = clientRect.height;
        this.x = clientRect.x + scrollX;
        this.y = clientRect.y + scrollY;

        let windowRect = _windowRectInfo;

        if (currUpdateTimeMs - windowRect.prevUpdateStamp > windowRectUpdateInterval) {
            let windowWidth = window.innerWidth;
            let windowHeight = window.innerHeight;
            let windowTop = scrollY;
            let windowLeft = scrollX;
            windowRect.prevUpdateStamp = currUpdateTimeMs;
            windowRect.w = windowWidth;
            windowRect.h = windowHeight;
            windowRect.t = windowTop;
            windowRect.l = windowLeft;
        }

        this.visibilityX = _countVisibility(this.w, this.x, windowRect.w, windowRect.l);
        this.visibilityY = _countVisibility(this.h, this.y, windowRect.h, windowRect.t);
        // 高度的權重高於寬度
        this.visibility = this.visibilityX === 0 || this.visibilityY === 0
            ? 0
            : Math.round(0.4 * this.visibilityX + 0.6 * this.visibilityY)
        ;
        this.visible = this.visibility > 33;
    };

    let _windowRectInfo = {
        prevUpdateStamp: 0,
        w: 0,
        h: 0,
        t: 0,
        l: 0,
    };

    function _countVisibility(itemDistance, itemFront, windowDistance, windowFront) {
        let itemBack = itemFront + itemDistance;
        let windowBack = windowFront + windowDistance;
        let baseDistance = itemDistance < windowDistance ? itemDistance : windowDistance;
        let sideFront = itemFront > windowFront ? itemFront : windowFront;
        let sideBack = itemBack < windowBack ? itemBack : windowBack;

        let diffDistance = sideBack - sideFront;
        return diffDistance <= 0 ? 0 : parseInt(diffDistance / baseDistance * 100);
    }

    return RectSight;
}();

