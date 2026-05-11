import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import type { CategoryDialogData, FlattenCategory } from './types';

interface CategoryDialogProps {
    mode: 'add' | 'edit';
    open: boolean;
    editingId?: string | null;
    formData: CategoryDialogData;
    computedFlatCategories: FlattenCategory[];
    onFormDataChange: (data: CategoryDialogData) => void;
    onSubmit: () => void;
    onClose: () => void;
}

export default function CategoryDialog({
    mode,
    open,
    editingId,
    formData,
    computedFlatCategories,
    onFormDataChange,
    onSubmit,
    onClose,
}: CategoryDialogProps) {
    const isEdit = mode === 'edit';

    const handleChange = (field: keyof CategoryDialogData, value: unknown) => {
        onFormDataChange({ ...formData, [field]: value });
    };

    const title = isEdit ? '编辑分类' : '添加分类';
    const Icon = isEdit ? EditIcon : AddIcon;
    const submitLabel = isEdit ? '保存修改' : '添加';

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ pb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon color="primary" />
                    {title}
                    {isEdit && editingId && (
                        <Chip label={`ID: ${editingId}`} size="small" variant="outlined" sx={{ ml: 1 }} />
                    )}
                    {!isEdit && (
                        <Chip
                            label={`${formData.catLevel === 1 ? '一级' : formData.catLevel === 2 ? '二级' : '三级'}分类`}
                            size="small"
                            color={formData.catLevel === 1 ? 'primary' : formData.catLevel === 2 ? 'secondary' : 'default'}
                            sx={{ ml: 1 }}
                        />
                    )}
                </Box>
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                {!isEdit && (
                    <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'grey.50' }}>
                        <Typography variant="caption" color="text.secondary">父级分类</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                            {formData.parentCid === 0
                                ? '顶级分类（无父级）'
                                : `📁 ${computedFlatCategories.find(c => c.id === String(formData.parentCid))?.name || '未知分类'}`}
                        </Typography>
                    </Paper>
                )}

                {isEdit && (
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'primary.50', borderColor: 'primary.main' }}>
                        <Typography variant="subtitle2" color="primary" gutterBottom>分类信息</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">层级</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {(() => {
                                        const cat = computedFlatCategories.find(c => c.id === String(editingId));
                                        return cat?.catLevel === 1 ? '一级分类' : cat?.catLevel === 2 ? '二级分类' : '三级分类';
                                    })()}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">当前状态</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {formData.showStatus ? '显示中' : '已隐藏'}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                )}

                <TextField
                    autoFocus
                    label="分类名称"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') onSubmit(); }}
                    fullWidth
                    required
                    placeholder="请输入分类名称"
                    error={!formData.name.trim()}
                    helperText={!formData.name.trim() ? '分类名称不能为空' : ''}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        label="排序"
                        type="number"
                        value={formData.sort}
                        onChange={(e) => handleChange('sort', Number(e.target.value))}
                        sx={{ flex: 1 }}
                        size="small"
                    />
                    <FormControlLabel
                        sx={{ flex: 1 }}
                        control={
                            <Switch
                                checked={formData.showStatus}
                                onChange={(e) => handleChange('showStatus', e.target.checked)}
                            />
                        }
                        label={formData.showStatus ? '显示' : '隐藏'}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose}>取消</Button>
                <Button onClick={onSubmit} variant="contained" startIcon={isEdit ? <EditIcon /> : <AddIcon />}>
                    {submitLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
