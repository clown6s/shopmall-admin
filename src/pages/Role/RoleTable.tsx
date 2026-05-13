// src/pages/Role/RoleTable.tsx
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
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import type { IRole } from '../../types/role'

export interface RoleTableProps {
    list: IRole[]
    loading: boolean
    onEdit: (role: IRole) => void
    onAssignPermissions: (role: IRole) => void
    onDelete: (role: IRole) => void
}

export function RoleTable({ list, loading, onEdit, onAssignPermissions, onDelete }: RoleTableProps): JSX.Element {
    return (
        <Paper elevation={0} sx={{ borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow sx={{ background: '#f8fafc' }}>
                            <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>角色名称</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>角色标识</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>描述</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>状态</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>创建时间</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6 }}><CircularProgress size={32} sx={{ color: '#667eea' }} /></TableCell></TableRow>
                        ) : !list || list.length === 0 ? (
                            <TableRow><TableCell colSpan={6} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                                <Box sx={{ textAlign: 'center' }}><VpnKeyIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} /><Typography>暂无角色数据</Typography></Box>
                            </TableCell></TableRow>
                        ) : (
                            list.map((role) => (
                                <TableRow key={role.id} hover sx={{ '&:hover': { background: '#f8fafc' }, transition: 'background 0.2s ease' }}>
                                    <TableCell align="center" sx={{ py: 1.5 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{role.roleName}</Typography>
                                    </TableCell>
                                    <TableCell align="center" sx={{ py: 1.5 }}>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', background: '#f1f5f9', px: 1, py: 0.5, borderRadius: '6px', display: 'inline-block' }}>
                                            {role.roleKey}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center" sx={{ py: 1.5 }}>
                                        <Typography variant="body2" color="text.secondary">{role.description || '—'}</Typography>
                                    </TableCell>
                                    <TableCell align="center" sx={{ py: 1.5 }}>
                                        <Chip label={role.status === 1 ? '启用' : '禁用'} color={role.status === 1 ? 'success' : 'default'} size="small" sx={{ height: 24, fontWeight: 500, '& .MuiChip-label': { px: 1 } }} />
                                    </TableCell>
                                    <TableCell align="center" sx={{ py: 1.5 }}>
                                        <Typography variant="body2">{role.createdAt ? role.createdAt.split('T')[0] : '—'}</Typography>
                                    </TableCell>
                                    <TableCell align="center" sx={{ py: 1.5, pr: 3 }}>
                                        <Tooltip title="编辑">
                                            <IconButton size="small" onClick={() => onEdit(role)} sx={{ color: '#64748b', '&:hover': { background: 'rgba(100, 116, 139, 0.1)' } }}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="分配权限">
                                            <IconButton size="small" onClick={() => onAssignPermissions(role)} sx={{ color: '#6366f1', '&:hover': { background: 'rgba(99, 102, 241, 0.1)' } }}>
                                                <VpnKeyIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="删除">
                                            <IconButton size="small" onClick={() => onDelete(role)} sx={{ color: '#ef4444', '&:hover': { background: 'rgba(239, 68, 68, 0.1)' } }}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    )
}
