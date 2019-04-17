
void async function (getEmbodiesSiteInfo, getCreateView) {
    let embodiesSiteInfo;
    try {
        embodiesSiteInfo = await getEmbodiesSiteInfo();
        console.log(embodiesSiteInfo);
    } catch (err) {
        throw err;
    }

    let helWrap = document.querySelector('.sitePageWrap');
    let createView = getCreateView(1280 / 256, 720/ 140);

    embodiesSiteInfo.forEach(function (item) {
        createView(helWrap, item.sitename, item.briefly);
    });
}(
    function getEmbodiesSiteInfo() {
        return new Promise(async function (resolve, reject) {
            let embodiesSiteInfoPath = 'embodiesSite.json';

            let err;
            let embodiesSiteInfoFetcher;
            [err, embodiesSiteInfoFetcher] = await asyncTryCatch(fetch(embodiesSiteInfoPath));
            if (err) {
                reject(err);
                return;
            }

            if (embodiesSiteInfoFetcher.status !== 200) {
                reject(Error('fetch error code : ' + embodiesSiteInfoFetcher.status));
                return;
            }
            let embodiesSiteInfoTxt;
            [err, embodiesSiteInfoTxt] = await asyncTryCatch(embodiesSiteInfoFetcher.text());
            if (err) {
                reject(err);
                return;
            }
            let embodiesSiteInfo = JSON.parse(embodiesSiteInfoTxt);

            resolve(embodiesSiteInfo);

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
        });
    },
    function getCreateView(scaleRateX, scaleRateY) {
        let helStyle = document.createElement('style');
        let styleOpts_rem = 16;
        let styleOpts = {
            rem: styleOpts_rem,
            boxWidth: 14.4,
            boxHeight: 8.1,
        };
        styleOpts.viewWidth = styleOpts.boxWidth * scaleRateX;
        styleOpts.viewHeight = styleOpts.boxHeight * scaleRateY;
        styleOpts.viewOffsetX
            = -1 * scaleRateX * (styleOpts.boxWidth * (scaleRateX - 1)) / 2;
        styleOpts.viewOffsetY
            = -1 * scaleRateY * (styleOpts.boxHeight * (scaleRateY - 1)) / 2;
        helStyle.appendChild(document.createTextNode(`
            .sitePage {
                font-size: 16px;
                margin: 0.8em;
                width: ${styleOpts.boxWidth}em;
                display: inline-block;
                overflow: hidden;
                box-shadow: 0 0 1px 1px rgba(0, 0, 0, 0.1);
            }
            .sitePage:hover {
                box-shadow: 0 0 16px 2px rgba(0, 0, 0, 0.2);
            }
            .sitePageWrap {
                text-align: center;
            }
            .sitePage > a {
                text-decoration: none;
                color: #333;
            }
            .sitePage_preview {
                width: ${styleOpts.boxWidth}em;
                height: ${styleOpts.boxHeight}em;
            }
            .sitePage_preview > iframe {
                width: ${styleOpts.viewWidth}em;
                height: ${styleOpts.viewHeight}em;
                pointer-events: none;
                transform:
                    scale(${1 / scaleRateX}, ${1 / scaleRateY})
                    translate(${styleOpts.viewOffsetX}em, ${styleOpts.viewOffsetY}em);
            }
            .sitePage_briefly {
                font-size: 0.9em;
                margin: 0.4em;
                height: 2.4em;
                overflow: hidden;
                line-height: 1.2em;
                white-space: nowrap;
                text-overflow: ellipsis;

                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
            }
        `));
        document.head.appendChild(helStyle);

        return function createView(helWrap, url, briefly) {
            let helView = document.createElement('div');
            let helIfram = document.createElement('iframe');
            helIfram.frameBorder = 0;
            helIfram.scrolling = 'no';
            helIfram.src = url;
            helView.className = 'sitePage_preview';
            helView.appendChild(helIfram);

            let helBriefly = document.createElement('p');
            helBriefly.className = 'sitePage_briefly';
            helBriefly.innerHTML = briefly;

            let helSitePage = document.createElement('div');
            let helLink = document.createElement('a');
            helLink.href = url;
            helLink.appendChild(helView);
            helLink.appendChild(helBriefly);
            helSitePage.className = 'sitePage';
            helSitePage.appendChild(helLink);
            helWrap.appendChild(helSitePage);
        }
    }
);

