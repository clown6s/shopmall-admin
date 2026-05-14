import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

interface DeleteConfirmDialogProps {
    open: boolean;
    /** 删除目标：分类用 id 字符串，品牌用 Brand 对象 */
    target: { id: string; name: string } | string | null;
    /** 删除类型，影响提示文案 */
    targetType?: 'category' | 'brand';
    /** 是否正在删除中 */
    deleting?: boolean;
    onConfirm: () => void;
    onClose: () => void;
}

export default function DeleteConfirmDialog({
    open,
    target,
    targetType = 'category',
    deleting = false,
    onConfirm,
    onClose,
}: DeleteConfirmDialogProps) {
    const targetName = typeof target === 'string'
        ? target
        : target?.name || '';

    const title = targetType === 'brand' ? '确认删除品牌' : '确认删除';
    const description = targetType === 'brand'
        ? `确定要删除品牌「${targetName}」吗？删除后将同时移除该品牌与所有分类的关联关系，此操作不可恢复。`
        : '确定要删除该分类吗？删除后无法恢复。';

    return (
        <Dialog open={open} onClose={deleting ? undefined : onClose} disablePortal>
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DeleteIcon color="error" />
                    {title}
                </Box>
            </DialogTitle>
            <DialogContent>
                <DialogContentText>{description}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={deleting}>取消</Button>
                <Button
                    onClick={onConfirm}
                    color="error"
                    variant="contained"
                    startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
                    disabled={deleting}
                >
                    {deleting ? '删除中...' : '删除'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
