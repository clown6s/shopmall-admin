// src/pages/ABAC/ABACPolicyTable.tsx
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
import SecurityIcon from '@mui/icons-material/Security'
import type { ABACPolicy } from '../../types/abac'

export interface ABACPolicyTableProps {
    list: ABACPolicy[]
    loading: boolean
    canEdit?: boolean
    canDelete?: boolean
    onEdit: (policy: ABACPolicy) => void
    onDelete: (policy: ABACPolicy) => void
}

export function ABACPolicyTable({
    list,
    loading,
    canEdit,
    canDelete,
    onEdit,
    onDelete,
}: ABACPolicyTableProps): JSX.Element {
    const getPathPattern = (policy: ABACPolicy): string => {
        const ra = policy.resourceAttrs as Record<string, unknown> | undefined
        if (!ra) return '—'
        return (ra.path_pattern as string) || '—'
    }

    const getSubjectSummary = (policy: ABACPolicy): string => {
        const sa = policy.subjectAttrs as Record<string, unknown> | undefined
        if (!sa || Object.keys(sa).length === 0) return '不限'
        const parts: string[] = []
        if (sa.departments) parts.push('部门:' + (sa.departments as string[]).join(','))
        if (sa.positions) parts.push('职位:' + (sa.positions as string[]).join(','))
        if (sa.user_ids) parts.push('用户ID:' + (sa.user_ids as number[]).join(','))
        return parts.join(' | ')
    }

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
                            <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>策略名称</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>效果</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>优先级</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>路径规则</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>方法</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>匹配条件</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>状态</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>创建时间</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: '#64748b', py: 1.5 }}>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={32} sx={{ color: '#667eea' }} />
                                </TableCell>
                            </TableRow>
                        ) : !list || list.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <SecurityIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                                        <Typography>暂无策略数据</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            list.map((policy) => (
                                <TableRow
                                    key={policy.id}
                                    hover
                                    sx={{
                                        '&:hover': { background: '#f8fafc' },
                                        transition: 'background 0.2s ease',
                                    }}
                                >
                                    <TableCell align="center" sx={{ py: 1.5 }}>
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {policy.name}
                                            </Typography>
                                            {policy.description && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {policy.description}
                                                </Typography>
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center" sx={{ py: 1.5 }}>
                                        <Chip
                                            label={policy.effect === 'allow' ? '允许' : '拒绝'}
                                            color={policy.effect === 'allow' ? 'success' : 'error'}
                                            size="small"
                                            sx={{ height: 24, fontWeight: 500, '& .MuiChip-label': { px: 1 } }}
                                        />
                                    </TableCell>
                                    <TableCell align="center" sx={{ py: 1.5 }}>
                                        <Chip
                                            label={policy.priority}
                                            size="small"
                                            variant="outlined"
                                            sx={{ height: 24, fontWeight: 600, color: '#6366f1', borderColor: '#c7d2fe' }}
                                        />
                                    </TableCell>
                                    <TableCell align="center" sx={{ py: 1.5 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontFamily: 'monospace',
                                                fontSize: '0.8rem',
                                                background: '#f1f5f9',
                                                px: 1,
                                                py: 0.5,
                                                borderRadius: '6px',
                                                display: 'inline-block',
                                            }}
                                        >
                                            {getPathPattern(policy)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center" sx={{ py: 1.5 }}>
                                        <Chip
                                            label={policy.action}
                                            size="small"
                                            variant="outlined"
                                            sx={{ height: 24, fontFamily: 'monospace', fontSize: '0.75rem' }}
                                        />
                                    </TableCell>
                                    <TableCell align="center" sx={{ py: 1.5, maxWidth: 220 }}>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                fontSize: '0.75rem',
                                                lineHeight: 1.4,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                            title={getSubjectSummary(policy)}
                                        >
                                            {getSubjectSummary(policy)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center" sx={{ py: 1.5 }}>
                                        <Chip
                                            label={policy.status === 1 ? '启用' : '禁用'}
                                            color={policy.status === 1 ? 'success' : 'default'}
                                            size="small"
                                            sx={{ height: 24, fontWeight: 500, '& .MuiChip-label': { px: 1 } }}
                                        />
                                    </TableCell>
                                    <TableCell align="center" sx={{ py: 1.5 }}>
                                        <Typography variant="body2">
                                            {policy.createdAt ? policy.createdAt.split('T')[0] : '—'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center" sx={{ py: 1.5, pr: 3 }}>
                                        {canEdit && (
                                        <Tooltip title="编辑">
                                            <IconButton
                                                size="small"
                                                aria-label="编辑"
                                                onClick={() => onEdit(policy)}
                                                sx={{
                                                    color: '#64748b',
                                                    '&:hover': { background: 'rgba(100, 116, 139, 0.1)' },
                                                }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        )}
                                        {canDelete && (
                                        <Tooltip title="删除">
                                            <IconButton
                                                size="small"
                                                aria-label="删除"
                                                onClick={() => onDelete(policy)}
                                                sx={{
                                                    color: '#ef4444',
                                                    '&:hover': { background: 'rgba(239, 68, 68, 0.1)' },
                                                }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        )}
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
