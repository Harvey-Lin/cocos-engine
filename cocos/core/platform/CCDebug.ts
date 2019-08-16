/*
 Copyright (c) 2018 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
  worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
  not use Cocos Creator software for developing other software or tools that's
  used for developing games. You are not granted to publish, distribute,
  sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/

 // @ts-ignore
import * as debugInfos from '../../../DebugInfos';
const ERROR_MAP_URL = 'https://github.com/cocos-creator/engine/blob/master/EngineErrorMap.md';

// The html element displays log in web page (DebugMode.INFO_FOR_WEB_PAGE)
let logList: HTMLTextAreaElement | null = null;

let ccLog = console.log;

let ccWarn = console.log;

let ccError = console.log;

let ccAssert = (condition: any, message?: any, ...optionalParams: any[]) => {
    if (!condition) {
        console.log('ASSERT: ' + formatString(message, ...optionalParams));
    }
};

function formatString (message?: any, ...optionalParams: any[]) {
    return cc.js.formatStr.apply(null, [message].concat(optionalParams));
}

/**
 * @en Outputs a message to the Cocos Creator Console (editor) or Web Console (runtime).
 * @zh 输出一条消息到 Cocos Creator 编辑器的 Console 或运行时 Web 端的 Console 中。
 * @param message - A JavaScript string containing zero or more substitution strings.
 * @param optionalParams - JavaScript objects with which to replace substitution strings within msg.
 * This gives you additional control over the format of the output.
 */
export function log (message?: any, ...optionalParams: any[]) {
    return ccLog(message, ...optionalParams);
}

/**
 * @en
 * Outputs a warning message to the Cocos Creator Console (editor) or Web Console (runtime).
 * - In Cocos Creator, warning is yellow.
 * - In Chrome, warning have a yellow warning icon with the message text.
 * @zh
 * 输出警告消息到 Cocos Creator 编辑器的 Console 或运行时 Web 端的 Console 中。<br/>
 * - 在 Cocos Creator 中，警告信息显示是黄色的。<br/>
 * - 在 Chrome 中，警告信息有着黄色的图标以及黄色的消息文本。<br/>
 * @param message - A JavaScript string containing zero or more substitution strings.
 * @param optionalParams - JavaScript objects with which to replace substitution strings within msg.
 * This gives you additional control over the format of the output.
 */
export function warn (message?: any, ...optionalParams: any[]) {
    return ccWarn(message, ...optionalParams);
}

/**
 * @en
 * Outputs an error message to the Cocos Creator Console (editor) or Web Console (runtime).<br/>
 * - In Cocos Creator, error is red.<br/>
 * - In Chrome, error have a red icon along with red message text.<br/>
 * @zh
 * 输出错误消息到 Cocos Creator 编辑器的 Console 或运行时页面端的 Console 中。<br/>
 * - 在 Cocos Creator 中，错误信息显示是红色的。<br/>
 * - 在 Chrome 中，错误信息有红色的图标以及红色的消息文本。<br/>
 * @param message - A JavaScript string containing zero or more substitution strings.
 * @param optionalParams - JavaScript objects with which to replace substitution strings within msg.
 * This gives you additional control over the format of the output.
 */
export function error (message?: any, ...optionalParams: any[]) {
    return ccError(message, ...optionalParams);
}

export function assert (value: any, message?: string, ...optionalParams: any[]) {
    return ccAssert(value, message, ...optionalParams);
}

export function _resetDebugSetting (mode: DebugMode) {
    // reset
    ccLog = ccWarn = ccError = ccAssert = () => {
    };

    if (mode === DebugMode.NONE) {
        return;
    }

    if (mode > DebugMode.ERROR) {
        // Log to web page.
        const logToWebPage = (msg: string) => {
            if (!cc.game.canvas) {
                return;
            }

            if (!logList) {
                const logDiv = document.createElement('Div');
                logDiv.setAttribute('id', 'logInfoDiv');
                logDiv.setAttribute('width', '200');
                logDiv.setAttribute('height', cc.game.canvas.height);
                const logDivStyle = logDiv.style;
                logDivStyle.zIndex = '99999';
                logDivStyle.position = 'absolute';
                logDivStyle.top = logDivStyle.left = '0';

                logList = document.createElement('textarea');
                logList.setAttribute('rows', '20');
                logList.setAttribute('cols', '30');
                logList.setAttribute('disabled', 'true');
                const logListStyle = logList.style;
                logListStyle.backgroundColor = 'transparent';
                logListStyle.borderBottom = '1px solid #cccccc';
                logListStyle.borderTopWidth = logListStyle.borderLeftWidth = logListStyle.borderRightWidth = '0px';
                logListStyle.borderTopStyle = logListStyle.borderLeftStyle = logListStyle.borderRightStyle = 'none';
                logListStyle.padding = '0px';
                logListStyle.margin = '0px';

                logDiv.appendChild(logList);
                cc.game.canvas.parentNode.appendChild(logDiv);
            }

            logList.value = logList.value + msg + '\r\n';
            logList.scrollTop = logList.scrollHeight;
        };

        ccError = (message?: any, ...optionalParams: any[]) => {
            logToWebPage('ERROR :  ' + formatString(message, ...optionalParams));
        };
        ccAssert = (condition: any, message?: any, ...optionalParams: any[]) => {
            if (!condition) {
                logToWebPage('ASSERT: ' + formatString(message, ...optionalParams));
            }
        };
        if (mode !== DebugMode.ERROR_FOR_WEB_PAGE) {
            ccWarn = (message?: any, ...optionalParams: any[]) => {
                logToWebPage('WARN :  ' + formatString(message, ...optionalParams));
            };
        }
        if (mode === DebugMode.INFO_FOR_WEB_PAGE) {
            ccLog = (message?: any, ...optionalParams: any[]) => {
                logToWebPage(formatString(message, ...optionalParams));
            };
        }
    }
    else if (console && console.log.apply) {// console is null when user doesn't open dev tool on IE9
        // Log to console.

        // For JSB
        if (!console.error) {
            console.error = console.log;
        }
        if (!console.warn) {
            console.warn = console.log;
        }

        if (CC_EDITOR) {
            ccError = Editor.error;
        }
        else if (console.error.bind) {
            // use bind to avoid pollute call stacks
            ccError = console.error.bind(console);
        }
        else {
            ccError = CC_JSB ? console.error : (message?: any, ...optionalParams: any[]) => {
                return console.error.apply(console, [message, ...optionalParams]);
            };
        }
        ccAssert = (condition: any, message?: any, ...optionalParams: any[]) => {
            if (!condition) {
                const errorText = formatString(message, ...optionalParams);
                if (CC_DEV) {
                    // tslint:disable:no-debugger
                    debugger;
                }
                else {
                    throw new Error(errorText);
                }
            }
        };
    }

    if (mode !== DebugMode.ERROR) {
        if (CC_EDITOR) {
            ccWarn = Editor.warn;
        }
        else if (console.warn.bind) {
            // use bind to avoid pollute call stacks
            ccWarn = console.warn.bind(console);
        }
        else {
            ccWarn = CC_JSB ? console.warn : (message?: any, ...optionalParams: any[]) => {
                return console.warn.apply(console, [message, ...optionalParams]);
            };
        }
    }

    if (CC_EDITOR) {
        ccLog = Editor.log;
    }
    else if (mode === DebugMode.INFO) {
        if (CC_JSB) {
            // @ts-ignore
            if (scriptEngineType === 'JavaScriptCore') {
                // console.log has to use `console` as its context for iOS 8~9. Therefore, apply it.
                ccLog = (message?: any, ...optionalParams: any[]) => {
                    return console.log.apply(console, [message, ...optionalParams]);
                };
            } else {
                ccLog = console.log;
            }
        }
        else if (console.log.bind) {
            // use bind to avoid pollute call stacks
            ccLog = console.log.bind(console);
        }
        else {
            ccLog = (message?: any, ...optionalParams: any[]) => {
                return console.log.apply(console, [message, ...optionalParams]);
            };
        }
    }
}

export function _throw (error_: any) {
    if (CC_EDITOR) {
        // @ts-ignore
        return Editor.error(error_);
    } else {
        const stack = error_.stack;
        if (stack) {
            error(CC_JSB ? (error_ + '\n' + stack) : stack);
        }
        else {
            error(error_);
        }
    }
}

function getTypedFormatter (type: 'Log' | 'Warning' | 'Error' | 'Assert') {
    return (id: number, ...args: any[]) => {
        const msg = CC_DEBUG ? (debugInfos[id] || 'unknown id') : `${type} ${id}, please go to ${ERROR_MAP_URL}#${id} to see details.`;
        if (args.length === 0) {
            return msg;
        }
        return CC_DEBUG ? formatString(msg, ...args) : msg + ' Arguments: ' + args.join(', ');
    };
}

const logFormatter = getTypedFormatter('Log');
export function logID (id: number, ...optionalParams: any[]) {
    log(logFormatter(id, ...optionalParams));
}

const warnFormatter = getTypedFormatter('Warning');
export function warnID (id: number, ...optionalParams: any[]) {
    warn(warnFormatter(id, ...optionalParams));
}

const errorFormatter = getTypedFormatter('Error');
export function errorID (id: number, ...optionalParams: any[]) {
    error(errorFormatter(id, ...optionalParams));
}

const assertFormatter = getTypedFormatter('Assert');
export function assertID (condition: boolean, id: number, ...optionalParams: any[]) {
    if (condition) {
        return;
    }
    assert(false, assertFormatter(id, ...optionalParams));
}

/**
 * @en Enum for debug modes.
 * @zh 调试模式
 */
export enum DebugMode {
    /**
     * @en The debug mode none.
     * @zh 禁止模式，禁止显示任何日志信息。
     */
    NONE = 0,

    /**
     * @en The debug mode info.
     * @zh 信息模式，在 console 中显示所有日志。
     */
    INFO = 1,

    /**
     * @en The debug mode warn.
     * @zh 警告模式，在 console 中只显示 warn 级别以上的（包含 error）日志。
     */
    WARN = 2,

    /**
     * @en The debug mode error.
     * @zh 错误模式，在 console 中只显示 error 日志。
     */
    ERROR = 3,

    /**
     * @en The debug mode info for web page.
     * @zh 信息模式（仅 WEB 端有效），在画面上输出所有信息。
     */
    INFO_FOR_WEB_PAGE = 4,

    /**
     * @en The debug mode warn for web page.
     * @zh 警告模式（仅 WEB 端有效），在画面上输出 warn 级别以上的（包含 error）信息。
     */
    WARN_FOR_WEB_PAGE = 5,

    /**
     * @en The debug mode error for web page.
     * @zh 错误模式（仅 WEB 端有效），在画面上输出 error 信息。
     */
    ERROR_FOR_WEB_PAGE = 6,
}

/**
 * @en Gets error message with the error id and possible parameters.
 * @zh 通过 error id 和必要的参数来获取错误信息。
 */
export function getError (errorId: any, param?: any): string {
    return errorFormatter(errorId, param);
}

/**
 * @en Returns whether or not to display the FPS informations.
 * @zh 是否显示 FPS 信息。
 */
export function isDisplayStats (): boolean {
    return cc.profiler ? cc.profiler.isShowingStats() : false;
}

/**
 * @en Sets whether display the FPS on the bottom-left corner.
 * @zh 设置是否在左下角显示 FPS。
 */
export function setDisplayStats (displayStats: boolean) {
    if (cc.profiler) {
        displayStats ? cc.profiler.showStats() : cc.profiler.hideStats();
        cc.game.config.showFPS = !!displayStats;
    }
}
