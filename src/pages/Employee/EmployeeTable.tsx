// src/pages/Employee/EmployeeTable.tsx
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
    TextField,
    Avatar,
    Tooltip,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import MaleIcon from '@mui/icons-material/Male'
import FemaleIcon from '@mui/icons-material/Female'
import QuestionMarkIcon from '@mui/icons-material/QuestionMark'
import BadgeIcon from '@mui/icons-material/Badge'
import type { IEmployee } from '../../types/employee'
import type { IDepartment } from '../../types/department'

const GENDER_MAP: Record<number, { label: string; color: 'primary' | 'secondary' | 'default'; icon: JSX.Element }> = {
    1: { label: '男', color: 'primary', icon: <MaleIcon fontSize="small" /> },
    2: { label: '女', color: 'secondary', icon: <FemaleIcon fontSize="small" /> },
    3: { label: '未知', color: 'default', icon: <QuestionMarkIcon fontSize="small" /> },
}

const ROLE_DISPLAY: Record<string, string> = {
    '管理员': '管理员',
    'employee': '员工',
}

const cellSx = { py: 1.5 }
const headerCellSx = { fontWeight: 600, color: '#64748b', py: 1.5 }

interface EmployeeTableProps {
    list: IEmployee[]
    loading: boolean
    page: number
    pageSize: number
    total: number
    isAdmin: boolean
    departments: IDepartment[]
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
    onEdit: (emp: IEmployee) => void
    onDelete: (emp: IEmployee) => void
}

export function EmployeeTable({
    list,
    loading,
    page,
    pageSize,
    total,
    isAdmin,
    departments,
    onPageChange,
    onPageSizeChange,
    onEdit,
    onDelete,
}: EmployeeTableProps): JSX.Element {
    const getInitials = (name: string) => (name ? name.charAt(0).toUpperCase() : '?')

    const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
        onPageChange(value)
    }

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 400,
                mb: 3,
            }}
        >
            <TableContainer sx={{ flex: 1 }}>
                <Table aria-label="员工列表">
                    <TableHead>
                        <TableRow sx={{ background: '#f8fafc' }}>
                            <TableCell sx={{ ...headerCellSx, pl: 3 }}>员工信息</TableCell>
                            <TableCell align="center" sx={headerCellSx}>岗位</TableCell>
                            <TableCell align="center" sx={headerCellSx}>联系方式</TableCell>
                            <TableCell align="center" sx={headerCellSx}>性别</TableCell>
                            <TableCell align="center" sx={headerCellSx}>年龄</TableCell>
                            <TableCell align="center" sx={headerCellSx}>角色</TableCell>
                            <TableCell align="center" sx={headerCellSx}>状态</TableCell>
                            <TableCell align="center" sx={headerCellSx}>入职日期</TableCell>
                            {isAdmin && (
                                <TableCell align="center" sx={{ ...headerCellSx, pr: 3 }}>
                                    操作
                                </TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={isAdmin ? 10 : 9} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={32} sx={{ color: '#667eea' }} />
                                </TableCell>
                            </TableRow>
                        ) : list.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={isAdmin ? 10 : 9}
                                    align="center"
                                    sx={{ py: 8, color: 'text.secondary' }}
                                >
                                    <Box sx={{ textAlign: 'center' }}>
                                        <BadgeIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                                        <Typography>暂无员工数据</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            (list || []).map((emp) => {
                                const g = GENDER_MAP[emp.gender] ?? GENDER_MAP[3]
                                const deptName =
                                    (departments || []).find((d) => String(d.deptId) === emp.department)?.deptName ||
                                    emp.department
                                return (
                                    <TableRow
                                        key={emp.id}
                                        hover
                                        sx={{
                                            '&:hover': { background: '#f8fafc' },
                                            transition: 'background 0.2s ease',
                                        }}
                                    >
                                        <TableCell sx={{ ...cellSx, pl: 3 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                {emp.avatar ? (
                                                    <Avatar
                                                        src={emp.avatar}
                                                        sx={{ width: 36, height: 36, fontWeight: 600 }}
                                                    />
                                                ) : (
                                                    <Avatar
                                                        sx={{
                                                            width: 36,
                                                            height: 36,
                                                            background:
                                                                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                            fontWeight: 600,
                                                            fontSize: 14,
                                                        }}
                                                    >
                                                        {getInitials(emp.realName)}
                                                    </Avatar>
                                                )}
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {emp.realName}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        ID: {emp.id}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center" sx={cellSx}>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {deptName || '—'}
                                                {(deptName || emp.department) && emp.position && ' / '}
                                                {emp.position || ''}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center" sx={cellSx}>
                                            <Typography variant="body2">{emp.phone}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {emp.email || '—'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center" sx={cellSx}>
                                            <Chip
                                                icon={g.icon}
                                                label={g.label}
                                                color={g.color}
                                                size="small"
                                                sx={{
                                                    height: 26,
                                                    '& .MuiChip-icon': { fontSize: 15 },
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="center" sx={cellSx}>
                                            <Typography variant="body2">
                                                {emp.age ? `${emp.age}岁` : '—'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={ROLE_DISPLAY[emp.role] || emp.role || '员工'}
                                                size="small"
                                                sx={{
                                                    height: 24,
                                                    fontWeight: 500,
                                                    background: emp.role === '管理员' ? '#fef3c7' : '#f0fdf4',
                                                    color: emp.role === '管理员' ? '#d97706' : '#16a34a',
                                                    border: emp.role === '管理员' ? '1px solid #fde68a' : '1px solid #bbf7d0',
                                                    '& .MuiChip-label': { px: 1 },
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="center" sx={cellSx}>
                                            <Chip
                                                label={emp.workStatus === 1 ? '在职' : '离职'}
                                                color={emp.workStatus === 1 ? 'success' : 'default'}
                                                size="small"
                                                sx={{ height: 24, fontWeight: 500, '& .MuiChip-label': { px: 1 } }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ ...cellSx, textAlign: 'center' }}>
                                            <Typography variant="body2">
                                                {emp.createTime ? emp.createTime.split('T')[0] : '—'}
                                            </Typography>
                                        </TableCell>
                                        {isAdmin && (
                                            <TableCell align="center" sx={{ ...cellSx, pr: 3 }}>
                                                <Tooltip title="编辑">
                                                    <IconButton
                                                        size="small"
                                                        aria-label="编辑"
                                                        onClick={() => onEdit(emp)}
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
                                                        onClick={() => onDelete(emp)}
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
                                )
                            })
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
                        onChange={handlePageChange}
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
