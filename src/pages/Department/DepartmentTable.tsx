// src/pages/Department/DepartmentTable.tsx
import { type JSX } from 'react'
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    CircularProgress,
    Chip,
    Pagination,
    Tooltip,
    TextField,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import GroupsIcon from '@mui/icons-material/Groups'
import type { IDepartment } from '../../types/department'

export interface DepartmentTableProps {
    list: IDepartment[]
    loading: boolean
    page: number
    pageSize: number
    total: number
    isAdmin: boolean
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
    onEdit: (dept: IDepartment) => void
    onDelete: (dept: IDepartment) => void
}

export function DepartmentTable({
    list,
    loading,
    page,
    pageSize,
    total,
    isAdmin,
    onPageChange,
    onPageSizeChange,
    onEdit,
    onDelete,
}: DepartmentTableProps): JSX.Element {
    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
            }}
        >
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow sx={{ background: '#f8fafc' }}>
                            <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>部门名称</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>排序</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>状态</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>创建时间</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>备注</TableCell>
                            {isAdmin && (
                                <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>
                                    操作
                                </TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={isAdmin ? 6 : 5} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={32} sx={{ color: '#667eea' }} />
                                </TableCell>
                            </TableRow>
                        ) : !list || list.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={isAdmin ? 6 : 5} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <GroupsIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                                        <Typography>暂无部门数据</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            list.map((dept) => (
                                <TableRow
                                    key={dept.deptId}
                                    hover
                                    sx={{
                                        '&:hover': { background: '#f8fafc' },
                                        transition: 'background 0.2s ease',
                                    }}
                                >
                                    <TableCell align="center" sx={{ py: 1.5 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {dept.deptName}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center" sx={{ py: 1.5 }}>
                                        <Typography variant="body2">{dept.deptSort}</Typography>
                                    </TableCell>
                                    <TableCell align="center" sx={{ py: 1.5 }}>
                                        <Chip
                                            label={dept.status === 1 ? '启用' : '禁用'}
                                            color={dept.status === 1 ? 'success' : 'default'}
                                            size="small"
                                            sx={{ height: 24, fontWeight: 500, '& .MuiChip-label': { px: 1 } }}
                                        />
                                    </TableCell>
                                    <TableCell align="center" sx={{ py: 1.5 }}>
                                        <Typography variant="body2">
                                            {dept.createTime ? dept.createTime.split('T')[0] : '—'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center" sx={{ py: 1.5 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            {dept.remark || '—'}
                                        </Typography>
                                    </TableCell>
                                    {isAdmin && (
                                        <TableCell align="center" sx={{ py: 1.5, pr: 3 }}>
                                            <Tooltip title="编辑">
                                                <IconButton
                                                    size="small"
                                                    aria-label="编辑"
                                                    onClick={() => onEdit(dept)}
                                                    sx={{
                                                        color: '#64748b',
                                                        '&:hover': {
                                                            background: 'rgba(100, 116, 139, 0.1)',
                                                        },
                                                    }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="删除">
                                                <IconButton
                                                    size="small"
                                                    aria-label="删除"
                                                    onClick={() => onDelete(dept)}
                                                    sx={{
                                                        color: '#ef4444',
                                                        '&:hover': {
                                                            background: 'rgba(239, 68, 68, 0.1)',
                                                        },
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* 分页器 */}
            {total > 0 && (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        px: 2,
                        py: 2.5,
                        borderTop: '1px solid #e2e8f0',
                        flexShrink: 0,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="body2" color="text.secondary">
                            每页
                        </Typography>
                        <TextField
                            size="small"
                            select
                            value={pageSize}
                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                            slotProps={{ select: { native: true } }}
                            sx={{
                                width: 80,
                                '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                            }}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </TextField>
                        <Typography variant="body2" color="text.secondary">
                            条，共 {total} 条
                        </Typography>
                    </Box>
                    <Pagination
                        count={Math.ceil(total / pageSize)}
                        page={page}
                        onChange={(_, v) => onPageChange(v)}
                        shape="rounded"
                        size="small"
                        sx={{
                            '& .MuiPaginationItem-root': { borderRadius: '10px' },
                        }}
                    />
                </Box>
            )}
        </Paper>
    )
}
