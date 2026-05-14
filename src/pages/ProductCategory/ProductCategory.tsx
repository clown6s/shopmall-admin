import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BusinessIcon from '@mui/icons-material/Business';
import { useCategoryData } from './useCategoryData';
import CategoryTree from './CategoryTree';
import CategoryDialog from './CategoryDialog';
import BrandDialog from './BrandDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import type { CategoryDialogData, BrandDialogData } from './types';

export default function ProductCategory() {
    const {
        containerRef,
        items, loading, error, computedFlatCategories,
        addDialogOpen, setNewCategory,
        editDialogOpen, editingId, setEditCategory,
        deleteDialogOpen, deletingId,
        newCategory, editCategory,
        selectedCategoryId, selectedCategoryName,
        brands, brandsLoading,
        addBrandDialogOpen, newBrand, setNewBrand,
        editBrandDialogOpen, editingBrand, editBrand, setEditBrand,
        deleteBrandDialogOpen, deletingBrand,
        snackbar,
        canCreate, canEdit, canDelete,
        canCreateBrand, canEditBrand, canDeleteBrand,
        handleAddChild,
        handleCloseAddDialog, handleConfirmAdd,
        handleEdit, handleCloseEditDialog, handleConfirmEdit,
        handleDelete, handleConfirmDelete, handleCancelDelete,
        handleSelectCategory,
        handleOpenAddBrandDialog, handleCloseAddBrandDialog, handleConfirmAddBrand,
        handleOpenEditBrandDialog, handleCloseEditBrandDialog, handleConfirmEditBrand,
        handleOpenDeleteBrandDialog, handleCloseDeleteBrandDialog, handleConfirmDeleteBrand,
        handleSnackbarClose,
    } = useCategoryData();

    const handleAddCategoryChange = React.useCallback((data: CategoryDialogData) => {
        setNewCategory(data);
    }, [setNewCategory]);

    const handleEditCategoryChange = React.useCallback((data: CategoryDialogData) => {
        setEditCategory(data);
    }, [setEditCategory]);

    const handleAddBrandChange = React.useCallback((data: BrandDialogData) => {
        setNewBrand(data);
    }, [setNewBrand]);

    const handleEditBrandChange = React.useCallback((data: BrandDialogData) => {
        setEditBrand(data);
    }, [setEditBrand]);

    return (
        <>
            {/* 删除分类确认对话框 */}
            <DeleteConfirmDialog
                open={deleteDialogOpen}
                target={deletingId}
                targetType="category"
                onConfirm={handleConfirmDelete}
                onClose={handleCancelDelete}
            />

            {/* 添加分类对话框 */}
            <CategoryDialog
                mode="add"
                open={addDialogOpen}
                formData={newCategory}
                computedFlatCategories={computedFlatCategories}
                onFormDataChange={handleAddCategoryChange}
                onSubmit={handleConfirmAdd}
                onClose={handleCloseAddDialog}
            />

            {/* 编辑分类对话框 */}
            <CategoryDialog
                mode="edit"
                open={editDialogOpen}
                editingId={editingId}
                formData={editCategory}
                computedFlatCategories={computedFlatCategories}
                onFormDataChange={handleEditCategoryChange}
                onSubmit={handleConfirmEdit}
                onClose={handleCloseEditDialog}
            />

            {/* 添加品牌对话框 */}
            <BrandDialog
                mode="add"
                open={addBrandDialogOpen}
                selectedCategoryName={selectedCategoryName}
                formData={newBrand}
                onFormDataChange={handleAddBrandChange}
                onSubmit={handleConfirmAddBrand}
                onClose={handleCloseAddBrandDialog}
            />

            {/* 编辑品牌对话框 */}
            <BrandDialog
                mode="edit"
                open={editBrandDialogOpen}
                editingBrand={editingBrand}
                formData={editBrand}
                onFormDataChange={handleEditBrandChange}
                onSubmit={handleConfirmEditBrand}
                onClose={handleCloseEditBrandDialog}
            />

            {/* 删除品牌确认对话框 */}
            <DeleteConfirmDialog
                open={deleteBrandDialogOpen}
                target={deletingBrand ? { id: String(deletingBrand.brandId), name: deletingBrand.name } : null}
                targetType="brand"
                onConfirm={handleConfirmDeleteBrand}
                onClose={handleCloseDeleteBrandDialog}
            />

            {/* 提示消息 */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* 主内容区 - 左右分栏 */}
            <Box sx={{ display: 'flex', gap: 2, height: 'calc(100vh - 112px)' }}>
                {/* 左侧：商品分类树 */}
                <CategoryTree
                    items={items}
                    computedFlatCategories={computedFlatCategories}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onAddChild={handleAddChild}
                    onSelectCategory={handleSelectCategory}
                    canCreate={canCreate}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    loading={loading}
                    error={error}
                    containerRef={containerRef}
                />

                {/* 右侧：品牌列表 */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BusinessIcon color="primary" />
                            品牌分类
                            {selectedCategoryName && (
                                <Chip label={selectedCategoryName} size="small" color="primary" variant="outlined" sx={{ ml: 1 }} />
                            )}
                        </Typography>
                        {canCreateBrand && (
                            <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddBrandDialog} disabled={!selectedCategoryId}>
                                添加品牌
                            </Button>
                        )}
                    </Box>

                    {selectedCategoryId === null ? (
                        <Paper sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
                            <Typography color="text.secondary">请选择分类树中的三级分类查看关联品牌</Typography>
                        </Paper>
                    ) : brandsLoading ? (
                        <Paper sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CircularProgress />
                        </Paper>
                    ) : brands.length === 0 ? (
                        <Paper sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
                            <Typography color="text.secondary">该分类暂未关联任何品牌</Typography>
                        </Paper>
                    ) : (
                        <Paper sx={{ flex: 1, overflow: 'auto' }}>
                            <TableContainer>
                                <Table size="small" aria-label="品牌列表">
                                    <TableHead sx={{ bgcolor: 'grey.100' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold', width: 56, textAlign: 'center' }}>Logo</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>品牌名称</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', width: 80, textAlign: 'center' }}>首字母</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', width: 70, textAlign: 'center' }}>状态</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', width: 60, textAlign: 'center' }}>排序</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>描述</TableCell>
                                            {(canEditBrand || canDeleteBrand) && (
                                                <TableCell sx={{ fontWeight: 'bold', width: 90, textAlign: 'center' }}>操作</TableCell>
                                            )}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {brands.map((brand) => (
                                            <TableRow key={brand.brandId} hover>
                                                <TableCell sx={{ width: 56, textAlign: 'center' }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                        <Avatar src={brand.logo} variant="rounded" sx={{ width: 36, height: 36 }}>
                                                            {brand.name.charAt(0)}
                                                        </Avatar>
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 500, textAlign: 'center' }}>{brand.name}</TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    <Chip label={brand.firstLetter || '-'} size="small" variant="outlined" />
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    {brand.showStatus ? (
                                                        <Chip label="显示" size="small" color="success" variant="filled" />
                                                    ) : (
                                                        <Chip label="隐藏" size="small" color="default" variant="outlined" />
                                                    )}
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>{brand.sort}</TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    <Typography variant="body2" noWrap title={brand.description}>
                                                        {brand.description || '-'}
                                                    </Typography>
                                                </TableCell>
                                                {(canEditBrand || canDeleteBrand) && (
                                                    <TableCell sx={{ textAlign: 'center' }}>
                                                        {canEditBrand && (
                                                            <Tooltip title="编辑">
                                                                <IconButton size="small" color="primary" onClick={() => handleOpenEditBrandDialog(brand)}>
                                                                    <EditIcon sx={{ fontSize: 18 }} />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                        {canDeleteBrand && (
                                                            <Tooltip title="删除">
                                                                <IconButton size="small" color="error" onClick={() => handleOpenDeleteBrandDialog(brand)}>
                                                                    <DeleteIcon sx={{ fontSize: 18 }} />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    )}
                </Box>
            </Box>
        </>
    );
}
