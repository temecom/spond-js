// Polyfill EventTarget for GAS environment if missing (required by Chai/Vite polyfills)
if (typeof EventTarget === 'undefined') {
    // @ts-ignore
    globalThis.EventTarget = class EventTarget {
        private listeners: { [key: string]: Function[] };

        constructor() {
            this.listeners = {};
        }

        addEventListener(type: string, callback: Function) {
            if (!this.listeners) this.listeners = {};
            if (!(type in this.listeners)) {
                this.listeners[type] = [];
            }
            this.listeners[type].push(callback);
        }

        removeEventListener(type: string, callback: Function) {
            if (!this.listeners || !(type in this.listeners)) {
                return;
            }
            const stack = this.listeners[type];
            for (let i = 0, l = stack.length; i < l; i++) {
                if (stack[i] === callback) {
                    stack.splice(i, 1);
                    return;
                }
            }
        }

        dispatchEvent(event: { type: string; [key: string]: any }) {
            if (!this.listeners || !(event.type in this.listeners)) {
                return true;
            }
            const stack = this.listeners[event.type].slice();
            for (let i = 0, l = stack.length; i < l; i++) {
                stack[i].call(this, event);
            }
            return !event.defaultPrevented;
        }
    };
}