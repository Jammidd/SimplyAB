import { isBrowser } from "./browser";

export const getCookie = (name) => {
    if (!isBrowser()) {
        return "";
    }
    const r = document.cookie.match(`\\b${name}=([^;]*)\\b`);
    return r ? r[1] : "";
};

export const setCookie = (name, value, days = 0) => {
    if (typeof document !== "object") {
        return "";
    }
    let expires = "";
    let path = "; path=/";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = `; expires=${date.toUTCString()}`;
    }

    document.cookie = `${name}=${value}${expires}${path}`;
    return document.cookie;
};
