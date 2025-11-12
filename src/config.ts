// 定义视频解析服务的接口
export interface VideoParseItem {
    name: string; // 解析服务名称
    type: string; // 类型，用于区分内嵌播放、弹窗播放等
    url: string;  // 解析服务地址
}

// 定义播放器容器的接口
export interface PlayerContainer {
    host: string; // 目标视频网站的 host
    container: string; // 播放器在页面中的 CSS 选择器
    name: string; // 自定义名称，当前未使用
    displayNodes: string[]; // 需要隐藏的页面元素的选择器列表
}

// 定义主配置对象的接口
export interface Config {
    isMobile: boolean; // 是否为移动端
    currentPlayerNode: PlayerContainer | null; // 当前匹配到的播放器容器配置
    vipBoxId: string; // 注入页面的 VIP 解析悬浮按钮的 ID
    flag: string; // 用于判断是否进行了VIP操作的标志
    autoPlayerKey: string; // 存储是否开启自动播放的键名
    autoPlayerVal: string; // 存储自动播放使用的解析源索引的键名
    videoParseList: VideoParseItem[]; // 视频解析服务列表
    playerContainers: PlayerContainer[]; // 支持的视频网站播放器列表
}

// 全局配置对象
export const _CONFIG_: Config = {
    // 通过 UserAgent 判断是否为移动端
    isMobile: !!navigator.userAgent.match(/(Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini)/i),
    // 当前网站匹配的播放器配置，默认为 null
    currentPlayerNode: null,
    // 随机生成一个唯一的悬浮按钮ID，避免冲突
    vipBoxId: 'vip_jx_box' + Math.ceil(Math.random() * 100000000),
    // 用于页面跳转后判断是否需要重新加载脚本逻辑的标志
    flag: "flag_vip",
    // 本地存储中用于记录“是否开启自动解析”的键名，与域名挂钩
    autoPlayerKey: "auto_player_key" + window.location.host,
    // 本地存储中用于记录“自动解析线路”的键名，与域名挂钩
    autoPlayerVal: "auto_player_value_" + window.location.host,
    // VIP 视频解析接口列表
    videoParseList: [
        {"name": "综合", "type": "1,3", "url": "https://jx.jsonplayer.com/player/?url="},
        {"name": "CK", "type": "1,3", "url": "https://www.ckplayer.vip/jiexi/?url="},
        {"name": "YT", "type": "1,3", "url": "https://jx.yangtu.top/?url="},
        {"name": "Player-JY", "type": "1,3", "url": "https://jx.playerjy.com/?url="},
        {"name": "yparse", "type": "1,2", "url": "https://jx.yparse.com/index.php?url="},
        {"name": "8090", "type": "1,3", "url": "https://www.8090g.cn/?url="},
        {"name": "剖元", "type": "1,3", "url": "https://www.pouyun.com/?url="},
        {"name": "虾米", "type": "1,3", "url": "https://jx.xmflv.com/?url="},
        {"name": "全民", "type": "1,3", "url": "https://43.240.74.102:4433?url="},

        {"name": "爱豆", "type": "1,3", "url": "https://jx.aidouer.net/?url="},
        {"name": "夜幕", "type": "1,3", "url": "https://www.yemu.xyz/?url="},
        {"name": "m1907", "type": "1,2", "url": "https://im1907.top/?jx="},

        {"name": "M3U8TV", "type": "1,3", "url": "https://jx.m3u8.tv/jiexi/?url="},
        {"name": "冰豆", "type": "1,3", "url": "https://bd.jx.cn/?url="},
        {"name": "playm3u8", "type": "1,3", "url": "https://www.playm3u8.cn/jiexi.php?url="},
    ],
    // 支持的网站列表及其播放器容器配置
    playerContainers: [
        {
            host: "v.qq.com",
            container: "#mod_player,#player-container,.container-player",
            name: "Default",
            displayNodes: ["#mask_layer", ".mod_vip_popup", "#mask_layer", ".panel-tip-pay"]
        },
        {
            host: "m.v.qq.com",
            container: ".mod_player,#player",
            name: "Default",
            displayNodes: [".mod_vip_popup", "[class^=app_],[class^=app-],[class*=_app_],[class*=-app-],[class$=_app],[class$=-app]", "div[dt-eid=open_app_bottom]", "div.video_function.video_function_new", "a[open-app]", "section.mod_source", "section.mod_box.mod_sideslip_h.mod_multi_figures_h,section.mod_sideslip_privileges,section.mod_game_rec", ".at-app-banner"]
        },

        {host: "w.mgtv.com", container: "#mgtv-player-wrap", name: "Default", displayNodes: []},
        {host: "www.mgtv.com", container: "#mgtv-player-wrap", name: "Default", displayNodes: []},
        {
            host: "m.mgtv.com",
            container: ".video-area",
            name: "Default",
            displayNodes: ["div[class^=mg-app]", ".video-area-bar", ".open-app-popup"]
        },
        {host: "www.bilibili.com", container: "#player_module,#bilibiliPlayer,#bilibili-player", name: "Default", displayNodes: []},
        {host: "m.bilibili.com", container: ".player-wrapper,.player-container,.mplayer", name: "Default", displayNodes: []},
        {host: "www.iqiyi.com", container: "#flashbox", name: "Default", displayNodes: ["#playerPopup", "div[class^=qy-header-login-pop]", "section[class^=modal-cover_]" ,".toast"]},
        {
            host: "m.iqiyi.com",
            container: ".m-video-player-wrap",
            name: "Default",
            displayNodes: ["div.m-iqyGuide-layer", "a[down-app-android-url]", "[name=m-extendBar]", "[class*=ChannelHomeBanner]", "section.m-hotWords-bottom"]
        },
        {host: "www.iq.com", container: ".intl-video-wrap", name: "Default", displayNodes: []},
        {host: "v.youku.com", container: "#player", name: "Default", displayNodes: ["#iframaWrapper", "#checkout_counter_mask", "#checkout_counter_popup"]},
        {
            host: "m.youku.com",
            container: "#player,.h5-detail-player",
            name: "Default",
            displayNodes: [".callEnd_box", ".h5-detail-guide", ".h5-detail-vip-guide"]
        },
        {host: "tv.sohu.com", container: "#player", name: "Default", displayNodes: []},
        {host: "film.sohu.com", container: "#playerWrap", name: "Default", displayNodes: []},
        {host: "www.le.com", container: "#le_playbox", name: "Default", displayNodes: []},
        {host: "video.tudou.com", container: ".td-playbox", name: "Default", displayNodes: []},
        {host: "v.pptv.com", container: "#pptv_playpage_box", name: "Default", displayNodes: []},
        {host: "vip.pptv.com", container: ".w-video", name: "Default", displayNodes: []},
        {host: "www.wasu.cn", container: "#flashContent", name: "Default", displayNodes: []},
        {host: "www.acfun.cn", container: "#player", name: "Default", displayNodes: []},
        {host: "vip.1905.com", container: "#player,#vodPlayer", name: "Default", displayNodes: []},
        {host: "www.1905.com", container: "#player,#vodPlayer", name: "Default", displayNodes: []},
    ]
};

