// src/utils/dialog.ts
// MUI Dialog 共享样式常量

/** Dialog Paper 组件的 slotProps，所有 Dialog 统一使用 */
export const DIALOG_PAPER_SLOT_PROPS = {
    paper: {
        sx: {
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        },
    },
} as const
