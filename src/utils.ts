/* global GM_log, GM_xmlhttpRequest */

/**
 * 异步查找目标元素。
 * 由于许多网站是动态加载的，需要轮询查找元素。
 * @param targetContainer 目标元素的 CSS 选择器
 * @returns 返回一个 Promise，成功时解析为找到的元素
 */
function findTargetElement(targetContainer: string): Promise<Element> {
    const body = window.document;
    let tabContainer: Element | null;
    let tryTime = 0;
    const maxTryTime = 120; // 最大尝试次数
    let startTimestamp: number;
    return new Promise((resolve, reject) => {
        function tryFindElement(timestamp: number) {
            if (!startTimestamp) {
                startTimestamp = timestamp;
            }
            const elapsedTime = timestamp - startTimestamp;

            // 每 500ms 尝试查找一次
            if (elapsedTime >= 500) {
                GM_log("查找元素：" + targetContainer + "，第" + tryTime + "次");
                tabContainer = body.querySelector(targetContainer);
                if (tabContainer) {
                    resolve(tabContainer);
                } else if (++tryTime === maxTryTime) {
                    reject(new Error(`Element not found: ${targetContainer}`));
                } else {
                    startTimestamp = timestamp;
                }
            }
            if (!tabContainer && tryTime < maxTryTime) {
                requestAnimationFrame(tryFindElement);
            }
        }

        requestAnimationFrame(tryFindElement);
    });
}

/**
 * 监听 URL 变化。
 * 在单页应用 (SPA) 中，页面跳转不会刷新页面，需要手动监听 URL 变化并重载。
 */
function urlChangeReload(): void {
    const oldHref = window.location.href;
    let interval = setInterval(() => {
        let newHref = window.location.href;
        if (oldHref !== newHref) {
            clearInterval(interval);
            window.location.reload();
        }
    }, 500);
}

/**
 * 移除原生视频播放。
 * 某些网站的原生播放器会干扰注入的 VIP 播放器，需要将其移除或暂停。
 */
function reomveVideo(): void {
    setInterval(() => {
        for (let video of document.getElementsByTagName("video")) {
            if (video.src) {
                video.removeAttribute("src");
                video.muted = true;
                video.load();
                video.pause();
            }
        }
    }, 500);
}

/**
 * 封装 GM_xmlhttpRequest 为 Promise。
 * @param option GM_xmlhttpRequest 的请求选项
 * @returns 返回一个 Promise，用于处理异步请求
 */
function syncRequest(option: Tampermonkey.Request): Promise<any> {
    return new Promise((resolve, reject) => {
        option.onload = (res) => {
            resolve(res);
        };
        option.onerror = (err) => {
            reject(err);
        };
        GM_xmlhttpRequest(option);
    });
}

// 工具函数集合
export const util = {
    req: (option: Tampermonkey.Request) => syncRequest(option), // 异步请求
    findTargetEle: (targetEle: string) => findTargetElement(targetEle), // 查找元素
    urlChangeReload: () => urlChangeReload(), // URL 变化时重载
    reomveVideo: () => reomveVideo() // 移除原生视频
};