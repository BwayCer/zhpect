
void function () {
    /**
     * 翻譯
     *
     * @namespace {Object} translate
     */
    var translate = window.translate = {};

    /**
     * 運行
     *
     * @memberof translate.
     * @func run
     * @param {*} item
     * @return {*} 翻譯後的新物件。
     *
     * @example
     * translate.run([
     *     '蓼蓼者莪', '匪莪伊蒿', '哀哀父母', '生我劬勞', '蓼蓼者莪', '匪莪伊蔚', '哀哀父母', '生我勞瘁',
     *     '瓶之罄矣', '維罍之恥', '鮮民之生', '不如死之久矣', '無父何怙', '無母何恃', '出則銜恤', '入則靡至',
     *     '父兮生我', '母兮鞠我', '撫我畜我', '長我育我', '顧我復我', '出入腹我', '欲報之德', '昊天罔極',
     *     '南山烈烈', '飄風發發', '民莫不穀', '我獨何害', '南山律律', '飄風弗弗', '民莫不穀', '我獨不卒'
     * ]);
     */
    translate.run = async function (item) {
        var total = _recursiveJsonCount(item, 0);
        console.log(total);
        var [newItem, _] = await _recursiveJson(item, 0, total);
        console.log(newItem, JSON.stringify(newItem, null, 4));
        return newItem;
    };

    function _recursiveJsonCount(item, countArgu) {
        var key, val;
        var count = countArgu;
        switch (item == null ? null : item.constructor) {
            case Array:
            case Object:
                for (key in item) {
                    count = _recursiveJsonCount(item[key], count);
                }
                return count;
            case String:
                return count + 1;
            default:
                return count;
        }
    }

    function _recursiveJson(item, countArgu, total) {
        return new Promise(async function (resolve, reject) {
            var key, val;
            var count = countArgu;
            var ans = null;
            switch (item == null ? null : item.constructor) {
                case Array:
                    ans = [];
                case Object:
                    ans = ans !== null ? ans : {};
                    if (count === 0 && total > 49) {
                        console.log('紀錄翻譯物件：', ans);
                    }
                    for (key in item) {
                        [ans[key], count] = await _recursiveJson(item[key], count, total);
                    }
                    break;
                case String:
                    ans = await translate.input(item);
                    count++;
                    if (count % 7 === 0) {
                        console.log(`目前進度： ${count}/${total}`);
                    }
                    break;
                default:
                    ans = item;
                    break;
            }
            resolve([ans, count]);
        });
    }

    var _helTxtIn = document.querySelector('#source');
    var _output = console.log.bind(console);

    /**
     * 輸出
     *
     * @memberof translate.
     * @func output
     * @param {String} txt
     */
    translate.output = _output;

    /**
     * 輸入
     *
     * @memberof translate.
     * @func input
     * @param {String} txt
     * @return {Promise}
     */
    translate.input = function (txt) {
        return new Promise(function (resolve, reject) {
            var outputOriginal = translate.output;
            _helTxtIn.value = txt;
            translate.output = function (txt) {
                resolve(txt);
                translate.output = outputOriginal;
            };
        });
    };

    // 谷歌翻譯的函數
    window.H = function(a, b) {
        window.y(null != a, 'goog.dom.setTextContent expects a non-null value for node');
        // 比對元素標籤
        var helTxtOut = document.querySelector('.results-container .translation')
        if (a === helTxtOut && !/\.{3}$/.test(b)) {
            translate.output(b);
        }
        if ('textContent' in a) {
            a.textContent = b;
        } else if (3 == a.nodeType) {
            a.data = String(b);
        } else if (a.firstChild && 3 == a.firstChild.nodeType) {
            for ( ; a.lastChild != a.firstChild ; ) {
                a.removeChild(y(a.lastChild));
            }
            a.firstChild.data = String(b)
        } else {
            xf(a);
            var c = $e(a);
            a.appendChild(c.createTextNode(String(b)))
        }
    };
}();

