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
import Avatar from '@mui/material/Avatar';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import BusinessIcon from '@mui/icons-material/Business';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { isValidUrl } from '../../utils/validators';
import type { Brand, BrandDialogData } from './types';

interface BrandDialogProps {
    mode: 'add' | 'edit';
    open: boolean;
    editingBrand?: Brand | null;
    selectedCategoryName?: string;
    formData: BrandDialogData;
    onFormDataChange: (data: BrandDialogData) => void;
    onSubmit: () => void;
    onClose: () => void;
}

export default function BrandDialog({
    mode,
    open,
    editingBrand,
    selectedCategoryName,
    formData,
    onFormDataChange,
    onSubmit,
    onClose,
}: BrandDialogProps) {
    const isEdit = mode === 'edit';

    const handleChange = (field: keyof BrandDialogData, value: unknown) => {
        onFormDataChange({ ...formData, [field]: value });
    };

    const title = isEdit ? '编辑品牌' : '添加品牌';
    const Icon = isEdit ? EditIcon : BusinessIcon;
    const submitLabel = isEdit ? '保存修改' : '添加';

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth disablePortal>
            <DialogTitle sx={{ pb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon color="primary" />
                    {title}
                    {isEdit && editingBrand && (
                        <Chip label={`ID: ${editingBrand.brandId}`} size="small" variant="outlined" sx={{ ml: 1 }} />
                    )}
                    {!isEdit && selectedCategoryName && (
                        <Chip label={`关联分类: ${selectedCategoryName}`} size="small" color="primary" variant="outlined" sx={{ ml: 1 }} />
                    )}
                </Box>
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                {/* 品牌预览卡片 */}
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                        src={formData.logo}
                        variant="rounded"
                        sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: '1.5rem' }}
                    >
                        {formData.name ? formData.name.charAt(0).toUpperCase() : <BusinessIcon />}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                            {formData.name || '品牌名称'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {formData.description || '暂无描述'}
                        </Typography>
                    </Box>
                    {formData.firstLetter && (
                        <Chip label={formData.firstLetter} size="small" variant="outlined" />
                    )}
                </Paper>

                <TextField
                    autoFocus
                    label="品牌名称"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') onSubmit(); }}
                    fullWidth
                    required
                    placeholder="请输入品牌名称"
                    error={!formData.name.trim()}
                    helperText={!formData.name.trim() ? '品牌名称不能为空' : ''}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        label="首字母"
                        value={formData.firstLetter}
                        onChange={(e) => handleChange('firstLetter', e.target.value.toUpperCase())}
                        placeholder="如: A"
                        sx={{ flex: 1 }}
                        size="small"
                        slotProps={{ input: { inputProps: { maxLength: 1 } } }}
                    />
                    <TextField
                        label="排序"
                        type="number"
                        value={formData.sort}
                        onChange={(e) => handleChange('sort', Number(e.target.value))}
                        sx={{ flex: 1 }}
                        size="small"
                    />
                </Box>

                <TextField
                    label="品牌Logo"
                    value={formData.logo}
                    onChange={(e) => handleChange('logo', e.target.value)}
                    size="small"
                    placeholder="输入Logo URL"
                    slotProps={{
                        input: {
                            startAdornment: formData.logo && isValidUrl(formData.logo) ? (
                                <Box component="span" sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                                    <img src={formData.logo} alt="logo" height={24} style={{ borderRadius: 4 }} crossOrigin="anonymous" referrerPolicy="no-referrer" />
                                </Box>
                            ) : null,
                        },
                    }}
                />

                <TextField
                    label="品牌描述"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    size="small"
                    placeholder="输入品牌描述"
                    multiline
                    rows={2}
                />

                <Paper variant="outlined" sx={{ p: 1.5 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={formData.showStatus}
                                onChange={(e) => handleChange('showStatus', e.target.checked)}
                                color="success"
                            />
                        }
                        label={
                            <Typography variant="body2">
                                {formData.showStatus ? (
                                    <><CheckCircleIcon color="success" fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />显示该品牌</>
                                ) : (
                                    <><CancelIcon color="error" fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />隐藏该品牌</>
                                )}
                            </Typography>
                        }
                    />
                </Paper>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose}>取消</Button>
                <Button onClick={onSubmit} variant="contained" color="primary" startIcon={isEdit ? <EditIcon /> : <AddIcon />}>
                    {submitLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
