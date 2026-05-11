import type { CategoryTreeItem, Brand } from "../../types/product";

export interface FlattenCategory {
    id: string;
    name: string;
    level: number;
    catLevel: number;
    parentCid: number;
}

export interface CustomTreeItemProps {
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onAddChild: (id: string) => void;
    level?: number;
    isAdmin?: boolean;
}

export type DialogMode = 'add' | 'edit';

export interface CategoryDialogData {
    name: string;
    parentCid: number;
    catLevel: number;
    showStatus: boolean;
    sort: number;
}

export interface BrandDialogData {
    name: string;
    logo: string;
    description: string;
    showStatus: boolean;
    firstLetter: string;
    sort: number;
}

export interface SnackbarState {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning';
}

export { type CategoryTreeItem, type Brand };
