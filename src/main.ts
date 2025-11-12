import $ from 'jquery';
import { _CONFIG_ } from './config';
import type { VideoParseItem } from './config';
import { util } from './utils';

// 主逻辑模块
const superVip = (function () {

    /**
     * 基础消费者类，定义了脚本在页面上运行的核心逻辑和生命周期。
     */
    class BaseConsumer {
        /**
         * 解析流程的入口方法，按顺序执行各个生命周期钩子。
         */
        parse(): void {
            util.findTargetEle('body')
                .then((container) => this.preHandle(container)) // 1. 预处理
                .then((container) => this.generateElement(container as HTMLElement)) // 2. 生成 UI 元素
                .then((container) => this.bindEvent(container as HTMLElement)) // 3. 绑定事件
                .then((container) => this.autoPlay(container as HTMLElement)) // 4. 处理自动播放
                .then((container) => this.postHandle(container as HTMLElement)); // 5. 后处理
        }

        /**
         * 预处理钩子：在页面上执行一些清理操作，例如移除广告或遮罩层。
         * @param container 页面 body 元素
         */
        preHandle(container: Element): Promise<Element> {
            if (!_CONFIG_.currentPlayerNode) {
                return Promise.resolve(container);
            }
            // 根据配置隐藏页面上的指定元素
            _CONFIG_.currentPlayerNode.displayNodes.forEach((item: string) => {
                util.findTargetEle(item)
                    .then((obj) => (obj as HTMLElement).style.display = 'none')
                    .catch(e => console.warn("不存在元素", e));
            });
            return Promise.resolve(container);
        }

        /**
         * 生成 UI 元素钩子：向页面注入悬浮按钮和解析列表的 HTML 及 CSS。
         * @param container 页面 body 元素
         */
        generateElement(container: HTMLElement): Promise<HTMLElement> {
            // 注入 CSS 样式
            GM_addStyle(`
                #${_CONFIG_.vipBoxId} {cursor:pointer; position:fixed; top:180px; z-index:999999; text-align:center; width: 40px; height: 40px; transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);}
                #${_CONFIG_.vipBoxId}.snap-right { right:-20px; transition: right 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
                #${_CONFIG_.vipBoxId}.snap-right:hover { right: 0; }
                #${_CONFIG_.vipBoxId}.snap-left { left:-20px; transition: left 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
                #${_CONFIG_.vipBoxId}.snap-left:hover { left: 0; }

                #${_CONFIG_.vipBoxId}.dragging {
                    width: 40px;
                    height: 40px;
                }
                
                #${_CONFIG_.vipBoxId}.snap-right.dragging {
                    width: 60px;
                    left: auto;
                    right: auto;
                }
                
                #${_CONFIG_.vipBoxId}.snap-left.dragging {
                    width: 60px;
                    left: auto;
                    right: auto;
                }

                #${_CONFIG_.vipBoxId} .vip_icon {
                    width:40px; height:40px; background: #2c2c2c; border-radius: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                    display:flex; align-items:center; justify-content:center;
                    font-size:16px; font-weight:bold; color: #ffc107;
                    border: 2px solid #444;
                    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    transform: scale(1);
                }
                
                /* 拖动时按钮为圆形 */
                #${_CONFIG_.vipBoxId}.dragging .vip_icon {
                    border-radius: 20px;  /* 拖动时保持圆形 */
                }
                
                /* 放置在右侧时，按钮变成圆形+右侧长条 */
                #${_CONFIG_.vipBoxId}.snap-right .vip_icon {
                    border-radius: 20px 0 0 20px;  /* 右侧吸附时，右侧变成方形 */
                    width: 60px;  /* 拉长到60px */
                    position: relative; /* 新增：为了设置left属性 */
                    left: -20px; /* 新增：修正右侧按钮的偏移，使其可见可点击 */
                }
                
                /* 放置在左侧时，按钮变成左侧长条+圆形 */
                #${_CONFIG_.vipBoxId}.snap-left .vip_icon {
                    border-radius: 0 20px 20px 0;  /* 左侧吸附时，左侧变成方形 */
                    width: 60px;  /* 拉长到60px */
                }
                
                #${_CONFIG_.vipBoxId}:hover .vip_icon {
                     border-color: #ffc107;
                     box-shadow: 0 0 15px rgba(255,193,7,0.5);
                     transform: scale(1.05);
                }

                #${_CONFIG_.vipBoxId} .vip_list {
                    display:none; position:absolute; top: 50%; transform: translateY(-50%) scale(0.95);
                    text-align:left; background: #2b2b2b; border: 1px solid #444;
                    border-radius:8px; padding:15px; width:420px; max-height:450px; overflow-y:auto;
                    box-shadow: 0 5px 25px rgba(0,0,0,0.5);
                    opacity: 0;
                    transition: all 0.3s ease-out;
                    transform-origin: center;
                }
                #${_CONFIG_.vipBoxId}.show .vip_list {
                    display: block; /* BUGFIX: 修复菜单不显示的问题，添加 display:block */
                    opacity: 1;
                    transform: translateY(-50%) scale(1);
                }
                #${_CONFIG_.vipBoxId}.snap-right .vip_list { right:85px; }
                #${_CONFIG_.vipBoxId}.snap-left .vip_list { left:85px; }
                #${_CONFIG_.vipBoxId} .vip_list h3{
                    color:#00aaff; font-weight: bold; font-size: 16px; padding-bottom:8px; margin-bottom: 12px;
                    border-bottom: 1px solid #444; text-shadow: 0 0 4px rgba(0,170,255,0.7);
                    transition: all 0.3s ease;
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
                    transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    position: relative;
                    z-index: 1;
                }
                #${_CONFIG_.vipBoxId} .vip_list li:hover{
                    color:#fff; border-color: #00aaff; background: #00aaff;
                    transform: translateY(-2px) scale(1.05);
                    box-shadow: 0 5px 15px rgba(0,170,255,0.5);
                    z-index: 2;
                }
                #${_CONFIG_.vipBoxId} li.selected{
                    color:#fff; border-color: #00aaff; background: #00aaff;
                    box-shadow: 0 0 15px rgba(0,170,255,0.5);
                    font-weight: bold;
                }

                #${_CONFIG_.vipBoxId} .vip_list .info-box {
                    text-align:left;color:#999;font-size:11px;padding:10px;margin-top:15px;
                    background: #222; border-radius: 5px; border-top: 1px solid #444;
                    transition: all 0.3s ease;
                }
                #${_CONFIG_.vipBoxId} .vip_list .info-box b { color: #00aaff; }

                #${_CONFIG_.vipBoxId} .panel-footer {
                    margin-top: 15px; padding-top: 10px; border-top: 1px solid #444;
                    display: flex; justify-content: flex-end; align-items: center; color: #ccc; font-size: 14px;
                    transition: all 0.3s ease;
                }
                #${_CONFIG_.vipBoxId} .toggle-switch {
                    width: 40px; height: 22px; background: #555; border-radius: 11px; margin-left: 10px;
                    position: relative; cursor: pointer; transition: background 0.3s ease;
                    box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);
                }
                #${_CONFIG_.vipBoxId} .toggle-switch.on { background: #00aaff; }
                #${_CONFIG_.vipBoxId} .toggle-handle {
                    width: 18px; height: 18px; background: #fff; border-radius: 50%;
                    position: absolute; top: 2px; left: 2px;
                    transition: left 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                }
                #${_CONFIG_.vipBoxId} .toggle-switch.on .toggle-handle { left: 20px; }

                #${_CONFIG_.vipBoxId} .vip_list::-webkit-scrollbar{width:5px; height:1px;}
                #${_CONFIG_.vipBoxId} .vip_list::-webkit-scrollbar-thumb{box-shadow:inset 0 0 5px rgba(0, 0, 0, 0.2); background:#666; border-radius: 5px; transition: all 0.3s ease;}
                #${_CONFIG_.vipBoxId} .vip_list::-webkit-scrollbar-track{box-shadow:inset 0 0 5px rgba(0, 0, 0, 0.2); background:#333; border-radius: 5px;}
				`);

            // 针对移动端优化样式
            if (_CONFIG_.isMobile) {
                GM_addStyle(`
                    #${_CONFIG_.vipBoxId} {top:300px;}
                    #${_CONFIG_.vipBoxId} .vip_list {width:300px;}
                    `);
            }

            // 根据解析源类型，生成不同的列表项
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

            // 读取自动播放设置
            let isAutoPlayOn = !!GM_getValue(_CONFIG_.autoPlayerKey, null);

            // 注入 HTML
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

            // 恢复悬浮按钮上次的位置
            const savedTop = GM_getValue("vip_button_pos_top", null) as number | null;
            const savedSide = GM_getValue("vip_button_side", "right") as 'left' | 'right';
            const vipBox = $(`#${_CONFIG_.vipBoxId}`);

            if (savedTop !== null) {
                vipBox.css({top: savedTop + 'px'});
            }
            vipBox.addClass(savedSide === 'left' ? 'snap-left' : 'snap-right');

            return Promise.resolve(container);
        }

        /**
         * 绑定事件钩子：为注入的 UI 元素绑定点击、拖拽等事件。
         * @param container 页面 body 元素
         */
        bindEvent(container: HTMLElement): Promise<HTMLElement> {
            const vipBox = $(`#${_CONFIG_.vipBoxId}`);
            let wasDragged = false;

            // VIP 图标点击事件，用于展开/收起解析列表
            vipBox.find(".vip_icon").on("click", (e) => {
                if(wasDragged) {
                    e.stopPropagation();
                    return;
                }
                e.stopPropagation();
                vipBox.toggleClass("show");
            });

            // 点击页面其他地方，收起解析列表
            $(document as any).on("click", (e: any) => {
                if (!vipBox.is(e.target) && vipBox.has(e.target).length === 0) {
                    vipBox.removeClass("show");
                }
            });

            let _this = this;
            // 内嵌播放列表项点击事件
            vipBox.find(".vip_list .nq-li").each((liIndex, item) => {
                item.addEventListener("click", () => {
                    const index = parseInt($(item).attr("data-index") as string);
                    GM_setValue(_CONFIG_.autoPlayerVal, index); // 记录选择，用于自动播放
                    GM_setValue(_CONFIG_.flag, "true");
                    _this.showPlayerWindow(_CONFIG_.videoParseList[index]);
                    vipBox.find(".vip_list li").removeClass("selected");
                    $(item).addClass("selected");
                });
            });
            // 弹窗播放列表项点击事件
            vipBox.find(".vip_list .tc-li").each((liIndex, item) => {
                item.addEventListener("click", () => {
                    const index = parseInt($(item).attr("data-index") as string);
                    const videoObj = _CONFIG_.videoParseList[index];
                    let url = videoObj.url + window.location.href;
                    GM_openInTab(url, {active: true, insert: true, setParent: true});
                });
            });

            // 悬浮按钮拖拽事件 - 重构以修复点击/拖拽冲突
            vipBox.on('mousedown', function (e) {
                if (e.which !== 1) { // 只响应左键
                    return;
                }
                e.preventDefault();
                wasDragged = false;

                const startX = e.pageX;
                const startY = e.pageY;

                // 动态获取尺寸和位置，确保在拖动开始时才计算
                let initialOffset: JQuery.Coordinates, windowWidth: number, windowHeight: number, boxWidth: number, boxHeight: number;
                let currentX: number, currentY: number;
                let maxX: number, maxY: number;

                // 高性能鼠标移动处理
                function onMouseMove(e: JQuery.MouseMoveEvent) {
                    // 步骤1：检查拖动是否已开始（移动超过5像素）
                    if (!wasDragged && (Math.abs(e.pageX - startX) > 5 || Math.abs(e.pageY - startY) > 5)) {
                        wasDragged = true;

                        // 步骤2：拖动正式开始，现在才进行视觉设置
                        // 初始化拖动所需变量
                        initialOffset = vipBox.offset() as JQuery.Coordinates;
                        windowWidth = $(window).width() as number;
                        windowHeight = $(window).height() as number;
                        boxWidth = vipBox.outerWidth(true) as number;
                        boxHeight = vipBox.outerHeight(true) as number;
                        currentX = initialOffset.left;
                        currentY = initialOffset.top;
                        maxX = windowWidth - boxWidth;
                        maxY = windowHeight - boxHeight;

                        // 应用拖动样式
                        $('body').css('user-select', 'none'); // 拖拽时禁止选中文本
                        vipBox.css("cursor", "move");
                        vipBox.css("position", "absolute"); // 切换到绝对定位进行流畅拖动
                        vipBox.addClass("dragging");
                        vipBox.removeClass("snap-left snap-right"); // 移除贴边类
                    }

                    // 如果没有开始拖动，则不执行任何操作
                    if (!wasDragged) {
                        return;
                    }

                    // 步骤3：计算新位置并更新
                    const newX = Math.max(0, Math.min(maxX, e.pageX - (boxWidth / 2)));
                    const newY = Math.max(0, Math.min(maxY, e.pageY - (boxHeight / 2)));

                    vipBox.css({
                        left: newX + 'px',
                        top: newY + 'px'
                    });

                    currentX = newX;
                    currentY = newY;
                }

                // 鼠标释放处理
                function onMouseUp(e: JQuery.MouseUpEvent) {
                    // 移除事件监听器
                    $(document).off('mousemove', onMouseMove);
                    $(document).off('mouseup', onMouseUp);

                    // 步骤4：检查是否真的发生了拖动
                    if (wasDragged) {
                        // 是拖动，则进行清理和贴边
                        $('body').css('user-select', ''); // 恢复文本选中
                        vipBox.css("cursor", "pointer");
                        vipBox.removeClass("dragging");

                        // 保存最终的Y坐标
                        GM_setValue("vip_button_pos_top", currentY);

                        // 延迟以确保平滑过渡
                        setTimeout(() => {
                            vipBox.css("left", ""); // 清除内联left
                            vipBox.css("position", "fixed"); // 恢复固定定位

                            // 决定贴靠哪一边
                            if (currentX + boxWidth / 2 > windowWidth / 2) {
                                GM_setValue("vip_button_side", "right");
                                vipBox.addClass("snap-right");
                            } else {
                                GM_setValue("vip_button_side", "left");
                                vipBox.addClass("snap-left");
                            }
                        }, 50);
                    }
                    // 如果不是拖动（即单击），则不执行任何操作。
                    // 这样可以防止干扰正常的 'click' 事件。
                }

                // 注册事件监听器
                $(document).on('mousemove', onMouseMove);
                $(document).on('mouseup', onMouseUp);
            });
            return Promise.resolve(container);
        }

        /**
         * 自动播放钩子：如果用户开启了自动播放，则执行自动解析逻辑。
         * @param container 页面 body 元素
         */
        autoPlay(container: HTMLElement): Promise<HTMLElement> {
            const vipBox = $(`#${_CONFIG_.vipBoxId}`);
            const autoToggle = vipBox.find("#vip_auto_toggle");

            // 自动播放开关事件
            autoToggle.on("click", function () {
                const isOn = $(this).hasClass("on");
                if (isOn) {
                    GM_setValue(_CONFIG_.autoPlayerKey, null);
                    $(this).removeClass("on");
                } else {
                    GM_setValue(_CONFIG_.autoPlayerKey, "true");
                    $(this).addClass("on");
                }
                // 刷新页面以应用更改
                setTimeout(() => window.location.reload(), 200);
            });

            // 如果开启了自动播放，则选择播放源
            if (!!GM_getValue(_CONFIG_.autoPlayerKey, null)) {
                this.selectPlayer(container);
            }
            return Promise.resolve(container);
        }

        /**
         * 根据本地存储的设置，选择并播放视频。
         * @param container 页面 body 元素
         */
        selectPlayer(container: HTMLElement): void {
            let index = GM_getValue(_CONFIG_.autoPlayerVal, 2) as number;
            let autoObj = _CONFIG_.videoParseList[index];
            let _th = this;
            if (autoObj.type.includes("1")) { // 只支持内嵌播放
                setTimeout(function () {
                    _th.showPlayerWindow(autoObj);
                    const vipBox = $(`#${_CONFIG_.vipBoxId}`);
                    vipBox.find(`.vip_list [title="${autoObj.name}1"]`).addClass("selected");
                    $(container).find("#vip_auto").attr("title", `自动解析源：${autoObj.name}`);
                }, 2500);
            }
        }

        /**
         * 显示播放器窗口，将解析后的视频注入页面。
         * @param videoObj 选中的视频解析服务对象
         */
        showPlayerWindow(videoObj: VideoParseItem): void {
            if (!_CONFIG_.currentPlayerNode) return;

            util.findTargetEle(_CONFIG_.currentPlayerNode.container)
                .then((container) => {
                    const type = videoObj.type;
                    let url = videoObj.url + window.location.href;
                    if (type.includes("1")) { // 内嵌播放
                        util.reomveVideo(); // 移除原生视频
                        $(container).empty(); // 清空播放器容器
                        let iframeDivCss = "width:100%;height:100%;z-index:999999;";
                        if (_CONFIG_.isMobile) {
                            iframeDivCss = "width:100%;height:220px;z-index:999999;";
                        }
                        if (_CONFIG_.isMobile && window.location.href.indexOf("iqiyi.com") !== -1) {
                            iframeDivCss = "width:100%;height:220px;z-index:999999;margin-top:-56.25%;";
                        }
                        // 注入 iframe
                        $(container).append(`<div style="${iframeDivCss}"><iframe id="iframe-player-4a5b6c" src="${url}" style="border:none;" allowfullscreen="true" width="100%" height="100%"></iframe></div>`);
                    }
                });
        }

        /**
         * 后处理钩子：处理 SPA 页面跳转等收尾工作。
         * @param container 页面 body 元素
         */
        postHandle(container: HTMLElement): void {
            if (!!GM_getValue(_CONFIG_.autoPlayerKey, null)) {
                util.urlChangeReload(); // 如果开启了自动播放，则监听 URL 变化
            } else {
                let oldHref = window.location.href;
                let interval = setInterval(() => {
                    let newHref = window.location.href;
                    if (oldHref !== newHref) {
                        oldHref = newHref;
                        // 如果是通过点击解析列表触发的跳转，则刷新页面
                        if (!!GM_getValue(_CONFIG_.flag, null)) {
                            clearInterval(interval);
                            window.location.reload();
                        }
                    }
                }, 1000);
            }
        }
    }
    
    /**
     * 默认的消费者实现，继承自 BaseConsumer。
     * 未来可以为特定网站扩展不同的 Consumer。
     */
    class DefaultConsumer extends BaseConsumer {

    }

    return {
        /**
         * 脚本启动函数。
         */
        start: () => {
            GM_setValue(_CONFIG_.flag, null); // 重置标志
            // 根据当前域名从配置中查找匹配的播放器设置
            let playerNode = _CONFIG_.playerContainers.filter(value => value.host === window.location.host);
            if (playerNode === null || playerNode.length <= 0) {
                console.warn(window.location.host + "该网站暂不支持，请联系作者，作者将会第一时间处理（注意：请记得提供有问题的网址）");
                return;
            }
            _CONFIG_.currentPlayerNode = playerNode[0];
            // 实例化消费者并开始解析流程
            const targetConsumer = new DefaultConsumer();
            targetConsumer.parse();
        }
    }

})();

export default superVip;