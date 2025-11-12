import $ from 'jquery';
import { _CONFIG_ } from './config';
import type { VideoParseItem } from './config';
import { util } from './utils';

const superVip = (function () {

    class BaseConsumer {
        parse(): void {
            util.findTargetEle('body')
                .then((container) => this.preHandle(container))
                .then((container) => this.generateElement(container as HTMLElement))
                .then((container) => this.bindEvent(container as HTMLElement))
                .then((container) => this.autoPlay(container as HTMLElement))
                .then((container) => this.postHandle(container as HTMLElement));
        }

        preHandle(container: Element): Promise<Element> {
            if (!_CONFIG_.currentPlayerNode) {
                return Promise.resolve(container);
            }
            _CONFIG_.currentPlayerNode.displayNodes.forEach((item: string) => {
                util.findTargetEle(item)
                    .then((obj) => (obj as HTMLElement).style.display = 'none')
                    .catch(e => console.warn("不存在元素", e));
            });
            return Promise.resolve(container);
        }

        generateElement(container: HTMLElement): Promise<HTMLElement> {
            GM_addStyle(`
                #${_CONFIG_.vipBoxId} {cursor:pointer; position:fixed; top:180px; z-index:999999; text-align:center; width: 75px; transition: all 0.3s ease-in-out;}
                #${_CONFIG_.vipBoxId}.snap-right { right:-45px; }
                #${_CONFIG_.vipBoxId}.snap-right:hover { right: 0; }
                #${_CONFIG_.vipBoxId}.snap-left { left:-45px; }
                #${_CONFIG_.vipBoxId}.snap-left:hover { left: 0; }

                #${_CONFIG_.vipBoxId} .vip_icon {
                    width:70px; height:40px; background: #2c2c2c; border-radius: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                    display:flex; align-items:center; justify-content:center;
                    font-size:16px; font-weight:bold; color: #ffc107;
                    border: 2px solid #444;
                    transition: all 0.3s ease;
                }
                #${_CONFIG_.vipBoxId}:hover .vip_icon {
                     border-color: #ffc107;
                     box-shadow: 0 0 15px rgba(255,193,7,0.5);
                }

                #${_CONFIG_.vipBoxId} .vip_list {
                    display:none; position:absolute; top: 50%; transform: translateY(-50%);
                    text-align:left; background: #2b2b2b; border: 1px solid #444;
                    border-radius:8px; padding:15px; width:420px; max-height:450px; overflow-y:auto;
                    box-shadow: 0 5px 25px rgba(0,0,0,0.5);
                }
                #${_CONFIG_.vipBoxId}.snap-right .vip_list { right:85px; }
                #${_CONFIG_.vipBoxId}.snap-left .vip_list { left:85px; }
                #${_CONFIG_.vipBoxId} .vip_list h3{
                    color:#00aaff; font-weight: bold; font-size: 16px; padding-bottom:8px; margin-bottom: 12px;
                    border-bottom: 1px solid #444; text-shadow: 0 0 4px rgba(0,170,255,0.7);
                }
                #${_CONFIG_.vipBoxId} .vip_list ul{
                    padding-left: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 10px;
                }
                #${_CONFIG_.vipBoxId} .vip_list li{
                    list-style: none;
                    border-radius:5px; font-size:13px; color:#ddd; text-align:center;
                    line-height:30px; height: 30px;
                    background: #3c3c3c;
                    border:1px solid #555;
                    padding:0 4px; margin:0;
                    overflow:hidden;white-space: nowrap;text-overflow: ellipsis;
                    transition: all 0.2s ease;
                }
                #${_CONFIG_.vipBoxId} .vip_list li:hover{
                    color:#fff; border-color: #00aaff; background: #00aaff;
                    transform: scale(1.05);
                    box-shadow: 0 0 15px rgba(0,170,255,0.5);
                }
                #${_CONFIG_.vipBoxId} li.selected{
                    color:#fff; border-color: #00aaff; background: #00aaff;
                    box-shadow: 0 0 15px rgba(0,170,255,0.5);
                }

                #${_CONFIG_.vipBoxId} .vip_list .info-box {
                    text-align:left;color:#999;font-size:11px;padding:10px;margin-top:15px;
                    background: #222; border-radius: 5px; border-top: 1px solid #444;
                }
                #${_CONFIG_.vipBoxId} .vip_list .info-box b { color: #00aaff; }

                #${_CONFIG_.vipBoxId} .panel-footer {
                    margin-top: 15px; padding-top: 10px; border-top: 1px solid #444;
                    display: flex; justify-content: flex-end; align-items: center; color: #ccc; font-size: 14px;
                }
                #${_CONFIG_.vipBoxId} .toggle-switch {
                    width: 40px; height: 22px; background: #555; border-radius: 11px; margin-left: 10px;
                    position: relative; cursor: pointer; transition: background 0.3s;
                }
                #${_CONFIG_.vipBoxId} .toggle-switch.on { background: #00aaff; }
                #${_CONFIG_.vipBoxId} .toggle-handle {
                    width: 18px; height: 18px; background: #fff; border-radius: 50%;
                    position: absolute; top: 2px; left: 2px;
                    transition: left 0.3s;
                }
                #${_CONFIG_.vipBoxId} .toggle-switch.on .toggle-handle { left: 20px; }

                #${_CONFIG_.vipBoxId} .vip_list::-webkit-scrollbar{width:5px; height:1px;}
                #${_CONFIG_.vipBoxId} .vip_list::-webkit-scrollbar-thumb{box-shadow:inset 0 0 5px rgba(0, 0, 0, 0.2); background:#666; border-radius: 5px;}
                #${_CONFIG_.vipBoxId} .vip_list::-webkit-scrollbar-track{box-shadow:inset 0 0 5px rgba(0, 0, 0, 0.2); background:#333; border-radius: 5px;}
				`);

            if (_CONFIG_.isMobile) {
                GM_addStyle(`
                    #${_CONFIG_.vipBoxId} {top:300px;}
                    #${_CONFIG_.vipBoxId} .vip_list {width:300px;}
                    `);
            }

            let type_1_str = "";
            let type_2_str = "";
            let type_3_str = "";
            _CONFIG_.videoParseList.forEach((item, index) => {
                if (item.type.includes("1")) {
                    type_1_str += `<li class="nq-li" title="${item.name}1" data-index="${index}">${item.name}</li>`;
                }
                if (item.type.includes("2")) {
                    type_2_str += `<li class="tc-li" title="${item.name}" data-index="${index}">${item.name}</li>`;
                }
                if (item.type.includes("3")) {
                    type_3_str += `<li class="tc-li" title="${item.name}" data-index="${index}">${item.name}</li>`;
                }
            });

            let isAutoPlayOn = !!GM_getValue(_CONFIG_.autoPlayerKey, null);

            $(container).append(`
                <div id="${_CONFIG_.vipBoxId}">
                    <div class="vip_icon" title="选择解析源">VIP</div>
                    <div class="vip_list">
                        <div>
                            <h3>[内嵌播放]</h3>
                            <ul>
                                ${type_1_str}
                            </ul>
                        </div>
                        <div>
                            <h3>[弹窗播放带选集]</h3>
                            <ul>
                                ${type_2_str}
                            </ul>
                        </div>
                        <div>
                            <h3>[弹窗播放不带选集]</h3>
                            <ul>
                                ${type_3_str}
                            </ul>
                        </div>
                        <div class="info-box">
                            <b>自动解析功能说明：</b>
                            <br>&nbsp;&nbsp;1、自动解析功能默认关闭（自动解析只支持内嵌播放源）
                            <br>&nbsp;&nbsp;2、开启自动解析，网页打开后脚本将根据当前选中的解析源自动解析视频。如解析失败，请手动选择不同的解析源尝试
                            <br>&nbsp;&nbsp;3、没有选中解析源将随机选取一个
                            <br>&nbsp;&nbsp;4、如某些网站有会员可以关闭自动解析功能
                        </div>
                        <div class="panel-footer">
                            <span>自动解析</span>
                            <div class="toggle-switch ${isAutoPlayOn ? 'on' : ''}" id="vip_auto_toggle">
                                <div class="toggle-handle"></div>
                            </div>
                        </div>
                    </div>
                </div>`);

            const savedTop = GM_getValue("vip_button_pos_top", null) as number | null;
            const savedSide = GM_getValue("vip_button_side", "right") as 'left' | 'right';
            const vipBox = $(`#${_CONFIG_.vipBoxId}`);

            if (savedTop !== null) {
                vipBox.css({top: savedTop + 'px'});
            }
            vipBox.addClass(savedSide === 'left' ? 'snap-left' : 'snap-right');

            return Promise.resolve(container);
        }

        bindEvent(container: HTMLElement): Promise<HTMLElement> {
            const vipBox = $(`#${_CONFIG_.vipBoxId}`);
            let wasDragged = false;

            vipBox.find(".vip_icon").on("click", (e) => {
                if(wasDragged) {
                    e.stopPropagation();
                    return;
                }
                e.stopPropagation();
                vipBox.find(".vip_list").toggle();
            });

            $(document as any).on("click", (e: any) => {
                if (!vipBox.is(e.target) && vipBox.has(e.target).length === 0) {
                    vipBox.find(".vip_list").hide();
                }
            });

            let _this = this;
            vipBox.find(".vip_list .nq-li").each((liIndex, item) => {
                item.addEventListener("click", () => {
                    const index = parseInt($(item).attr("data-index") as string);
                    GM_setValue(_CONFIG_.autoPlayerVal, index);
                    GM_setValue(_CONFIG_.flag, "true");
                    _this.showPlayerWindow(_CONFIG_.videoParseList[index]);
                    vipBox.find(".vip_list li").removeClass("selected");
                    $(item).addClass("selected");
                });
            });
            vipBox.find(".vip_list .tc-li").each((liIndex, item) => {
                item.addEventListener("click", () => {
                    const index = parseInt($(item).attr("data-index") as string);
                    const videoObj = _CONFIG_.videoParseList[index];
                    let url = videoObj.url + window.location.href;
                    GM_openInTab(url, {active: true, insert: true, setParent: true});
                });
            });

            //左键移动位置
            vipBox.on('mousedown', function (e) {
                if (e.which !== 1) { // 1 is left-click
                    return;
                }
                e.preventDefault();
                wasDragged = false;

                $('body').css('user-select', 'none'); // Disable text selection

                vipBox.css("cursor", "move");

                let startX = e.pageX;
                let startY = e.pageY;
                const initialOffset = vipBox.offset() as JQuery.Coordinates;
                let animationFrameId: number;

                function onMouseMove(e: JQuery.MouseMoveEvent) {
                    // Consider it a drag only if mouse moves more than a few pixels
                    if (!wasDragged && (Math.abs(e.pageX - startX) > 5 || Math.abs(e.pageY - startY) > 5)) {
                        wasDragged = true;
                    }

                    if (!wasDragged) return;

                    cancelAnimationFrame(animationFrameId);

                    animationFrameId = requestAnimationFrame(() => {
                        let newX = initialOffset.left + (e.pageX - startX);
                        let newY = initialOffset.top + (e.pageY - startY);

                        const windowWidth = $(window).width() as number;
                        const windowHeight = $(window).height() as number;
                        const boxWidth = vipBox.outerWidth(true) as number;
                        const boxHeight = vipBox.outerHeight(true) as number;

                        if (newX < 0) newX = 0;
                        if (newX > windowWidth - boxWidth) newX = windowWidth - boxWidth;
                        if (newY < 0) newY = 0;
                        if (newY > windowHeight - boxHeight) newY = windowHeight - boxHeight;

                        vipBox.removeClass("snap-left snap-right").css({ left: newX + 'px', top: newY + 'px' });
                    });
                }

                function onMouseUp(e: JQuery.MouseUpEvent) {
                    $('body').css('user-select', ''); // Re-enable text selection
                    cancelAnimationFrame(animationFrameId);
                    $(document).off('mousemove', onMouseMove);
                    $(document).off('mouseup', onMouseUp);
                    vipBox.css("cursor", "pointer");

                    if(wasDragged) {
                        // After dragging, remove inline 'left' and apply snap class
                        const finalOffset = vipBox.offset() as JQuery.Coordinates;
                        GM_setValue("vip_button_pos_top", finalOffset.top);

                        vipBox.css("left", "");

                        const windowWidth = $(window).width() as number;
                        const boxWidth = vipBox.outerWidth() as number;
                        if (finalOffset.left + boxWidth / 2 > windowWidth / 2) {
                            GM_setValue("vip_button_side", "right");
                            vipBox.removeClass("snap-left").addClass("snap-right");
                        } else {
                            GM_setValue("vip_button_side", "left");
                            vipBox.removeClass("snap-right").addClass("snap-left");
                        }
                    }
                }

                $(document as any).on('mousemove', onMouseMove);
                $(document as any).on('mouseup', onMouseUp);
            });
            return Promise.resolve(container);
        }

        autoPlay(container: HTMLElement): Promise<HTMLElement> {
            const vipBox = $(`#${_CONFIG_.vipBoxId}`);
            const autoToggle = vipBox.find("#vip_auto_toggle");

            autoToggle.on("click", function () {
                const isOn = $(this).hasClass("on");
                if (isOn) {
                    GM_setValue(_CONFIG_.autoPlayerKey, null);
                    $(this).removeClass("on");
                } else {
                    GM_setValue(_CONFIG_.autoPlayerKey, "true");
                    $(this).addClass("on");
                }
                // Reload to apply change
                setTimeout(() => window.location.reload(), 200);
            });

            if (!!GM_getValue(_CONFIG_.autoPlayerKey, null)) {
                this.selectPlayer(container);
            }
            return Promise.resolve(container);
        }

        selectPlayer(container: HTMLElement): void {
            let index = GM_getValue(_CONFIG_.autoPlayerVal, 2) as number;
            let autoObj = _CONFIG_.videoParseList[index];
            let _th = this;
            if (autoObj.type.includes("1")) {
                setTimeout(function () {
                    _th.showPlayerWindow(autoObj);
                    const vipBox = $(`#${_CONFIG_.vipBoxId}`);
                    vipBox.find(`.vip_list [title="${autoObj.name}1"]`).addClass("selected");
                    $(container).find("#vip_auto").attr("title", `自动解析源：${autoObj.name}`);
                }, 2500);
            }
        }

        showPlayerWindow(videoObj: VideoParseItem): void {
            if (!_CONFIG_.currentPlayerNode) return;

            util.findTargetEle(_CONFIG_.currentPlayerNode.container)
                .then((container) => {
                    const type = videoObj.type;
                    let url = videoObj.url + window.location.href;
                    if (type.includes("1")) {
                        util.reomveVideo();
                        $(container).empty();
                        let iframeDivCss = "width:100%;height:100%;z-index:999999;";
                        if (_CONFIG_.isMobile) {
                            iframeDivCss = "width:100%;height:220px;z-index:999999;";
                        }
                        if (_CONFIG_.isMobile && window.location.href.indexOf("iqiyi.com") !== -1) {
                            iframeDivCss = "width:100%;height:220px;z-index:999999;margin-top:-56.25%;";
                        }
                        $(container).append(`<div style="${iframeDivCss}"><iframe id="iframe-player-4a5b6c" src="${url}" style="border:none;" allowfullscreen="true" width="100%" height="100%"></iframe></div>`);
                    }
                });
        }

        postHandle(container: HTMLElement): void {
            if (!!GM_getValue(_CONFIG_.autoPlayerKey, null)) {
                util.urlChangeReload();
            } else {
                let oldHref = window.location.href;
                let interval = setInterval(() => {
                    let newHref = window.location.href;
                    if (oldHref !== newHref) {
                        oldHref = newHref;
                        if (!!GM_getValue(_CONFIG_.flag, null)) {
                            clearInterval(interval);
                            window.location.reload();
                        }
                    }
                }, 1000);
            }
        }

    }

    class DefaultConsumer extends BaseConsumer {
    }

    return {
        start: () => {
            GM_setValue(_CONFIG_.flag, null);
            let playerNode = _CONFIG_.playerContainers.filter(value => value.host === window.location.host);
            if (playerNode === null || playerNode.length <= 0) {
                console.warn(window.location.host + "该网站暂不支持，请联系作者，作者将会第一时间处理（注意：请记得提供有问题的网址）");
                return;
            }
            _CONFIG_.currentPlayerNode = playerNode[0];
            const targetConsumer = new DefaultConsumer();
            targetConsumer.parse();
        }
    }

})();

export default superVip;