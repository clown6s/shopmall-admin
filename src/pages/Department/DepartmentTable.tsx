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
    Tooltip,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import GroupsIcon from '@mui/icons-material/Groups'
import type { IDepartment } from '../../types/department'
import PaginationBar from '../../components/PaginationBar'

export interface DepartmentTableProps {
    list: IDepartment[]
    loading: boolean
    page: number
    pageSize: number
    total: number
    canEdit: boolean; canDelete: boolean
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
    canEdit, canDelete,
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
                <Table aria-label="部门列表">
                    <TableHead>
                        <TableRow sx={{ background: '#f8fafc' }}>
                            <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>部门名称</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>排序</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>状态</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>创建时间</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>备注</TableCell>
                            {(canEdit || canDelete) && (
                                <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>
                                    操作
                                </TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={(canEdit || canDelete) ? 6 : 5} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={32} sx={{ color: '#667eea' }} />
                                </TableCell>
                            </TableRow>
                        ) : !list || list.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={(canEdit || canDelete) ? 6 : 5} align="center" sx={{ py: 8, color: 'text.secondary' }}>
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
                                    {(canEdit || canDelete) && (
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
                <PaginationBar
                    page={page}
                    pageSize={pageSize}
                    total={total}
                    onPageChange={onPageChange}
                    onPageSizeChange={onPageSizeChange}
                />
            )}
        </Paper>
    )
}
