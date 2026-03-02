// src/Pages/InvitationManagementPage/InvitationManagementPage.js

import React from 'react';
import { CssBaseline, Box } from '@mui/material';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import InvitationManagementContent from './Components/Content/InvitationManagementContent';

// --- THEME ĐƯỢC "THỪA KẾ" TỪ INVITATION DESIGN ---
// Áp dụng lại theme đã có để đảm bảo tính nhất quán.
const minimalistTheme = createTheme({
    palette: {
        primary: {
            main: 'rgb(39, 84, 138)', // Xanh dương nhẹ, hiện đại
        },
        secondary: {
            main: '#E5E7EB', // Xám nhạt cho nền phụ
            contrastText: '#1F2937',
        },
        background: {
            default: '#F9FAFB', // Nền chính rất nhạt
            paper: '#FFFFFF',
        },
        text: {
            primary: '#111827',
            secondary: '#6B7280',
        },
        divider: '#E5E7EB',
        success: { main: '#10B981' },
        error: { main: '#EF4444' },
        warning: { main: '#F59E0B' }
    },
    typography: {
        fontFamily: "'Inter', sans-serif",
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: { borderRadius: 8 },
                containedPrimary: {
                    boxShadow: 'none',
                    '&:hover': { boxShadow: 'none', backgroundColor: alpha('rgb(39, 84, 138)', 0.9) }
                },
            }
        },
        MuiPaper: {
            styleOverrides: {
                // Áp dụng cho tất cả Paper components
                root: {
                    border: '1px solid #E5E7EB',
                },
                // Ghi đè style cho từng mức elevation cụ thể
                elevation1: {
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                },
                elevation2: {
                     boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
                },
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    transition: 'box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out',
                    '&:hover': {
                        boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.08)',
                        transform: 'translateY(-4px)'
                    }
                }
            }
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: { backgroundColor: '#1F2937', borderRadius: 4, fontSize: '0.75rem' }
            }
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    fontWeight: 500,
                }
            }
        }
    }
});

/**
 * Trang quản lý thiệp mời - phiên bản nâng cấp.
 * Sử dụng ThemeProvider và CssBaseline để áp dụng phong cách thiết kế tối giản.
 * Loại bỏ Header và Footer không cần thiết để tập trung vào nội dung chính.
 */
const InvitationManagementPage = () => {
  return (
    <ThemeProvider theme={minimalistTheme}>
      <CssBaseline />
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
        <InvitationManagementContent />
      </Box>
    </ThemeProvider>
  );
};

export default InvitationManagementPage;