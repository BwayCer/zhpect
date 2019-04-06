'use strict'


function asyncTryCatch(promise, errMsg) {
    return promise
        .then(function (result) {
            if (errMsg) {
                return Promise.resolve(result);
            } else {
                return Promise.resolve([null, result]);
            }
        })
        .catch(function (err) {
            if (errMsg) {
                console.error(errMsg);
                throw err;
            } else {
                return Promise.resolve([err]);
            }
        })
    ;
}

void async function (getZhpectInfo, createSettingBtn, setEventHandle) {
    let zhpectInfo;
    try {
        zhpectInfo = await getZhpectInfo();
    } catch (err) {
        throw err;
    }

    setEventHandle(zhpectInfo, createSettingBtn(zhpectInfo._defaultOther));
}(
    function getZhpectInfo() {
        return new Promise(async function (resolve, reject) {
            let zhpectInfoPath = '';
            Array.from(document.scripts).some(function (helItem) {
                let zhpectSrc = helItem.dataset.zhpectSrc;
                if (zhpectSrc) {
                    zhpectInfoPath = zhpectSrc;
                }
                return !!zhpectSrc;
            });

            if (!zhpectInfoPath) {
                let currentPath = location.pathname.replace(/(\.\w+)?\/*$/, '');
                zhpectInfoPath = currentPath === '' ? '/' : currentPath + '.zhpect.json'
            }

            let err;
            let zhpectInfoFetcher;
            [err, zhpectInfoFetcher] = await asyncTryCatch(fetch(zhpectInfoPath));
            if (err) {
                reject(err);
                return;
            }

            if (zhpectInfoFetcher.status !== 200) {
                reject(Error('fetch error code : ' + zhpectInfoFetcher.status));
                return;
            }
            let zhpectInfoTxt;
            [err, zhpectInfoTxt] = await asyncTryCatch(zhpectInfoFetcher.text());
            if (err) {
                reject(err);
                return;
            }
            let zhpectInfo = JSON.parse(zhpectInfoTxt);


            /***
             * 檢查 ZhpectInfo
             *   { "_defaultOther": ["A", "B", "C", ...]
             *     "A": {...},
             *     "B": {...},
             *     "C": {...} }
             */
            let isOkZhpectInfo = function _checkZhpectInfo(zhpectInfo) {
                let list = zhpectInfo._defaultOther;
                if (!list || list.constructor !== Array || list.length === 0) {
                    return false;
                }
                return !list.some(function (langArea) {
                    if (langArea === 'origin') {
                        return false;
                    }
                    return !zhpectInfo[langArea];
                });
            }(zhpectInfo);

            if (!isOkZhpectInfo) {
                reject(Error('The file isn\'t "zhpect.json" ("' + zhpectInfoPath + '")'));
                return;
            }

            resolve(zhpectInfo);
        });
    },
    function createSettingBtn(defaultOther) {
        let helStyle = document.createElement('style');
        let styleOpts_rem = 16;
        let styleOpts = {
            rem: styleOpts_rem,
            btnSideWPB: styleOpts_rem * 2.3,
            btnSide: styleOpts_rem * 2.3 - 2,
            btnRect: styleOpts_rem * 2.3,
            toOriginColor: '#007bff',
            toOtherColor: '#d2ce56',
            toSettingColor: '#6f7c8a',
        };
        helStyle.appendChild(document.createTextNode(`
            .zhpectSetting {
                width: ${styleOpts.btnSideWPB + 2}px;
                padding: 1px;
                position: fixed;
                top: 0;
                right: 0;
                border-radius: initial;
                transition: all 0.4s;
                box-sizing: content-box;
                z-index: 999999999999;
            }
            .zhpectSetting.onClose {
                height: ${styleOpts.btnSideWPB + 2}px;
                top: ${-1 * (styleOpts.btnSideWPB + 2 + 2) / 2 - 14}px;
                right: ${-1 * (styleOpts.btnSideWPB + 2 + 2) / 2 - 14}px;
                border: 7px solid ${styleOpts.toOriginColor};
                border-radius: 0 0 0 60%;
                overflow: hidden;
                background: #fff;
                transition: initial;
            }
            .zhpectSetting.onClose > * {
                display: none;
            }
            .zhpectSetting .markMainBtn,
            .zhpectSetting .markOtherBtn,
            .zhpectSetting .markSettingBtn {
                width: ${styleOpts.btnSide}px;
                height: ${styleOpts.btnSide}px;
                margin: 1px;
                border: 1px solid;
                border-radius: ${styleOpts.rem * 0.25}px;
                text-align: center;
                background: #fff;
                cursor: pointer;
            }
            .zhpectSetting_mainBtn {
                border-color: ${styleOpts.toOriginColor};
                line-height: ${styleOpts.rem * 2}px;
                text-align: center;
                color: ${styleOpts.toOriginColor};
            }
            .zhpectSetting_toolBtn {
                border-color: ${styleOpts.toSettingColor};
                line-height: ${styleOpts.rem * 1.8}px;
                text-align: center;
                color: ${styleOpts.toSettingColor};
            }
            .zhpectSetting_mainBtn::before,
            .zhpectSetting_toolBtn::before {
                content: attr(data-sign);
                width: 92%;
                height: 92%;
                margin: 4%;
                display: block;
                font-weight: 900;
            }
            .zhpectSetting_mainBtn::before {
                font-size: 1.2em;
            }
            .zhpectSetting_toolBtn::before {
                font-size: 1.6em;
            }
            .zhpectSetting_otherBtn {
                border-color: ${styleOpts.toOtherColor};
                line-height: 2em;
                text-align: center;
                color: ${styleOpts.toOtherColor};
            }
            .markOtherBtn::before,
            .markOtherBtn::after {
                content: attr(data-sign);
                font-size: ${styleOpts.rem * 0.7}px;
                width: 92%;
                margin: 4%;
                display: block;
                line-height: ${styleOpts.rem * 0.7}px;
                overflow: hidden;
                font-weight: 900;
            }
            .markOtherBtn::before {
                content: attr(data-sign-lang);
                margin-top: ${styleOpts.btnSide / 2 - styleOpts.rem * 0.7}px;
                margin-bottom: 0;
            }
            .markOtherBtn::after {
                content: attr(data-sign-area);
                margin-top: 0;
                margin-bottom: ${styleOpts.btnSide / 2 - styleOpts.rem * 0.7}px;
            }
        `));
        let helSetting = document.createElement('div');
        helSetting.className = 'zhpectSetting onClose';
        let helMainBtn = document.createElement('div');
        helMainBtn.className = 'zhpectSetting_mainBtn markMainBtn';
        helMainBtn.dataset.sign = 'T';
        helSetting.appendChild(helMainBtn);
        let helToolBtn = document.createElement('div');
        helToolBtn.className = 'zhpectSetting_toolBtn markSettingBtn';
        helToolBtn.dataset.sign = '₪';
        // helSetting.appendChild(helToolBtn);
        defaultOther.slice(0,4).reduce(function (langAreaList, langArea) {
            if (langAreaList.length < 4 && langArea !== 'origin') {
                langAreaList.push(langArea);
            }
            return langAreaList;
        }, []).forEach(function (langArea) {
            let matchLangArea = langArea.match(/^([^_]+)_(.+)$/);
            if (!matchLangArea) return;
            let langTxt = matchLangArea[1];
            let areaTxt = matchLangArea[2];
            let helOtherBtn = document.createElement('div');
            helOtherBtn.className = 'zhpectSetting_otherBtn markOtherBtn';
            helOtherBtn.dataset.signLang = langTxt;
            helOtherBtn.dataset.signArea = areaTxt;
            helSetting.appendChild(helOtherBtn);
        });
        document.head.appendChild(helStyle);
        document.body.appendChild(helSetting);

        return [helSetting, helMainBtn, helToolBtn];
    },
    function setEventHandle(zhpectInfo, [helSetting, helMainBtn, helToolBtn]) {
        let rectSightList = [];
        Array.from(document.querySelectorAll('[data-zhpect-trans]'))
            .forEach(function (helItem) {
                rectSightList.push(new RectSight(helItem));
            })
        ;

        let originalTextFieldName = 'origin';
        let originTranslationInfo = zhpectInfo[originalTextFieldName];
        if (!originTranslationInfo || originTranslationInfo.constructor !== Object) {
            zhpectInfo[originalTextFieldName] = {};
        }

        function zhpectHandle() {
            let zhpectInfo = zhpectHandle._zhpectInfo;
            let useLangArea = zhpectHandle._useLangArea;
            let translationInfo =
                zhpectInfo[useLangArea]
                || zhpectInfo[zhpectInfo._defaultOther[0]]
            ;

            rectSightList.forEach(function (rectSight) {
                rectSight.update();
                if (rectSight.visibility < 5) {
                    return;
                }

                let target = rectSight.target;
                if (target.dataset.zhpectLang === useLangArea) {
                    return;
                }

                let zhpectTrans = target.dataset.zhpectTrans;
                let translationTxt = translationInfo[zhpectTrans];
                if (typeof translationTxt !== 'string') {
                    return;
                }
                if (!zhpectInfo[originalTextFieldName].hasOwnProperty(zhpectTrans)) {
                    zhpectInfo[originalTextFieldName][zhpectTrans] = target.textContent;
                }

                target.dataset.zhpectLang = useLangArea;
                target.textContent = translationTxt;
            });
        }
        zhpectHandle._zhpectInfo = zhpectInfo;
        zhpectHandle._useLangArea = zhpectInfo._defaultOther[0];

        function selectstartHandle() {
            return false;
        }

        let stateInfoOfSettingHel = {
            isOpenState: false,
            timeId: -1,
        };
        function mouseenterHandle() {
            stateInfoOfSettingHel.isOpenState = true;
            this.classList.remove('onClose');
        }
        function mouseleaveHandle() {
            stateInfoOfSettingHel.isOpenState = false;
            if (!~stateInfoOfSettingHel.timeId) {
                clearTimeout(stateInfoOfSettingHel.timeId);
            }
            stateInfoOfSettingHel.timeId = setTimeout(
                mouseleaveHandle.delayCloseSetting,
                66,
                this
            );
        };
        mouseleaveHandle.delayCloseSetting = function (self) {
            stateInfoOfSettingHel.timeId = -1;
            if (!stateInfoOfSettingHel.isOpenState) {
                self.classList.add('onClose');
            }
        };

        function unityClickHandle(evt) {
            let clickedHelinfo = {
                typeClass: null,
                target: null,
            };
            evt.path.some(function (helItem) {
                return ['markOtherBtn', 'markMainBtn', 'markSettingBtn'].some(function (className) {
                    let isFindTarget = helItem.classList.contains(className);
                    if (isFindTarget) {
                        clickedHelinfo.typeClass = className;
                        clickedHelinfo.target = helItem;
                    }
                    return isFindTarget;
                });
            });

            switch (clickedHelinfo.typeClass) {
                case 'markOtherBtn':
                    let dataset = clickedHelinfo.target.dataset;
                    zhpectHandle._useLangArea
                        = dataset.signLang
                        + '_' + dataset.signArea;
                    zhpectHandle();
                    break;
                case 'markMainBtn':
                    zhpectHandle._useLangArea = originalTextFieldName;
                    zhpectHandle();
                    break;
                case 'markSettingBtn':
                    break;
            }
        }

        helSetting.addEventListener('selectstart', selectstartHandle, false);
        helSetting.addEventListener('mouseenter', mouseenterHandle, false);
        helSetting.addEventListener('mouseleave', mouseleaveHandle, false);
        helSetting.addEventListener('click', unityClickHandle, false);
        helMainBtn.addEventListener('click', zhpectHandle, false);
        // helToolBtn.addEventListener('click', function () {...}, false);

        zhpectHandle();
        new EventIntervalManager('scroll', 128, Infinity).add(zhpectHandle);
    }
);

