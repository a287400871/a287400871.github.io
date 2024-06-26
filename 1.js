// 创建一个按B事件
var event = new KeyboardEvent('keydown', {
    key: 'b',
    code: 'KeyB',
    keyCode: 66, // 对应'b'键的ASCII码
    which: 66, // 对应'b'键的ASCII码
    shiftKey: false, // 是否按下shift键，根据需要设置
    ctrlKey: false, // 是否按下ctrl键，根据需要设置
    metaKey: false // 是否按下meta键，根据需要设置
});
 
// 触发模拟按B
document.dispatchEvent(event);


// 创建一个函数来模拟按键事件  
function simulateNumpadKey(keyChar) {  
    if (typeof keyChar !== 'string' || keyChar.length === 0) {  
        console.error('Invalid keyChar:', keyChar);  
        return;  
    }  
  
    // 创建一个新的键盘按键事件  
    const simulatedEvent = new KeyboardEvent('keydown', {  
        key: keyChar, // 按键的字符值  
        // 注意：code 属性可能不被所有浏览器支持在 KeyboardEvent 构造函数中设置  
        // code: 'Numpad' + keyChar, // 假设我们可以设置 code 属性，但通常这不是可行的  
        bubbles: true,  
        cancelable: true,  
        view: window // 必须指定一个 view，通常是 window 对象  
        // charCode 和 keyCode 已经是非标准属性，并且在现代浏览器中可能不被支持  
        // charCode: keyChar.charCodeAt(0), // 对于旧版浏览器可能需要  
        // keyCode: keyChar.charCodeAt(0) // 同样，对于旧版浏览器可能需要  
    });  
  
    // 获取要分派事件的目标元素，例如文档的 body 元素  
    //const targetElement = document.body;  
    const targetElement = document.documentElement;
    // 分派事件  
    targetElement.dispatchEvent(simulatedEvent);  
}  
  
// 创建一个数组包含小键盘的0-9数字  
const numpadKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];  
  
// 设置定时器，每10秒模拟一个小键盘按键  
let index = 0; // 用于跟踪要模拟的下一个键的索引  
setInterval(() => {  
    var min = 1,    
	max = 9;
	var rand = Math.floor(Math.random() * (max - min + 1) + min); 
    console.log(rand);
    
    // 确保 index 在有效范围内  
    index = index % numpadKeys.length;  
    // 模拟按键事件  
    simulateNumpadKey(numpadKeys[rand]);  
  
    // 更新索引以模拟下一个键  
    index++;  
}, 15000); // 10秒 = 10000毫秒

/*禁止关闭 Websocket*/
WebSocket.prototype.close = function () { return; }


/*判断是否自动关闭 */
//获取路由参数
function getQueryString(name) {
    let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    let r = window.location.search.substr(1).match(reg); //search,查询？后面的参数，并匹配正则
    if (r != null) return unescape(r[2]);
    return null;
}

//if (getQueryString("pause") === "true" ) {
    //自动暂停一次播放
    var pauseIdx = setInterval(() => {
        let playbtn = document.querySelector(".xgplayer-play");
        if (!playbtn) return;
        let status = playbtn.getAttribute("data-state");
        if (status !== "play") return;
        playbtn.click();
        clearInterval(pauseIdx);
        console.log("已自动暂停播放");
    }, 500);
//}
//------------------------------------------------------------------------------------



const wsurl = "ws://127.0.0.1:2019";
var ws = null;
const propsId = Object.keys(
    document.querySelector(".webcast-chatroom___list")
)[1];
const roomJoinDom = document.querySelector(
    ".webcast-chatroom___bottom-message"
);
const chatDom = document.querySelector(".webcast-chatroom___items").children[0];
const observer = new MutationObserver((mutationsList) => {
    for (let mutation of mutationsList) {
        if (mutation.type === "childList" && mutation.addedNodes.length) {
            let dom = mutation.addedNodes[0];
            let { user, common } = dom[propsId].children.props.message.payload;
            if (user.short_id) {
                let message_info = getUser(user);
                if (common.anchor_fold_type_v2 === "1") {
                    message_info.message_type = "like";
                    //message_info.message_describe = `${message_info.user_nickName} 为主播点赞`;
                    message_info.message_describe = `为主播点赞`;
                }
                if (common.anchor_fold_type_v2 === "3") {
                    message_info.message_type = "join";
                    message_info.message_describe = `${message_info.user_nickName} 来了`;
                }
                const msg = Object.assign(createMessage(), message_info);
                ws_send(msg);
            }
        }
    }
});
const chatObserverrom = new MutationObserver((mutationsList, observer) => {
    for (let mutation of mutationsList) {
        if (mutation.type === "childList" && mutation.addedNodes.length) {
            let dom = mutation.addedNodes[0];
            let { payload } = dom[propsId].children.props.message;
            let userinfo = getUser(payload.user);
            let message_info = null;
            switch (payload.common.method) {
                case 'WebcastGiftMessage':
                    message_info = {
                        message_type: "gift",
                        gift_combo_count: payload.gift.combo_count, // 个数
                        gift_id: payload.gift.id, // id
                        gift_url: payload.gift.icon.url_list[0], // id
                        gift_name: payload.gift.name, // id
                        gift_total_count: payload.total_count, // id
                        message_describe: `${userinfo.user_nickName} 送出了 ${payload.gift.name} x${payload.total_count}`,
                    };
                    break
                case 'WebcastChatMessage':
                    message_info = {
                        message_type: "text",
                        content: payload.content,
                        //message_describe: `${userinfo.user_nickName} : ${payload.content}`,
                        message_describe: `${payload.content}`,
                    };
                    break
                case 'WebcastEmojiChatMessage':
                    message_info = {
                        message_type: "text",
                        content: payload.content,
                        //message_describe: `${userinfo.user_nickName} : ${payload.default_content}`,
                        message_describe: `${payload.default_content}`,
                    };
                    break
            }
            const msg = Object.assign(createMessage(), userinfo, message_info);
            if (msg.message_type) {
                ws_send(msg);
            }

        }
    }
});







function createMessage() {
    const new_msg = {
        message_type: null,
        user_follow_status: null,
        user_id: null,
        user_url: null,
        user_nickName: null,
        user_avatar: null,
        user_gender: null,
        user_is_admin: null,
        user_is_super_admin: null,
        user_level_value: null,
        user_level_icon: null,
        user_fans_light_level_value: null,
        user_fans_light_level_name: null,
        user_fans_light_icon_url: null,
        gift_combo_count: null,
        gift_id: null,
        gift_url: null,
        gift_name: null,
        gift_total_count: null,
    };
    return new_msg;
}

function getUser(user) {
    if (!user) {
        return {};
    }
    let msg = {
        user_follow_status: user.follow_status === "0" ? "y" : "n", // 是否关注
        user_id: user.short_id,
        user_url: `https://www.douyin.com/user/${user.sec_uid}`,
        user_nickName: user.nickname,
        user_avatar: user.avatar_thumb.url_list[0],
        user_gender: user.gender === 1 ? "男" : "女",
        //user_is_admin: user.user_attr.is_admin ? "y" : "n",
        //user_is_super_admin: user.user_attr.is_super_admin ? "y" : "n", // 超级管理员
    };

    user.badge_image_list.map((item) => {
        if (item.image_type === 1) {
            msg.user_level_value = item.content.level;
            msg.user_level_icon = item.url_list[0];
        }
        if (item.image_type === 7) {
            msg.user_fans_light_level_value = item.content.level;
            msg.user_fans_light_level_name = item.content.name;
            msg.user_fans_light_icon_url = item.url_list[0];
        }
    });

    return msg;
}

function ws_send(message) {
    ws.send(JSON.stringify(message));
}

function init() {
    console.clear()
    ws = new WebSocket(wsurl);
    ws.onclose = () => {
        console.log("服务器断开,请启动ws服务" + wsurl);
    };
    ws.onerror = error => {
        console.log("服务器断开,请启动ws服务" + wsurl);
    };
    ws.onopen = () => {
        console.log("2332连接ws成功:" + wsurl);
        console.log("23欢迎加入 QQ 群 590109588：https://qm.qq.com/q/YAs31tGvUm");
        observer.observe(roomJoinDom, { childList: true });
        chatObserverrom.observe(chatDom, { childList: true });
    };

}
init();
