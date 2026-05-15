// URL 验证工具函数
export const isValidUrl = (url: string): boolean => {
    if (!url) return false;
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
};

// 手机号验证（中国大陆）
const PHONE_REGEX = /^1[3-9]\d{9}$/;
export const isValidPhone = (phone: string): boolean => {
    return PHONE_REGEX.test(phone);
};

// 邮箱验证
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const isValidEmail = (email: string): boolean => {
    return EMAIL_REGEX.test(email);
};

// 密码强度校验：至少 8 位，且包含大小写字母和数字
export const isValidPassword = (password: string): boolean => {
    return typeof password === 'string' && password.length >= 8 &&
        /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);
};
export const PASSWORD_HINT = '密码至少8位，需包含大写字母、小写字母和数字';
