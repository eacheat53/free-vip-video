/* global GM_log, GM_xmlhttpRequest */

function findTargetElement(targetContainer: string): Promise<Element> {
    const body = window.document;
    let tabContainer: Element | null;
    let tryTime = 0;
    const maxTryTime = 120;
    let startTimestamp: number;
    return new Promise((resolve, reject) => {
        function tryFindElement(timestamp: number) {
            if (!startTimestamp) {
                startTimestamp = timestamp;
            }
            const elapsedTime = timestamp - startTimestamp;

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

export const util = {
    req: (option: Tampermonkey.Request) => syncRequest(option),
    findTargetEle: (targetEle: string) => findTargetElement(targetEle),
    urlChangeReload: () => urlChangeReload(),
    reomveVideo: () => reomveVideo()
};