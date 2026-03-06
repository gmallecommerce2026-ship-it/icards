// src/Pages/InvitationDesign/Components/Content/DesignContent.js
import React, { useState, useRef, useEffect, useCallback, useLayoutEffect, useMemo } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import api from "../../../../services/api";
import {
    Checkbox, Box, Typography, Card, CardContent, CardMedia, Grid, IconButton, Select, MenuItem, InputLabel, FormControl, Slider, Tooltip, Divider, Menu, useMediaQuery, List, ListItem, ListItemText, ListItemIcon, CircularProgress, Paper, ButtonGroup, ListItemButton, InputAdornment,
    ToggleButtonGroup, ToggleButton,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import DraggableSidebarItem from "./DraggableSidebarItem"
import { useDndMonitor } from '@dnd-kit/core';
import { styled, useTheme, alpha } from '@mui/material/styles';
import CustomEditor from '../../../Components/CustomEditor.js'; 
import {
    TextFields as TextFieldsIcon,
    Delete as DeleteIcon,
    ZoomIn as ZoomInIcon,
    ZoomOut as ZoomOutIcon,
    FlipToFront as FlipToFrontIcon,
    FlipToBack as FlipToBackIcon,
    Opacity as OpacityIcon,
    CloudUpload as CloudUploadIcon,
    PhotoLibrary as PhotoLibraryIcon,
    Image as ImageIcon,
    FilterVintage as FilterVintageIcon,
    CropFree as CropFreeIcon,
    Download as DownloadIcon,
    ArrowBack as ArrowBackIcon,
    NavigateNext as NavigateNextIcon,
    Style as StyleIcon,
    Category as CategoryIcon,
    Label as LabelIcon,
    FileCopy as FileCopyIcon,
    AddCircleOutline as AddCircleOutlineIcon,
    Menu as MenuIcon,
    Undo as UndoIcon,
    Redo as RedoIcon,
    ContentCopy as ContentCopyIcon,
    ContentPaste as ContentPasteIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Lock as LockIcon,
    LockOpen as LockOpenIcon,
    FormatBold as FormatBoldIcon,
    FormatItalic as FormatItalicIcon,
    FormatUnderlined as FormatUnderlinedIcon,
    FormatAlignCenter as FormatAlignCenterIcon,
    FormatAlignLeft as FormatAlignLeftIcon,
    FormatAlignRight as FormatAlignRightIcon,
    Add as AddIcon,
    Palette as PaletteIcon,
    CenterFocusStrong as CenterFocusStrongIcon,
    DataObject as DataObjectIcon,
    CalendarToday as CalendarTodayIcon,
    Edit as EditIcon,
    People as PeopleIcon,
    DragIndicator as DragIndicatorIcon,
    Favorite as HeartIcon,
    Phone as PhoneIcon,
    ViewModule as ViewModuleIcon, // For Block Management
    ViewCarousel as ViewCarouselIcon,
    CheckBox as CheckBoxIcon,
    BrokenImage as BrokenImageIcon,
    PlayCircleFilledWhite as PlayIcon,
    Brush,
    Grid3x3 as GridOnIcon, 
    GridOff as GridOffIcon
} from '@mui/icons-material';
import { useDroppable } from '@dnd-kit/core';
import JSZip from 'jszip';
import jsPDF from 'jspdf';
import { toast } from 'react-toastify';
import { showSuccessToast, showErrorToast, handlePromiseToast } from '../../../../Utils/toastHelper';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import _ from 'lodash';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core';
import EnvelopeFlow from './EnvelopeFlow';
import { MOCK_ENVELOPE_TEMPLATES } from './mockEnvelopeData';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Helmet } from 'react-helmet';
import './EventSettingsPreview.css';
import { SketchPicker } from 'react-color';
import { Save } from 'lucide-react';
import "./customeditor.css"
const EDIT_SCALE = 1;
const MAX_FILE_SIZE_MB = 100;
// Helper function to trigger file download
const triggerDownload = (uri, filename) => {
    const link = document.createElement('a');
    link.href = uri;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Helper function for word wrapping on canvas
const wrapText = (context, text, x, y, maxWidth, lineHeight, textAlign) => {
    const words = text.split(' ');
    let line = '';
    let testLine;
    let metrics;
    let testWidth;

    for (let n = 0; n < words.length; n++) {
        testLine = line + words[n] + ' ';
        metrics = context.measureText(testLine);
        testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            let lineX = x;
            if (textAlign === 'center') {
                lineX = x + (maxWidth - context.measureText(line).width) / 2;
            } else if (textAlign === 'right') {
                lineX = x + (maxWidth - context.measureText(line).width);
            }
            context.fillText(line, lineX, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    let lineX = x;
    if (textAlign === 'center') {
        lineX = x + (maxWidth - context.measureText(line).width) / 2;
    } else if (textAlign === 'right') {
        lineX = x + (maxWidth - context.measureText(line).width);
    }
    context.fillText(line, lineX, y);
};

const DndCursorManager = () => {
    useDndMonitor({
        onDragStart: () => {
            document.body.style.cursor = 'grabbing';
        },
        onDragEnd: () => {
            document.body.style.cursor = '';
        },
    });

    return null; // Component này không render gì cả
};
const FloatingSelectionBar = ({ count, onClear, onDelete, isDeleting }) => {
    if (count === 0) return null;
    
    return (
        <Paper elevation={4} sx={{
            position: 'fixed',
            bottom: 24,
            left: 24,
            zIndex: 9999,
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            borderRadius: 2,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'primary.main',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
        }}>
            <Typography variant="body2" fontWeight="600" color="text.primary">
                Đã chọn {count} ảnh
            </Typography>
            <Button size="small" variant="outlined" onClick={onClear}>
                Bỏ chọn tất cả
            </Button>
            <Button 
                size="small" 
                variant="contained" 
                color="error" 
                onClick={onDelete} 
                disabled={isDeleting} 
                startIcon={<DeleteIcon />}
            >
                {isDeleting ? 'Đang xóa...' : 'Xóa ảnh'}
            </Button>
        </Paper>
    );
};
const RsvpPreview = ({ settings, onSelectField, selectedFieldKey }) => (
    <Box className="section-container" sx={{ textAlign: 'center' }}>
        <SectionHeader
            title={settings.rsvpTitle || 'Xác Nhận Tham Dự'}
            subtitle={settings.rsvpSubtitle || 'Sự hiện diện của bạn là niềm vinh hạnh cho gia đình chúng tôi.'}
            onSelectField={onSelectField}
            selectedFieldKey={selectedFieldKey}
            titleKey="rsvpTitle"
            subtitleKey="rsvpSubtitle"
            titleStyle={settings.rsvpTitleStyle}
            subtitleStyle={settings.rsvpSubtitleStyle}
        />
        <Button variant="contained" size="large" sx={{ mt: 2 }}>
            Xác Nhận Tham Dự
        </Button>
    </Box>
);
const IntegratedSidebarPanel = ({
    pages,
    currentPageId,
    currentItems,
    selectedItemId,
    currentBackgroundColor,
    currentBackgroundImage,
    onSelectPage,
    onDeletePage,
    onReorderPages,
    onAddPage,
    onSelectItem,
    onToggleVisibility,
    onToggleLock,
    onBackgroundColorChange,
    onBackgroundImageChange,
    onRemoveBackgroundImage,
    onReorderItems, // New prop for layer reordering
}) => {
    const fileInputRef = useRef(null);
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );
    const handleDragEndPages = (event) => {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            onReorderPages(active.id, over.id);
        }
    };
    const handleDragEndItems = (event) => {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            onReorderItems(active.id, over.id);
        }
    };
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            onBackgroundImageChange(file);
        }
        if (event.currentTarget) {
           event.currentTarget.value = null;
        }
    };
    return (
        <Box sx={{ px: 2, pt: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>Quản lý Trang</Typography>
            <Box sx={{ flexShrink: 0 }}>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndPages}>
                    <SortableContext items={pages.map(p => p.id)} strategy={verticalListSortingStrategy}>
                        <Box sx={{ maxHeight: 'calc(40vh - 120px)', overflowY: 'auto' }}>
                            {pages.map((page) => (
                                <SortablePageItem
                                    key={page.id}
                                    id={page.id}
                                    page={page}
                                    isSelected={page.id === currentPageId}
                                    onSelect={onSelectPage}
                                    onRemove={onDeletePage}
                                />
                            ))}
                        </Box>
                    </SortableContext>
                </DndContext>
                <Button
                    variant="contained"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={onAddPage}
                    fullWidth
                    sx={{ mt: 1, mb: 2 }}
                    disabled={pages.length === 0}
                >
                    Thêm trang mới
                </Button>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h6" gutterBottom>Thuộc tính Trang</Typography>
            {currentPageId && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                    {!currentBackgroundImage && (
                        <TextField
                            label="Màu nền"
                            type="color"
                            value={currentBackgroundColor}
                            onChange={(e) => onBackgroundColorChange(e.target.value)}
                            fullWidth
                            size="small"
                            variant="outlined"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PaletteIcon />
                                    </InputAdornment>
                                ),
                                sx: { '& input[type=color]': { height: '40px', padding: '4px' } }
                            }}
                        />
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />
                    <Button
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        onClick={() => fileInputRef.current.click()}
                    >
                        {currentBackgroundImage ? 'Đổi ảnh nền' : 'Tải ảnh nền'}
                    </Button>
                    
                    {/* Hiển thị nút xóa ảnh nền nếu đang có ảnh */}
                    {currentBackgroundImage && (
                        <Button
                            variant="text"
                            color="error"
                            size="small"
                            onClick={onRemoveBackgroundImage}
                        >
                            Xóa ảnh nền
                        </Button>
                    )}
                </Box>
            )}
            <Typography variant="h6" gutterBottom>Các Lớp</Typography>
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                {currentPageId && currentItems.length > 0 ? (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndItems}>
                        <SortableContext items={currentItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
                             <LayersPanel
                                items={currentItems}
                                selectedItemId={selectedItemId}
                                onSelectItem={onSelectItem}
                                onToggleVisibility={onToggleVisibility}
                                onToggleLock={onToggleLock}
                            />
                        </SortableContext>
                    </DndContext>
                ) : (
                    <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mt: 2 }}>
                        Trang này không có đối tượng nào.
                    </Typography>
                )}
            </Box>
        </Box>
    );
};
const AVAILABLE_BLOCKS = {
    BANNER_CAROUSEL: { key: 'bannerImages', label: 'Banner Carousel', description: 'Trình chiếu slide ảnh nổi bật ở vị trí đầu trang.', icon: <ViewCarouselIcon />, required: true, isList: true },
    EVENT_DESCRIPTION: { key: 'eventDescription', label: 'Câu chuyện / Lời mời', description: 'Đoạn văn bản ngắn gửi gắm cảm xúc và lời mời chân thành.', icon: <TextFieldsIcon /> },
    COUPLE_INFO: { key: 'coupleInfo', label: 'Thông tin Cô dâu & Chú rể', description: 'Hình ảnh, tên và đôi nét giới thiệu về hai nhân vật chính.', icon: <HeartIcon />, relatedFields: ['groomName', 'groomInfo', 'groomImageUrl', 'brideName', 'brideInfo', 'brideImageUrl'], titleKey: 'coupleTitle', subtitleKey: 'coupleSubtitle' },
    PARTICIPANTS: { key: 'participants', label: 'Thành viên tham gia', description: 'Giới thiệu những người quan trọng (Bố mẹ, phù dâu, phù rể...).', icon: <PeopleIcon />, isList: true, titleKey: 'participantsTitle' },
    EVENT_SCHEDULE: { key: 'events', label: 'Lịch trình sự kiện', description: 'Thời gian và địa điểm cụ thể của các hoạt động trong sự kiện.', icon: <CalendarTodayIcon />, isList: true, titleKey: 'eventsTitle' },
    COUNTDOWN: { key: 'eventDate', label: 'Đếm ngược thời gian', description: 'Đồng hồ đếm ngược sinh động đến ngày tổ chức.', icon: <CalendarTodayIcon />, titleKey: 'countdownTitle' },
    LOVE_STORY: { key: 'loveStory', label: 'Chuyện tình yêu', description: 'Dòng thời gian (Timeline) kể lại các cột mốc đáng nhớ.', icon: <FilterVintageIcon />, isList: true, titleKey: 'loveStoryTitle' },
    GALLERY: { key: 'galleryImages', label: 'Bộ sưu tập ảnh', description: 'Lưới hình ảnh (Grid) trưng bày những khoảnh khắc đẹp nhất.', icon: <PhotoLibraryIcon />, isList: true, titleKey: 'galleryTitle' },
    VIDEO: { key: 'videoUrl', label: 'Video sự kiện', description: 'Nhúng video trực tiếp từ YouTube để khách mời cùng xem.', icon: <ImageIcon />, titleKey: 'videoTitle' },
    CONTACT_INFO: { key: 'contactInfo', label: 'Thông tin liên hệ', description: 'Số điện thoại hỗ trợ của đại diện nhà trai và nhà gái.', icon: <PhoneIcon />, relatedFields: ['contactGroom', 'contactBride'], titleKey: 'contactTitle' },
    QR_CODES: { key: 'qrCodes', label: 'Mã QR mừng cưới', description: 'Mã QR tài khoản ngân hàng để khách mời tiện gửi quà mừng.', icon: <DataObjectIcon />, isList: true, titleKey: 'qrCodeTitle' },
    RSVP: { key: 'rsvp', label: 'Xác Nhận Tham Dự (RSVP)', description: 'Biểu mẫu giúp khách mời phản hồi khả năng tham dự.', icon: <CheckBoxIcon />, titleKey: 'rsvpTitle', subtitleKey: 'rsvpSubtitle' },
    CUSTOM_HTML: { key: 'customHtmlContent', label: 'Khối tuỳ chỉnh', description: 'Tự do sáng tạo nội dung với trình soạn thảo văn bản đa dạng.', icon: <Brush />, titleKey: 'customHtmlTitle' },
};
const SortableBlockWrapper = ({ id, blockType, children, onSelectBlock, onRemoveBlock, isSelected }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const isBanner = blockType === 'BANNER_CAROUSEL';
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        border: `2px dashed ${isSelected ? '#3B82F6' : 'transparent'}`,
        backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
        borderRadius: isBanner ? '0px' : '12px',
        position: 'relative',
        padding: isBanner ? '0' : '16px',
        marginBottom: '16px',
    };
    const blockConfig = AVAILABLE_BLOCKS[blockType] || {};
    const isRemovable = !blockConfig.required;
    const isListBlock = blockConfig.isList;
    return (
        <Box ref={setNodeRef} style={style}>
            <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10, display: 'flex', gap: 0.5, alignItems: 'center', backgroundColor: 'white', borderRadius: '20px', padding: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                {isRemovable && (
                    <Tooltip title="Xóa khối này">
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); onRemoveBlock(id); }}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
                <Tooltip title={isListBlock ? "Chỉnh sửa danh sách" : "Chọn để chỉnh sửa"}>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); onSelectBlock(blockType); }}>
                        <EditIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Kéo để di chuyển">
                    <Box {...attributes} {...listeners} sx={{ cursor: 'grab', display: 'flex', alignItems: 'center' }}>
                        <DragIndicatorIcon fontSize="small" />
                    </Box>
                </Tooltip>
            </Box>
            {children}
        </Box>
    );
};
const EditableWrapper = ({ fieldKey, onSelectField, selectedFieldKey, children, sx = {}, itemData, onDeleteItem }) => {
    const isSelected = selectedFieldKey === fieldKey;
    const wrapperSx = {
        border: `2px dashed ${isSelected ? '#3B82F6' : 'transparent'}`,
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        position: 'relative',
        p: 1,
        ...sx,
        '&:hover': {
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
        },
        '& .delete-button': {
            opacity: 0,
        },
        '&:hover .delete-button': {
            opacity: 1,
        },
    };

    return (
        <Box
            onClick={(e) => { e.stopPropagation(); onSelectField(fieldKey); }}
            sx={wrapperSx}
        >
            {children}
            {isSelected && !onDeleteItem && <EditIcon sx={{ position: 'absolute', top: 8, right: 8, color: 'primary.main', fontSize: 16, background: 'white', borderRadius: '50%', p: 0.5, zIndex: 10 }} />}
            {onDeleteItem && (
                 <Tooltip title="Xóa mục này">
                    <IconButton
                        className="delete-button"
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteItem(itemData);
                        }}
                        sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            zIndex: 11,
                            bgcolor: 'white',
                            transition: 'opacity 0.2s',
                            '&:hover': { bgcolor: 'error.light', color: 'white' }
                        }}
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )}
        </Box>
    );
};
const SectionHeader = ({ title, subtitle, onSelectField, selectedFieldKey, titleKey, subtitleKey, titleStyle, subtitleStyle }) => (
    <Box className="modern-section-header" sx={{ mb: 4 }}>
        <EditableWrapper fieldKey={titleKey} onSelectField={onSelectField} selectedFieldKey={selectedFieldKey}>
            <Typography variant="h2" className="section-title" sx={titleStyle}>{title}</Typography>
        </EditableWrapper>
        {subtitle && (
            <EditableWrapper fieldKey={subtitleKey} onSelectField={onSelectField} selectedFieldKey={selectedFieldKey}>
                <Typography variant="body1" className="section-subtitle" sx={subtitleStyle}>{subtitle}</Typography>
            </EditableWrapper>
        )}
    </Box>
);
const BannerCarouselPreview = ({ settings, onSelectField, selectedFieldKey }) => {
    const images = settings.bannerImages || [];
    return (
        <EditableWrapper fieldKey="bannerImages" onSelectField={onSelectField} selectedFieldKey={selectedFieldKey} sx={{ p: 0, border: 'none' }}>
            <Box className="modern-banner" sx={{ height: '300px', position: 'relative' }}>
                {(images && images.length > 0) ? (
                    <Box
                        sx={{
                            width: '100%',
                            height: '100%',
                            backgroundImage: `url(${images[0].url || URL.createObjectURL(images[0].file)})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        <Box className="modern-slide-overlay" />
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', bgcolor: 'grey.200' }}>
                        <Typography color="text.secondary">Chưa có ảnh banner. Nhấp để thêm.</Typography>
                    </Box>
                )}
            </Box>
        </EditableWrapper>
    );
};
const EventDescriptionPreview = ({ settings, onSelectField, selectedFieldKey }) => (
    <Box className="section-container event-description">
        <EditableWrapper fieldKey="eventDescription" onSelectField={onSelectField} selectedFieldKey={selectedFieldKey}>
            <Box className="content-wrapper-narrow">
                <Typography className="event-description-text" sx={{ ...settings.eventDescriptionStyle, minHeight: '50px' }}>
                    {settings.eventDescription || "Nhấp để thêm câu chuyện của bạn..."}
                </Typography>
            </Box>
        </EditableWrapper>
    </Box>
);
const CoupleInfoPreview = ({ settings, onSelectField, selectedFieldKey, onUpdateSetting }) => {
    // State cục bộ để biết đang edit ảnh nào ('groom' hoặc 'bride')
    const [editingTarget, setEditingTarget] = useState(null); 

    // Hàm update vị trí (Pan/Zoom)
    const handleUpdatePos = (type, newPos) => {
         const key = `${type}ImagePosition`;
         onUpdateSetting(key, newPos);
    };

    // Hàm update ảnh (Thay file mới)
    const handleImageChange = (type, file) => {
        const key = `${type}ImageUrl`; // Ví dụ: groomImageUrl
        onUpdateSetting(key, file);    // Gọi hàm update của cha để lưu File object
    };

    return (
        <Box className="section-container">
            <SectionHeader
                title={settings.coupleTitle || 'Cô Dâu & Chú Rể'}
                subtitle={settings.coupleSubtitle || '... và hai trái tim cùng chung một nhịp đập ...'}
                onSelectField={onSelectField}
                selectedFieldKey={selectedFieldKey}
                titleKey="coupleTitle"
                subtitleKey="coupleSubtitle"
                titleStyle={settings.coupleTitleStyle}
                subtitleStyle={settings.coupleSubtitleStyle}
            />
            <Box className="modern-couple-container">
                {/* --- CHÚ RỂ --- */}
                <Box className="modern-couple-card">
                    {/* Bọc EditableWrapper để vẫn giữ logic highlight field nếu cần, 
                        nhưng ImageCropper sẽ xử lý sự kiện click nội bộ */}
                    <EditableWrapper fieldKey="groomImageUrl" onSelectField={onSelectField} selectedFieldKey={selectedFieldKey} sx={{ border: 'none', p: 0 }}>
                        <ImageCropper 
                            imageSrc={settings.groomImageUrl instanceof File ? URL.createObjectURL(settings.groomImageUrl) : (settings.groomImageUrl || 'https://placehold.co/180x180/EBF1FB/B0C7EE?text=Ảnh+CR')}
                            position={settings.groomImagePosition}
                            isEditing={editingTarget === 'groom'}
                            onToggleEdit={() => setEditingTarget(editingTarget === 'groom' ? null : 'groom')}
                            onUpdatePosition={(newPos) => handleUpdatePos('groom', newPos)}
                            onImageChange={(file) => handleImageChange('groom', file)} // Truyền hàm đổi ảnh
                        />
                    </EditableWrapper>

                    <EditableWrapper fieldKey="groomName" onSelectField={onSelectField} selectedFieldKey={selectedFieldKey}>
                        <Typography className="couple-name" sx={{ ...settings.groomNameStyle, minHeight: '30px' }}>{settings.groomName || 'Tên chú rể'}</Typography>
                    </EditableWrapper>
                    <EditableWrapper fieldKey="groomInfo" onSelectField={onSelectField} selectedFieldKey={selectedFieldKey}>
                        <Typography className="couple-info" sx={{ ...settings.groomInfoStyle, minHeight: '40px' }}>{settings.groomInfo || 'Thông tin chú rể'}</Typography>
                    </EditableWrapper>
                </Box>

                <Box className="modern-separator"><Box className="heart-wrapper"><HeartIcon sx={{ color: 'var(--color-primary)' }} /></Box></Box>

                {/* --- CÔ DÂU --- */}
                <Box className="modern-couple-card">
                    <EditableWrapper fieldKey="brideImageUrl" onSelectField={onSelectField} selectedFieldKey={selectedFieldKey} sx={{ border: 'none', p: 0 }}>
                         <ImageCropper 
                            imageSrc={settings.brideImageUrl instanceof File ? URL.createObjectURL(settings.brideImageUrl) : (settings.brideImageUrl || 'https://placehold.co/180x180/EBF1FB/B0C7EE?text=Ảnh+CD')}
                            position={settings.brideImagePosition}
                            isEditing={editingTarget === 'bride'}
                            onToggleEdit={() => setEditingTarget(editingTarget === 'bride' ? null : 'bride')}
                            onUpdatePosition={(newPos) => handleUpdatePos('bride', newPos)}
                            onImageChange={(file) => handleImageChange('bride', file)} // Truyền hàm đổi ảnh
                        />
                    </EditableWrapper>

                    <EditableWrapper fieldKey="brideName" onSelectField={onSelectField} selectedFieldKey={selectedFieldKey}>
                        <Typography className="couple-name" sx={{ ...settings.brideNameStyle, minHeight: '30px' }}>{settings.brideName || 'Tên cô dâu'}</Typography>
                    </EditableWrapper>
                    <EditableWrapper fieldKey="brideInfo" onSelectField={onSelectField} selectedFieldKey={selectedFieldKey}>
                        <Typography className="couple-info" sx={{ ...settings.brideInfoStyle, minHeight: '40px' }}>{settings.brideInfo || 'Thông tin cô dâu'}</Typography>
                    </EditableWrapper>
                </Box>
            </Box>
        </Box>
    );
};
const ParticipantsPreview = ({ settings, onEditItem, onSelectField, selectedFieldKey }) => (
    <Box className="section-container">
        <SectionHeader
            title={settings.participantsTitle || "Thành Viên Tham Gia"}
            onSelectField={onSelectField}
            selectedFieldKey={selectedFieldKey}
            titleKey="participantsTitle"
            titleStyle={settings.participantsTitleStyle}
        />
        <Box className="participants-grid">
            {(settings.participants && settings.participants.length > 0) && settings.participants.map((p) => (
                <Box key={p.id} className="participant-card clickable-card" onClick={() => onEditItem({ type: 'participants', data: p })}>
                    <img src={p.imageUrl instanceof File ? URL.createObjectURL(p.imageUrl) : (p.imageUrl || 'https://placehold.co/100x100/EEE/31343C?text=Ảnh')} alt={p.title} className="participant-image" />
                    <Box className="participant-info">
                        <Typography variant="h3" className="participant-title">{p.title}</Typography>
                        <Typography className="participant-content">{p.content}</Typography>
                    </Box>
                </Box>
            ))}
            <Box className="add-new-card" onClick={() => onEditItem({ type: 'participants', data: { id: uuidv4(), title: '', content: '', imageUrl: null }, isNew: true })}>
                <AddCircleOutlineIcon />
                <Typography>Thêm thành viên</Typography>
            </Box>
        </Box>
    </Box>
);
const EventSchedulePreview = ({ settings, onEditItem, onSelectField, selectedFieldKey, isMapLoaded, mapLoadError }) => (
    <Box className="section-container">
        <SectionHeader
            title={settings.eventsTitle || "Sự Kiện Cưới"}
            onSelectField={onSelectField}
            selectedFieldKey={selectedFieldKey}
            titleKey="eventsTitle"
            titleStyle={settings.eventsTitleStyle}
        />
        <Box className="event-schedule-grid">
            {(settings.events && settings.events.length > 0) && settings.events.map((event) => (
                <Box key={event.id} className="event-card clickable-card" onClick={() => onEditItem({ type: 'events', data: event })}>
                    <Box className="event-card-image-wrapper">
                        <img src={event.imageUrl instanceof File ? URL.createObjectURL(event.imageUrl) : (event.imageUrl || 'https://placehold.co/400x200/EEE/31343C?text=Event')} alt={event.title} />
                    </Box>
                    <Box className="event-card-content">
                        <Typography variant="h3" className="event-card-title">{event.title}</Typography>
                        <Typography>{event.time} | {event.date}</Typography>
                        <Typography>{event.address}</Typography>
                    </Box>
                </Box>
            ))}
            <Box className="add-new-card" onClick={() => onEditItem({ type: 'events', data: { id: uuidv4(), title: '', date: new Date().toISOString().split('T')[0], time: '12:00', address: '', mapUrl: '', imageUrl: '', dressCode: [] }, isNew: true })}>
                <AddCircleOutlineIcon />
                <Typography>Thêm sự kiện</Typography>
            </Box>
        </Box>
    </Box>
);
const LoveStoryPreview = ({ settings, onEditItem, onSelectField, selectedFieldKey }) => (
    <Box className="section-container">
        <SectionHeader
            title={settings.loveStoryTitle || "Chuyện Tình Yêu"}
            onSelectField={onSelectField}
            selectedFieldKey={selectedFieldKey}
            titleKey="loveStoryTitle"
            titleStyle={settings.loveStoryTitleStyle}
        />
        <Box className="love-story-timeline">
            {(settings.loveStory && settings.loveStory.length > 0) ? settings.loveStory.map((story, index) => (
                <Box key={story.id} className={`story-item ${index % 2 === 0 ? 'left' : 'right'}`} onClick={() => onEditItem({ type: 'loveStory', data: story })}>
                    <Box className="story-content clickable-card">
                        
                        {/* === BẮT ĐẦU SỬA: Bọc ảnh trong story-image-wrapper === */}
                        {story.imageUrl && (
                            <Box className="story-image-wrapper">
                                <img 
                                    src={story.imageUrl instanceof File ? URL.createObjectURL(story.imageUrl) : story.imageUrl} 
                                    alt={story.title || "Cột mốc"} 
                                    className="story-image" 
                                    onClick={(e) => e.stopPropagation()} 
                                />
                            </Box>
                        )}
                        {/* === KẾT THÚC SỬA === */}

                        <Typography variant="h3" className="story-title">{story.title}</Typography>
                        <Typography className="story-date">{story.date}</Typography>
                        <Typography className="story-description">{story.description}</Typography>
                    </Box>
                </Box>
            )) : <Typography sx={{ textAlign: 'center', color: 'text.secondary' }}>Chưa có câu chuyện nào. Nhấp vào nút bên dưới để thêm.</Typography>}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
                variant="outlined"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() => onEditItem({ type: 'loveStory', data: { id: uuidv4(), title: '', date: '', description: '', imageUrl: null }, isNew: true })}
            >
                Thêm cột mốc
            </Button>
        </Box>
    </Box>
);
const ContactInfoPreview = ({ settings, onSelectField, selectedFieldKey }) => (
    <Box className="section-container">
        <SectionHeader
            title={settings.contactTitle || "Thông Tin Liên Hệ"}
            onSelectField={onSelectField}
            selectedFieldKey={selectedFieldKey}
            titleKey="contactTitle"
            titleStyle={settings.contactTitleStyle}
        />
        <Box className="modern-contact-section">
            <EditableWrapper fieldKey="contactGroom" onSelectField={onSelectField} selectedFieldKey={selectedFieldKey} sx={{ p: 0 }}>
                <Box className="modern-contact-card">
                    <Box className="contact-icon"><PhoneIcon /></Box>
                    <Box className="contact-info">
                        <Typography component="h4" sx={settings.contactCardHeaderStyle}>Nhà trai</Typography>
                        <Typography component="span" sx={settings.contactCardNameStyle}>{settings.groomName || 'Chú rể'}</Typography>
                        <p style={settings.contactGroomStyle}>{settings.contactGroom || 'SĐT Chú rể'}</p>
                    </Box>
                </Box>
            </EditableWrapper>
            <EditableWrapper fieldKey="contactBride" onSelectField={onSelectField} selectedFieldKey={selectedFieldKey} sx={{ p: 0 }}>
                <Box className="modern-contact-card">
                    <Box className="contact-icon"><PhoneIcon /></Box>
                    <Box className="contact-info">
                        <Typography component="h4" sx={settings.contactCardHeaderStyle}>Nhà gái</Typography>
                        <Typography component="span" sx={settings.contactCardNameStyle}>{settings.brideName || 'Cô dâu'}</Typography>
                        <p style={settings.contactBrideStyle}>{settings.contactBride || 'SĐT Cô dâu'}</p>
                    </Box>
                </Box>
            </EditableWrapper>
        </Box>
    </Box>
);
const CustomHtmlPreview = ({ settings, onSelectField, selectedFieldKey }) => (
    <Box className="section-container">
        <SectionHeader
            title={settings.customHtmlTitle || 'Nội dung tùy chỉnh'}
            onSelectField={onSelectField}
            selectedFieldKey={selectedFieldKey}
            titleKey="customHtmlTitle"
        />
        <EditableWrapper
            fieldKey="customHtmlContent"
            onSelectField={onSelectField}
            selectedFieldKey={selectedFieldKey}
        >
            <Box
                className="tiptap-content1" 
                dangerouslySetInnerHTML={{ __html: settings.customHtmlContent || '<p>Nhấp để thêm nội dung của bạn...</p>' }}
                sx={{
                    padding: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    minHeight: '100px'
                }}
            />
        </EditableWrapper>
    </Box>
);
const GalleryPreview = ({ settings, onSelectField, selectedFieldKey }) => (
    <EditableWrapper fieldKey="galleryImages" onSelectField={onSelectField} selectedFieldKey={selectedFieldKey} sx={{ p: 0, border: 'none', '&:hover': { backgroundColor: 'transparent' } }}>
        <Box className="section-container">
            <SectionHeader
                title={settings.galleryTitle || "Bộ Sưu Tập Ảnh"}
                onSelectField={onSelectField}
                selectedFieldKey={selectedFieldKey}
                titleKey="galleryTitle"
            />
            <Box className="modern-gallery" sx={{ columnCount: settings.galleryImages && settings.galleryImages.length > 0 ? 4 : 0  + "!important" }}>
                {(settings.galleryImages && settings.galleryImages.length > 0) ? settings.galleryImages.map((img, index) => (
                    <img key={index} src={img instanceof File ? URL.createObjectURL(img) : img} alt={`Gallery ${index}`} />
                )) : <Typography sx={{ textAlign: 'center', color: 'text.secondary' }}>Chưa có ảnh nào. Nhấp vào biểu tượng bút chì ở trên để thêm.</Typography>}
            </Box>
        </Box>
    </EditableWrapper>
);
const getYouTubeID = (url) => {
    if (!url) return null;
    // Regex bắt các format: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};
const VideoPreview = ({ settings, onSelectField, selectedFieldKey }) => {
    const videoId = getYouTubeID(settings.videoUrl);

    return (
        <EditableWrapper 
            fieldKey="videoUrl" 
            onSelectField={onSelectField} 
            selectedFieldKey={selectedFieldKey} 
            sx={{ p: 0, border: 'none', '&:hover': { backgroundColor: 'transparent' } }}
        >
            <Box className="section-container">
                <SectionHeader
                    title={settings.videoTitle || "Video Sự Kiện"}
                    onSelectField={onSelectField}
                    selectedFieldKey={selectedFieldKey}
                    titleKey="videoTitle"
                    titleStyle={settings.videoTitleStyle}
                />
                
                {/* Khu vực hiển thị Video Preview */}
                <Box className="video-wrapper" sx={{ 
                    position: 'relative', 
                    width: '100%', 
                    aspectRatio: '16/9', // Giữ tỷ lệ chuẩn video
                    backgroundColor: '#000', // Nền đen đề phòng ảnh lỗi hoặc load chậm
                    borderRadius: 2,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mt: 1
                }}>
                    {videoId ? (
                        <>
                            {/* Ảnh Thumbnail từ YouTube */}
                            <img 
                                src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} 
                                alt="Video Thumbnail" 
                                style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover',
                                    opacity: 0.8 // Làm tối nhẹ để icon Play nổi bật
                                }} 
                            />
                            
                            {/* Nút Play giả lập */}
                            <Box sx={{ 
                                position: 'absolute', 
                                top: '50%', 
                                left: '50%', 
                                transform: 'translate(-50%, -50%)',
                                zIndex: 2
                            }}>
                                <PlayIcon sx={{ fontSize: 64, color: '#fff', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
                            </Box>
                        </>
                    ) : (
                        // Trạng thái chưa có video hoặc link lỗi
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            height: '100%', 
                            bgcolor: 'grey.200',
                            color: 'text.secondary',
                            width: '100%',
                            p: 2
                        }}>
                            <ImageIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                            <Typography sx={{ textAlign: 'center' }}>
                                {settings.videoUrl ? "URL không hợp lệ" : "Chưa có video. Nhấp vào đây để thêm."}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </EditableWrapper>
    );
};
const QrCodesPreview = ({ settings, onSelectField, selectedFieldKey }) => (
    <EditableWrapper fieldKey="qrCodes" onSelectField={onSelectField} selectedFieldKey={selectedFieldKey} sx={{ p: 0, border: 'none', '&:hover': { backgroundColor: 'transparent' } }}>
        <Box className="section-container">
            <SectionHeader
                title={settings.qrCodeTitle || "Mã QR Mừng Cưới"}
                onSelectField={onSelectField}
                selectedFieldKey={selectedFieldKey}
                titleKey="qrCodeTitle"
            />
            {/* Sử dụng Flexbox để dàn trang đẹp hơn */}
            <Box className="modern-qr-container" sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 4, mt: 2 }}>
                {(settings.qrCodes && settings.qrCodes.length > 0) ? settings.qrCodes.map((qr, index) => (
                    <Box 
                        key={index} 
                        sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            maxWidth: '200px' // Giới hạn chiều rộng để không bị vỡ layout
                        }}
                    >
                        {/* HIỂN THỊ TIÊU ĐỀ Ở TRÊN (Thay vì ở dưới) */}
                        {qr.title && (
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    mb: 1.5, // Margin bottom để tách biệt với ảnh
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    color: 'var(--color-primary, #3B82F6)', // Dùng màu theme hoặc mặc định
                                    textAlign: 'center',
                                    lineHeight: 1.3
                                }}
                            >
                                {qr.title}
                            </Typography>
                        )}

                        {/* Hình ảnh QR Code được bo góc và đổ bóng nhẹ */}
                        <Box sx={{
                            p: 1,
                            bgcolor: 'white',
                            borderRadius: 2,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'translateY(-2px)' }
                        }}>
                            <img 
                                src={qr.url instanceof File ? URL.createObjectURL(qr.url) : qr.url} 
                                alt={qr.title} 
                                style={{ 
                                    display: 'block',
                                    width: '100%', 
                                    height: 'auto',
                                    maxWidth: '180px', // Đảm bảo ảnh QR không quá to
                                    borderRadius: '4px'
                                }} 
                            />
                        </Box>
                    </Box>
                )) : (
                    <Typography sx={{ textAlign: 'center', color: 'text.secondary', width: '100%', py: 4 }}>
                        Chưa có mã QR nào. Nhấp vào biểu tượng bút chì ở trên để thêm.
                    </Typography>
                )}
            </Box>
        </Box>
    </EditableWrapper>
);
const CountdownPreview = ({ settings, onSelectField, selectedFieldKey }) => {
    const calculateTimeLeft = useCallback(() => {
        const targetDate = settings.eventDate;
        if (!targetDate) return null;
        const difference = +new Date(targetDate) - +new Date();
        if (difference <= 0) return null;
        return {
            Ngày: Math.floor(difference / (1000 * 60 * 60 * 24)),
            Giờ: Math.floor((difference / (1000 * 60 * 60)) % 24),
            Phút: Math.floor((difference / 1000 / 60) % 60),
            Giây: Math.floor((difference / 1000) % 60),
        };
    }, [settings.eventDate]);
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
    useEffect(() => {
        setTimeLeft(calculateTimeLeft());
    }, [settings.eventDate, calculateTimeLeft]);
    useEffect(() => {
        if (!timeLeft) return;
        const timerId = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timerId);
    }, [timeLeft, calculateTimeLeft]);
    return (
        <EditableWrapper fieldKey="eventDate" onSelectField={onSelectField} selectedFieldKey={selectedFieldKey} sx={{ p: 0, border: 'none', '&:hover': { backgroundColor: 'transparent' } }}>
            <Box className="section-container">
                <SectionHeader
                    title={settings.countdownTitle || "Sự kiện trọng đại sẽ diễn ra trong"}
                    onSelectField={onSelectField}
                    selectedFieldKey={selectedFieldKey}
                    titleKey="countdownTitle"
                    titleStyle={settings.countdownTitleStyle}
                />
                {!settings.eventDate ? (
                    <Typography sx={{ textAlign: 'center', color: 'text.secondary' }}>Chưa đặt ngày sự kiện. Nhấp vào để đặt ngày.</Typography>
                ) : !timeLeft ? (
                    <Box className="countdown-ended" sx={{ textAlign: 'center' }}>
                        <Typography component="span" sx={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-primary)' }}>Sự kiện đã diễn ra!</Typography>
                    </Box>
                ) : (
                    <Box className="modern-countdown">
                        {Object.entries(timeLeft).map(([interval, value]) => (
                            <Box key={interval} className="modern-countdown-item">
                                <Box className="countdown-card">
                                    <Typography component="span" className="countdown-value" sx={settings.countdownValueStyle}>{String(value).padStart(2, '0')}</Typography>
                                    <Typography component="span" className="countdown-label" sx={settings.countdownLabelStyle}>{interval}</Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>
        </EditableWrapper>
    );
};
const blockComponentMap = {
    BANNER_CAROUSEL: BannerCarouselPreview,
    EVENT_DESCRIPTION: EventDescriptionPreview,
    COUPLE_INFO: CoupleInfoPreview,
    PARTICIPANTS: ParticipantsPreview,
    EVENT_SCHEDULE: EventSchedulePreview,
    LOVE_STORY: LoveStoryPreview,
    GALLERY: GalleryPreview,
    VIDEO: VideoPreview,
    CONTACT_INFO: ContactInfoPreview,
    QR_CODES: QrCodesPreview,
    COUNTDOWN: CountdownPreview,
    RSVP: RsvpPreview,
    CUSTOM_HTML: CustomHtmlPreview,
};
const EventSettingsPreview = ({ settings, onSelectField, selectedFieldKey, eventBlocks, onSelectBlock, onRemoveBlock, onReorderBlocks, onEditItem, onUpdateSetting }) => {
    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            onReorderBlocks(active.id, over.id);
        }
    };
    return (
        <Box className="event-settings-preview-container">
            <Box className="modern-content">
                <Box className="modern-container">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={eventBlocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                            {eventBlocks.map(block => {
                                const Component = blockComponentMap[block.type];
                                if (!Component) return null;
                                const isSelected = Object.values(AVAILABLE_BLOCKS).find(b => b.key === selectedFieldKey || b.relatedFields?.includes(selectedFieldKey) || b.titleKey === selectedFieldKey || b.subtitleKey === selectedFieldKey)?.key === AVAILABLE_BLOCKS[block.type].key;
                                return (
                                    <SortableBlockWrapper
                                        key={block.id}
                                        id={block.id}
                                        blockType={block.type}
                                        onSelectBlock={onSelectBlock}
                                        onRemoveBlock={onRemoveBlock}
                                        isSelected={isSelected}
                                    >
                                        <Component
                                            settings={settings}
                                            onSelectField={onSelectField}
                                            selectedFieldKey={selectedFieldKey}
                                            onEditItem={onEditItem} // Pass down the handler
                                            onUpdateSetting={onUpdateSetting}
                                        />
                                    </SortableBlockWrapper>
                                );
                            })}
                        </SortableContext>
                    </DndContext>
                </Box>
            </Box>
        </Box>
    );
};
const VisualSettingsEditor = ({ settings, onSelectField, selectedFieldKey, eventBlocks, onSelectBlock, onRemoveBlock, onReorderBlocks, onEditItem, onUpdateSetting }) => {
    return (
        <Box sx={{
            p: { xs: 1, md: 2 },
            bgcolor: 'background.paper', // Changed to paper for contrast
            mt: 4, // Margin top to separate from canvas
            borderRadius: 2
        }}>
            <EventSettingsPreview
                settings={settings}
                onSelectField={onSelectField}
                selectedFieldKey={selectedFieldKey}
                eventBlocks={eventBlocks}
                onSelectBlock={onSelectBlock}
                onRemoveBlock={onRemoveBlock}
                onReorderBlocks={onReorderBlocks}
                onEditItem={onEditItem}
                onUpdateSetting={onUpdateSetting}
            />
        </Box>
    );
};

const ImageCropper = ({ 
    imageSrc, 
    position, 
    onUpdatePosition, 
    onImageChange, // Hàm callback để thay ảnh
    isEditing, 
    onToggleEdit 
}) => {
    const imgRef = useRef(null);
    const fileInputRef = useRef(null);
    const isDragging = useRef(false);
    const startPos = useRef({ x: 0, y: 0 });

    // Lấy giá trị hiện tại hoặc mặc định
    const x = position?.x || 0;
    const y = position?.y || 0;
    const scale = position?.scale || 1;

    // --- XỬ LÝ KÉO THẢ (PAN) ---
    const handleMouseDown = (e) => {
        if (!isEditing) return;
        e.preventDefault();
        e.stopPropagation(); // Ngăn chặn nổi bọt sự kiện
        isDragging.current = true;
        startPos.current = { x: e.clientX - x, y: e.clientY - y };
        
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current) return;
        e.preventDefault();
        const newX = e.clientX - startPos.current.x;
        const newY = e.clientY - startPos.current.y;
        
        // Cập nhật vị trí realtime
        onUpdatePosition({ x: newX, y: newY, scale });
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };

    // --- XỬ LÝ ZOOM (SCALE) ---
    const handleZoomChange = (e, newValue) => {
        // Giữ nguyên vị trí x, y, chỉ thay đổi scale
        onUpdatePosition({ x, y, scale: newValue });
    };

    // --- XỬ LÝ ĐỔI ẢNH ---
    const handleTriggerUpload = (e) => {
        e.stopPropagation();
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && onImageChange) {
            onImageChange(file);
        }
        // Reset input để chọn lại cùng file nếu muốn
        e.target.value = null; 
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, width: '100%' }}>
            {/* Input file ẩn */}
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                style={{ display: 'none' }} 
            />

            <Box 
                className="modern-couple-image" 
                sx={{ 
                    position: 'relative', 
                    overflow: 'hidden', 
                    cursor: isEditing ? 'grab' : 'pointer',
                    border: isEditing ? '2px dashed #3B82F6' : 'none',
                    touchAction: 'none',
                    // Đảm bảo khung hình tròn hoặc vuông theo style cũ
                    borderRadius: '50%', // Hoặc bỏ dòng này nếu style class modern-couple-image đã có
                    width: '180px', // Kích thước cố định hoặc theo container
                    height: '180px',
                    '&:active': {
                        cursor: isEditing ? 'grabbing' : 'pointer'
                    }
                }}
                onMouseDown={handleMouseDown}
                // Khi click vào ảnh lúc KHÔNG edit -> Bật chế độ edit hoặc trigger logic khác
                onClick={(e) => {
                    if (!isEditing) {
                        // Nếu bạn muốn click vào là Edit luôn thì bỏ comment dòng dưới
                        // onToggleEdit(); 
                    }
                }}
            >
                {/* ẢNH CHÍNH */}
                <img
                    ref={imgRef}
                    src={imageSrc}
                    alt="Croppable"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        // Logic transform
                        transform: `scale(${scale}) translate(${x / scale}px, ${y / scale}px)`,
                        transformOrigin: 'center center',
                        pointerEvents: 'none',
                        userSelect: 'none',
                        transition: isDragging.current ? 'none' : 'transform 0.1s linear' // Mượt mà hơn
                    }}
                />
                
                {/* OVERLAY KHI KHÔNG EDIT (Hiển thị nút thao tác) */}
                {!isEditing && (
                    <Box sx={{
                        position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.4)', 
                        opacity: 0, transition: 'opacity 0.2s', display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: 1,
                        '&:hover': { opacity: 1 }
                    }}>
                        <Button 
                            variant="contained" 
                            size="small" 
                            onClick={handleTriggerUpload}
                            sx={{ fontSize: '10px', minWidth: '80px', py: 0.5, bgcolor: 'white', color: 'black', '&:hover': { bgcolor: '#f5f5f5' } }}
                        >
                            Đổi ảnh
                        </Button>
                        <Button 
                            variant="contained" 
                            size="small" 
                            onClick={(e) => { e.stopPropagation(); onToggleEdit(); }}
                            sx={{ fontSize: '10px', minWidth: '80px', py: 0.5 }}
                        >
                            Căn chỉnh
                        </Button>
                    </Box>
                )}
            </Box>

            {/* THANH CÔNG CỤ EDIT (Chỉ hiện khi đang Edit) */}
            {isEditing && (
                <Paper elevation={3} sx={{ 
                    p: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5, 
                    zIndex: 10,
                    borderRadius: 2,
                    mt: -1 // Đẩy lên gần ảnh hơn chút
                }} onClick={(e) => e.stopPropagation()}>
                    
                    <Tooltip title="Thu nhỏ">
                        <ZoomOutIcon fontSize="small" color="action" />
                    </Tooltip>
                    
                    {/* SLIDER SCALE: Đã chỉnh step nhỏ để mượt */}
                    <Slider 
                        size="small"
                        min={1} 
                        max={3} 
                        step={0.02} // <--- QUAN TRỌNG: Step nhỏ giúp scale mượt
                        value={scale} 
                        onChange={handleZoomChange}
                        sx={{ width: 100 }}
                    />
                    
                    <Tooltip title="Phóng to">
                        <ZoomInIcon fontSize="small" color="action" />
                    </Tooltip>

                    <Divider orientation="vertical" flexItem />

                    <Button 
                        size="small" 
                        variant="contained" 
                        onClick={(e) => { e.stopPropagation(); onToggleEdit(); }}
                        sx={{ minWidth: 'auto', px: 2 }}
                    >
                        Xong
                    </Button>
                </Paper>
            )}
        </Box>
    );
};

const ParticipantForm = ({ itemData, setItemData, onSave, onCancel, onRemove }) => {
    const fileInputRef = useRef(null);
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setItemData(prev => ({ ...prev, imageUrl: file }));
        }
    };
    const previewUrl = itemData.imageUrl instanceof File
        ? URL.createObjectURL(itemData.imageUrl)
        : itemData.imageUrl;
    return (
        <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, mt: 1 }}>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <img
                        src={previewUrl || 'https://placehold.co/120x120/EEE/31343C?text=Ảnh'}
                        alt="Avatar"
                        style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
                    <Button size="small" onClick={() => fileInputRef.current.click()}>Đổi ảnh</Button>
                </Grid>
                <Grid item xs={12} sm={8} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Tên thành viên"
                        value={itemData.title || ''}
                        onChange={(e) => setItemData(prev => ({ ...prev, title: e.target.value }))}
                        fullWidth
                    />
                    <TextField
                        label="Mô tả"
                        value={itemData.content || ''}
                        onChange={(e) => setItemData(prev => ({ ...prev, content: e.target.value }))}
                        fullWidth multiline rows={3}
                    />
                </Grid>
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                {onRemove && <Button onClick={onRemove} color="error" sx={{ mr: 'auto' }}>Xóa</Button>}
                <Button onClick={onCancel}>Hủy</Button>
                <Button onClick={onSave} variant="contained">Lưu</Button>
            </Box>
        </Box>
    );
};
const SidebarListEditor = ({ title, items, onUpdate, FormComponent, defaultNewItem, renderListItem, initialItemToEdit, onCloseEditor }) => {
    const [editingItem, setEditingItem] = useState(null);
    useEffect(() => {
        if (initialItemToEdit) {
            setEditingItem({ ...initialItemToEdit.data, isNew: initialItemToEdit.isNew });
        } else {
            setEditingItem(null);
        }
    }, [initialItemToEdit]);
    const handleEdit = (item) => {
        setEditingItem({ ...item });
    };
    const handleAddNew = () => {
        setEditingItem({ ...defaultNewItem, id: uuidv4(), isNew: true });
    };
    const handleCancel = () => {
        setEditingItem(null);
        if (onCloseEditor) onCloseEditor();
    };
    const handleSave = () => {
        if (!editingItem) return;
        const { isNew, ...dataToSave } = editingItem;
        let newItems;
        if (isNew) {
            newItems = [...(items || []), dataToSave];
        } else {
            newItems = (items || []).map(item => item.id === dataToSave.id ? dataToSave : item);
        }
        onUpdate(newItems);
        setEditingItem(null);
        if (onCloseEditor) onCloseEditor();
    };
    const handleRemove = () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa mục này không?')) {
            const newItems = items.filter(item => item.id !== editingItem.id);
            onUpdate(newItems);
            setEditingItem(null);
            if (onCloseEditor) onCloseEditor();
        }
    };
    return (
        <Box>
            {!editingItem ? (
                <>
                    <List>
                        {(items || []).map(item => (
                            <ListItemButton key={item.id} onClick={() => handleEdit(item)}>
                                {renderListItem(item)}
                            </ListItemButton>
                        ))}
                    </List>
                    <Button onClick={handleAddNew} startIcon={<AddIcon />} variant="outlined" fullWidth>
                        Thêm {title}
                    </Button>
                </>
            ) : (
                <FormComponent
                    itemData={editingItem}
                    setItemData={setEditingItem}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    onRemove={editingItem.isNew ? null : handleRemove}
                />
            )}
        </Box>
    );
};
const LoveStoryForm = ({ itemData, setItemData, onSave, onCancel, onRemove }) => {
    return (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
                label="Tiêu đề cột mốc"
                value={itemData.title || ''}
                onChange={(e) => setItemData(prev => ({ ...prev, title: e.target.value }))}
                fullWidth
            />
            <TextField
                label="Thời gian (ví dụ: Ngày 12 tháng 12, 2022)"
                value={itemData.date || ''}
                onChange={(e) => setItemData(prev => ({ ...prev, date: e.target.value }))}
                fullWidth
            />
            <TextField
                label="Mô tả câu chuyện"
                value={itemData.description || ''}
                onChange={(e) => setItemData(prev => ({ ...prev, description: e.target.value }))}
                fullWidth multiline rows={4}
            />

            {/* === BỔ SUNG TRƯỜNG UPLOAD ẢNH === */}
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: '500', mb: -1, mt: 1 }}>
                Ảnh minh họa (Tùy chọn)
            </Typography>
            <ImageUploadField
                value={itemData.imageUrl}
                onFileSelect={(file) => setItemData(prev => ({ ...prev, imageUrl: file }))}
                onFileClear={() => setItemData(prev => ({...prev, imageUrl: null}))} 
            />
            {/* ================================= */}
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                {onRemove && <Button onClick={onRemove} color="error" sx={{ mr: 'auto' }}>Xóa</Button>}
                <Button onClick={onCancel}>Hủy</Button>
                <Button onClick={onSave} variant="contained">Lưu</Button>
            </Box>
        </Box>
    );
};
const EventForm = ({ itemData, setItemData, onSave, onCancel, onRemove }) => {
    const theme = useTheme();
    const handleDressCodeAdd = () => {
        const newDressCode = [...(itemData.dressCode || []), { color: '#FFFFFF' }];
        setItemData(prev => ({ ...prev, dressCode: newDressCode }));
    };
    const handleDressCodeChange = (index, color) => {
        const newDressCode = itemData.dressCode.map((item, i) => (i === index ? { color } : item));
        setItemData(prev => ({ ...prev, dressCode: newDressCode }));
    };
    const handleDressCodeRemove = (index) => {
        const newDressCode = itemData.dressCode.filter((_, i) => i !== index);
        setItemData(prev => ({ ...prev, dressCode: newDressCode }));
    };
    return (
        <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField label="Tiêu đề sự kiện" value={itemData.title || ''} onChange={(e) => setItemData(prev => ({ ...prev, title: e.target.value }))} fullWidth />
                <ImageUploadField value={itemData.imageUrl} onFileSelect={(file) => setItemData(prev => ({ ...prev, imageUrl: file }))} />
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <TextField label="Ngày" type="date" value={itemData.date ? itemData.date.split('T')[0] : ''} onChange={(e) => setItemData(prev => ({ ...prev, date: e.target.value }))} fullWidth InputLabelProps={{ shrink: true }} />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField label="Giờ" type="time" value={itemData.time || ''} onChange={(e) => setItemData(prev => ({ ...prev, time: e.target.value }))} fullWidth InputLabelProps={{ shrink: true }} />
                    </Grid>
                </Grid>
                <TextField label="Địa chỉ" value={itemData.address || ''} onChange={(e) => setItemData(prev => ({ ...prev, address: e.target.value }))} fullWidth multiline rows={2} />
                <TextField label="Link Google Maps" value={itemData.mapUrl || ''} onChange={(e) => setItemData(prev => ({ ...prev, mapUrl: e.target.value }))} fullWidth placeholder="Dán link Google Maps vào đây" />
                <Box>
                    <Typography variant="subtitle2" gutterBottom>Dress Code</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                        {(itemData.dressCode || []).map((item, index) => (
                            <Box key={index} sx={{ position: 'relative', '&:hover .remove-btn': { opacity: 1 } }}>
                                <input type="color" value={item.color} onChange={(e) => handleDressCodeChange(index, e.target.value)} style={{ width: 32, height: 32, border: `1px solid ${theme.palette.divider}`, borderRadius: '50%', cursor: 'pointer' }} />
                                <IconButton size="small" className="remove-btn" onClick={() => handleDressCodeRemove(index)} sx={{ position: 'absolute', top: -10, right: -10, bgcolor: 'background.paper', opacity: 0, transition: 'opacity 0.2s', '&:hover': { bgcolor: 'error.light' } }}>
                                    <DeleteIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            </Box>
                        ))}
                        <Tooltip title="Thêm màu">
                            <IconButton onClick={handleDressCodeAdd} size="small"><AddCircleOutlineIcon /></IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                {onRemove && <Button onClick={onRemove} color="error" sx={{ mr: 'auto' }}>Xóa</Button>}
                <Button onClick={onCancel}>Hủy</Button>
                <Button onClick={onSave} variant="contained">Lưu</Button>
            </Box>
        </Box>
    );
};
const SimplifiedStoryEditor = ({ fieldKey, settings, onUpdate, customFonts }) => {
    const theme = useTheme();
    // Thêm state filter
    const [fontFilter, setFontFilter] = useState('All');

    const item = {
        id: fieldKey,
        content: _.get(settings, fieldKey, ''),
        ..._.get(settings, `${fieldKey}Style`, {})
    };
    const handleUpdate = (updates) => {
        onUpdate(fieldKey, updates);
    };
    const toggleStyle = (property, value, defaultValue) => {
        handleUpdate({ [property]: item[property] === value ? defaultValue : value });
    };
    
    // Logic filter tương tự
    const filteredCustomFonts = customFonts.filter(f => {
        if (fontFilter === 'All') return true;
        if (fontFilter === 'General') return !f.category || f.category === 'General';
        return f.category === fontFilter;
    });

    const showSystemFonts = fontFilter === 'All' || fontFilter === 'General';
    let availableFonts = [
        ...(showSystemFonts ? FONT_FAMILIES : []),
        ...filteredCustomFonts.map(f => f.name)
    ];

    if (item.fontFamily && !availableFonts.includes(item.fontFamily)) {
        availableFonts = [item.fontFamily, ...availableFonts];
    }
    availableFonts = [...new Set(availableFonts)];

    const selectedButtonStyle = {
        bgcolor: alpha(theme.palette.primary.main, 0.1),
        color: 'primary.main',
    };
    const previewStyle = {
        fontFamily: item.fontFamily || 'Arial',
        fontSize: `${item.fontSize || 16}px`,
        fontWeight: item.fontWeight || 'normal',
        fontStyle: item.fontStyle || 'normal',
        textDecoration: item.textDecoration || 'none',
        color: item.color || '#333',
        textAlign: 'left',
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        padding: '16px',
        minHeight: '100px',
        marginTop: '16px',
        backgroundColor: theme.palette.background.default
    };
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
                label="Nội dung"
                value={item.content}
                onChange={(e) => handleUpdate({ content: e.target.value })}
                fullWidth
                multiline
                rows={4}
            />

            <ButtonGroup size="small" variant="outlined" aria-label="text formatting">
                <Tooltip title="In Đậm"><IconButton onClick={() => toggleStyle('fontWeight', 'bold', 'normal')} sx={item.fontWeight === 'bold' ? selectedButtonStyle : {}}><FormatBoldIcon /></IconButton></Tooltip>
                <Tooltip title="In Nghiêng"><IconButton onClick={() => toggleStyle('fontStyle', 'italic', 'normal')} sx={item.fontStyle === 'italic' ? selectedButtonStyle : {}}><FormatItalicIcon /></IconButton></Tooltip>
                <Tooltip title="Gạch Chân"><IconButton onClick={() => toggleStyle('textDecoration', 'underline', 'none')} sx={item.textDecoration === 'underline' ? selectedButtonStyle : {}}><FormatUnderlinedIcon /></IconButton></Tooltip>
            </ButtonGroup>

            {/* Thêm UI Filter */}
            <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Lọc Font chữ:</Typography>
                <ToggleButtonGroup
                    value={fontFilter}
                    exclusive
                    onChange={(e, newVal) => { if(newVal) setFontFilter(newVal); }}
                    size="small"
                    sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 0.5,
                        '& .MuiToggleButtonGroup-grouped': {
                            border: `1px solid ${theme.palette.divider} !important`,
                            borderRadius: '16px !important',
                            textTransform: 'none',
                            px: 1,
                            py: 0.25,
                            '&.Mui-selected': {
                                bgcolor: 'primary.main',
                                color: 'white',
                                '&:hover': { bgcolor: 'primary.dark' }
                            }
                        }
                    }}
                >
                    <ToggleButton value="All">Tất cả</ToggleButton>
                    <ToggleButton value="Wedding">Cưới</ToggleButton>
                    <ToggleButton value="Vietnamese">Tiếng Việt</ToggleButton>
                    <ToggleButton value="Uppercase">Viết hoa</ToggleButton>
                    <ToggleButton value="General">Chung</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <Grid container spacing={2}>
                <Grid item xs={8}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Font</InputLabel>
                        <Select
                            value={item.fontFamily || 'Arial'}
                            label="Font"
                            onChange={(e) => handleUpdate({ fontFamily: e.target.value })}
                            MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
                        >
                            {availableFonts.length > 0 ? availableFonts.map(font => (
                                <MenuItem key={font} value={font} style={{ fontFamily: font }}>{font}</MenuItem>
                            )) : (
                                <MenuItem disabled>Không có font</MenuItem>
                            )}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={4}>
                    <TextField
                        label="Cỡ chữ"
                        type="number"
                        size="small"
                        value={item.fontSize || 16}
                        onChange={(e) => handleUpdate({ fontSize: Math.max(8, parseInt(e.target.value, 10) || 16) })}
                        fullWidth
                    />
                </Grid>
            </Grid>
            <Divider sx={{ my: 1 }} />
            <Typography variant="overline" color="text.secondary">Xem trước</Typography>
            <Box sx={previewStyle}>
                {item.content || "Nội dung xem trước sẽ hiển thị ở đây."}
            </Box>
        </Box>
    );
};
const SETTINGS_META = {
    invitationType: { label: 'Loại thiệp mời', type: 'select', required: true, options: ['Thiệp cưới', 'Thiệp sự kiện chung', 'Thiệp cảm ơn', 'Thiệp chúc mừng'], description: 'Chọn loại thiệp phù hợp với sự kiện của bạn.' },
    eventDate: { label: 'Ngày giờ diễn ra sự kiện', type: 'datetime', required: false, description: 'Thời gian chính thức bắt đầu sự kiện.' },
    eventDescription: { label: 'Câu chuyện', type: 'story-text', required: true, description: 'Chia sẻ một vài dòng về câu chuyện hoặc sự kiện của bạn.' },
    groomName: { label: 'Tên chú rể', type: 'story-text' },
    groomInfo: { label: 'Thông tin chú rể', type: 'story-text' },
    contactGroom: { label: 'Liên hệ chú rể', type: 'story-text' },
    groomImageUrl: { label: 'Ảnh chú rể', type: 'image' },
    brideName: { label: 'Tên cô dâu', type: 'story-text' },
    brideInfo: { label: 'Thông tin cô dâu', type: 'story-text' },
    contactBride: { label: 'Liên hệ cô dâu', type: 'story-text' },
    brideImageUrl: { label: 'Ảnh cô dâu', type: 'image' },
    bannerImages: { label: 'Ảnh Banner Carousel', type: 'image-dnd-list', description: 'Tải lên, sắp xếp và xóa ảnh cho carousel banner.' },
    galleryImages: { label: 'Bộ sưu tập ảnh', type: 'image-grid', description: 'Những khoảnh khắc đẹp nhất để chia sẻ với khách mời.' },
    qrCodes: { label: 'Mã QR Chuyển Khoản', type: 'qr-code-editor', description: 'Tải lên các mã QR để khách mời gửi quà mừng.' },
    musicUrl: { label: 'Âm thanh sự kiện', type: 'text', description: 'Dán URL nhạc nền (Youtube, Zing MP3...).' },
    videoUrl: { label: 'Video Sự kiện', type: 'text', description: 'Dán URL video Youtube để hiển thị trên trang.' },
    events: { label: 'Danh sách Sự kiện cưới', type: 'event-list', description: 'Thêm các sự kiện như lễ ăn hỏi, lễ cưới, tiệc đãi khách...' },
    participants: { label: 'Thành viên tham gia', type: 'participants-editor', description: 'Giới thiệu các thành viên quan trọng trong sự kiện của bạn.' },
    loveStory: { label: 'Câu chuyện tình yêu', type: 'love-story-editor', description: 'Kể lại những cột mốc đáng nhớ trong hành trình của bạn.' },
    countdownTitle: { label: 'Tiêu đề Đếm ngược', type: 'story-text' },
    coupleTitle: { label: 'Tiêu đề Cô dâu & Chú rể', type: 'story-text' },
    coupleSubtitle: { label: 'Tiêu đề phụ Cô dâu & Chú rể', type: 'story-text' },
    participantsTitle: { label: 'Tiêu đề Thành viên tham gia', type: 'story-text' },
    eventsTitle: { label: 'Tiêu đề Lịch trình', type: 'story-text' },
    loveStoryTitle: { label: 'Tiêu đề Chuyện tình yêu', type: 'story-text' },
    galleryTitle: { label: 'Tiêu đề Bộ sưu tập ảnh', type: 'story-text' },
    videoTitle: { label: 'Tiêu đề Video', type: 'story-text' },
    contactTitle: { label: 'Tiêu đề Liên hệ', type: 'story-text' },
    qrCodeTitle: { label: 'Tiêu đề Mã QR', type: 'story-text' },
    rsvpTitle: { label: 'Tiêu đề RSVP', type: 'story-text' },
    rsvpSubtitle: { label: 'Tiêu đề phụ RSVP', type: 'story-text' },
    customHtmlContent: { label: 'Nội dung HTML tùy chỉnh', type: 'custom-html', description: 'Sử dụng trình soạn thảo bên dưới để tạo nội dung độc đáo cho riêng bạn.' },
    customHtmlTitle: { label: 'Tiêu đề khối tùy chỉnh', type: 'story-text' },
};
const StyledTextPropertyEditor = ({ fieldKey, settings, onUpdate, customFonts }) => {
    const item = {
        id: fieldKey,
        content: _.get(settings, fieldKey, ''),
        ..._.get(settings, `${fieldKey}Style`, {})
    };
    const handleItemUpdate = (id, updates) => {
        onUpdate(id, updates);
    };
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextToolbar item={item} onUpdate={handleItemUpdate} />
            <TextPropertyEditor item={item} onUpdate={handleItemUpdate} customFonts={customFonts} />
        </Box>
    );
};
const ImageUploadField = ({ value, onFileSelect }) => {
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(value);
    useEffect(() => {
        if (value instanceof File) {
            const objectUrl = URL.createObjectURL(value);
            setPreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else {
            setPreview(value);
        }
    }, [value]);
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            onFileSelect(file);
        }
    };
    return (
        <Box>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                bgcolor: 'background.default',
            }}>
                <Box
                    sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 1.5,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {preview ? (
                        <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <ImageIcon sx={{ color: 'text.secondary' }} />
                    )}
                </Box>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
                <Button variant="outlined" onClick={() => fileInputRef.current.click()}>
                    Chọn ảnh
                </Button>
            </Box>
        </Box>
    );
};
const QrCodeEditor = ({ value = [], onUpdate }) => {
    const fileInputRef = useRef(null);
    const handleFilesChange = (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            const newQRs = files.map(file => ({
                id: `new-${uuidv4()}`,
                title: file.name.split('.').slice(0, -1).join('.'), // Tên file làm tiêu đề mặc định
                url: file // Đây là đối tượng File
            }));
            onUpdate([...value, ...newQRs]);
        }
        if (event.currentTarget) {
            event.currentTarget.value = null;
        }
    };
    const handleRemoveImage = (indexToRemove) => {
        onUpdate(value.filter((_, index) => index !== indexToRemove));
    };
    const handleTitleChange = (index, newTitle) => {
        const updatedQRs = value.map((item, i) => i === index ? { ...item, title: newTitle } : item);
        onUpdate(updatedQRs);
    };
    return (
        <Box>
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
                {value.map((qr, index) => {
                    const key = qr.id || `qr-${index}`;
                    const previewUrl = qr.url instanceof File ? URL.createObjectURL(qr.url) : qr.url;
                    return (
                        <Grid item key={key} xs={6}>
                            <Box sx={{ position: 'relative', aspectRatio: '1', borderRadius: 1.5, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                                <img src={previewUrl} alt={`Preview ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                <IconButton size="small" onClick={() => handleRemoveImage(index)} sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'error.main', color: 'white' } }}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Box>
                            <TextField
                                fullWidth
                                label="Tiêu đề QR"
                                variant="outlined"
                                size="small"
                                value={qr.title || ''}
                                onChange={(e) => handleTitleChange(index, e.target.value)}
                                sx={{ mt: 1 }}
                            />
                        </Grid>
                    );
                })}
            </Grid>
            <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleFilesChange} style={{ display: 'none' }} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => fileInputRef.current.click()} fullWidth>
                Thêm mã QR
            </Button>
        </Box>
    );
};
const ImageGridEditor = ({ value = [], onUpdate }) => {
    const fileInputRef = useRef(null);
    const handleFilesChange = (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            onUpdate([...value, ...files]);
        }
    };
    const handleRemoveImage = (indexToRemove) => {
        onUpdate(value.filter((_, index) => index !== indexToRemove));
    };
    return (
        <Box>
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
                {value.map((img, index) => {
                    const previewUrl = img instanceof File ? URL.createObjectURL(img) : img;
                    return (
                        <Grid item key={index} xs={6}>
                            <Box sx={{ position: 'relative', aspectRatio: '1', borderRadius: 1.5, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                                <img src={previewUrl} alt={`Preview ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <IconButton size="small" onClick={() => handleRemoveImage(index)} sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'error.main', color: 'white' } }}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </Grid>
                    );
                })}
            </Grid>
            <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleFilesChange} style={{ display: 'none' }} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => fileInputRef.current.click()} fullWidth>
                Thêm ảnh
            </Button>
        </Box>
    );
};
function SortableBannerItem({ id, image, index, removeBannerImage }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition };
    const imageUrl = typeof image === 'string' ? image : image.preview;
    return (
        <Box ref={setNodeRef} style={style} {...attributes} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper', '&:hover': { borderColor: 'grey.400' } }}>
            <Box {...listeners} sx={{ color: 'text.secondary', cursor: 'grab', '&:active': { cursor: 'grabbing' } }}><MenuIcon /></Box>
            <img src={imageUrl} alt={`Banner ${index + 1}`} style={{ width: 80, height: 48, objectFit: 'cover', borderRadius: 1 }} />
            <Typography variant="body2" sx={{ flexGrow: 1, color: 'text.secondary' }}>Ảnh banner {index + 1}</Typography>
            <IconButton size="small" onClick={() => removeBannerImage(id)}><DeleteIcon fontSize="small" /></IconButton>
        </Box>
    );
}
const BannerDndListEditor = ({ value = [], onUpdate }) => {
    const fileInputRef = useRef(null);
    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
    const handleAddImages = (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;
        const newFilesArray = files.map(file => ({ id: `new-${uuidv4()}`, file: file, preview: URL.createObjectURL(file) }));
        onUpdate([...value, ...newFilesArray]);
    };
    const handleRemoveImage = (idToRemove) => {
        const imageToRemove = value.find(img => img.id === idToRemove);
        if (imageToRemove && imageToRemove.preview) {
            URL.revokeObjectURL(imageToRemove.preview);
        }
        onUpdate(value.filter(img => img.id !== idToRemove));
    };
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = value.findIndex(img => img.id === active.id);
            const newIndex = value.findIndex(img => img.id === over.id);
            onUpdate(arrayMove(value, oldIndex, newIndex));
        }
    }
    return (
        <Box>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={value} strategy={verticalListSortingStrategy}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                        {value.map((image, index) => (
                            <SortableBannerItem key={image.id} id={image.id} image={image.url || image} index={index} removeBannerImage={handleRemoveImage} />
                        ))}
                    </Box>
                </SortableContext>
            </DndContext>
            <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleAddImages} style={{ display: 'none' }} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => fileInputRef.current.click()} fullWidth>Thêm ảnh Banner</Button>
        </Box>
    );
};
const MapPickerEditor = ({ location, onLocationChange }) => {
    const { isLoaded, loadError } = useJsApiLoader({ googleMapsApiKey: process.env.REACT_APP_Maps_API_KEY, libraries: ['places'] });
    const [mapCenter, setMapCenter] = useState(location);
    const autocompleteRef = useRef(null);
    useEffect(() => { setMapCenter(location); }, [location]);
    const handlePlaceSelect = () => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();
            if (place && place.geometry) {
                const newLocation = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng(), address: place.formatted_address };
                setMapCenter(newLocation);
                onLocationChange(newLocation);
            }
        }
    };
    if (loadError) return <Typography color="error.main">Lỗi tải bản đồ.</Typography>;
    if (!isLoaded) return <CircularProgress />;
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Autocomplete onLoad={(ref) => (autocompleteRef.current = ref)} onPlaceChanged={handlePlaceSelect}>
                <TextField fullWidth variant="outlined" placeholder="Nhập địa điểm..." defaultValue={location.address} />
            </Autocomplete>
            <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                <GoogleMap mapContainerStyle={{ width: '100%', height: '250px' }} center={mapCenter} zoom={15}>
                    {mapCenter && <Marker position={mapCenter} />}
                </GoogleMap>
            </Box>
        </Box>
    );
};
const SettingsPropertyEditor = ({ selectedKey, settings, setSettings, customFonts, itemToEdit, setItemToEdit }) => {
    if (!selectedKey) return null;
    const meta = SETTINGS_META[selectedKey];
    const value = _.get(settings, selectedKey, '');
    const handleUpdate = (fieldIdOrValue, updates) => {
        if (['image-grid', 'image-dnd-list', 'qr-code-editor', 'event-list', 'participants-editor', 'love-story-editor'].includes(meta.type)) {
            setSettings(prev => ({
                ...prev,
                [selectedKey]: fieldIdOrValue
            }));
            return;
        }
        setSettings(prev => {
            const newSettings = { ...prev };
            if (meta.type === 'text' || meta.type === 'datetime' || meta.type === 'select') {
                 _.set(newSettings, fieldIdOrValue, updates.content);
                 return newSettings;
            }
            const { content, ...styleUpdates } = updates;
            if (content !== undefined) {
                _.set(newSettings, fieldIdOrValue, content);
            }
            if (Object.keys(styleUpdates).length > 0) {
                const styleKey = `${fieldIdOrValue}Style`;
                const currentStyles = _.get(prev, styleKey, {});
                const newStyles = { ...currentStyles, ...styleUpdates };
                _.set(newSettings, styleKey, newStyles);
            }
            
            return newSettings;
        });
    };
    const renderEditor = () => {
        switch (meta.type) {
            case 'text':
            case 'textarea':
                return <TextField
                    fullWidth
                    label={meta.label}
                    multiline={meta.type === 'textarea'}
                    rows={meta.type === 'textarea' ? 4 : 1}
                    value={value}
                    onChange={(e) => handleUpdate(selectedKey, { content: e.target.value })}
                />;
            case 'select':
                return <FormControl fullWidth>
                    <Select
                        value={value}
                        onChange={(e) => handleUpdate(selectedKey, { content: e.target.value })}
                    >
                        {meta.options.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                    </Select>
                </FormControl>;
            case 'datetime':
                return <TextField
                    type="datetime-local"
                    value={value}
                    onChange={(e) => handleUpdate(selectedKey, { content: e.target.value })}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                />;
            case 'image':
                return <ImageUploadField
                    value={value}
                    onFileSelect={(file) => handleUpdate(selectedKey, { content: file })}
                />;

            case 'image-grid':
                return <ImageGridEditor
                    value={value || []}
                    onUpdate={handleUpdate}
                />;
            case 'image-dnd-list':
                return <BannerDndListEditor
                    value={value || []}
                    onUpdate={handleUpdate}
                />;
            case 'map':
                return <MapPickerEditor
                    location={value || { lat: 0, lng: 0, address: '' }}
                    onLocationChange={(newLocation) => handleUpdate(selectedKey, { content: newLocation })}
                />;
            case 'qr-code-editor':
                return <QrCodeEditor
                    value={value || []}
                    onUpdate={handleUpdate}
                />;
            case 'event-list':
                return <SidebarListEditor
                    title="Sự kiện"
                    items={value || []}
                    onUpdate={handleUpdate}
                    FormComponent={EventForm}
                    defaultNewItem={{ title: 'Sự kiện mới', date: new Date().toISOString().split('T')[0], time: '12:00', address: '', mapUrl: '', imageUrl: '', dressCode: [] }}
                    renderListItem={(item) => <ListItemText primary={item.title} secondary={`${item.date} - ${item.time}`} />}
                    initialItemToEdit={itemToEdit?.type === 'events' ? itemToEdit : null}
                    onCloseEditor={() => setItemToEdit(null)}
                />;
            case 'participants-editor':
                return <SidebarListEditor
                    title="Thành viên"
                    items={value || []}
                    onUpdate={handleUpdate}
                    FormComponent={ParticipantForm}
                    defaultNewItem={{ title: 'Tên thành viên', content: 'Mô tả ngắn...', imageUrl: null }}
                    renderListItem={(item) => <ListItemText primary={item.title} secondary={item.content} />}
                    initialItemToEdit={itemToEdit?.type === 'participants' ? itemToEdit : null}
                    onCloseEditor={() => setItemToEdit(null)}
                />;
            case 'love-story-editor':
                return <SidebarListEditor
                    title="Cột mốc"
                    items={value || []}
                    onUpdate={handleUpdate}
                    FormComponent={LoveStoryForm}
                    defaultNewItem={{ title: 'Cột mốc mới', date: '', description: 'Kể câu chuyện của bạn ở đây...', imageUrl: null }}
                    renderListItem={(item) => <ListItemText primary={item.title} secondary={item.date} />}
                    initialItemToEdit={itemToEdit?.type === 'loveStory' ? itemToEdit : null}
                    onCloseEditor={() => setItemToEdit(null)}
                />;
            case 'story-text':
                return <SimplifiedStoryEditor
                    fieldKey={selectedKey}
                    settings={settings}
                    onUpdate={handleUpdate}
                    customFonts={customFonts}
                />;
            case 'styled-text':
                return <StyledTextPropertyEditor
                    fieldKey={selectedKey}
                    settings={settings}
                    onUpdate={handleUpdate}
                    customFonts={customFonts}
                />;
            case 'custom-html':
                return (
                    <CustomEditor
                        data={value || ''}
                        onChange={(content) => handleUpdate(selectedKey, { content })}
                    />
                );
            default:
                return <Typography color="text.secondary">Không có trình chỉnh sửa cho loại này.</Typography>;
        }
    };
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {meta.description && <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{meta.description}</Typography>}
            {renderEditor()}
        </Box>
    );
};
const FONT_FAMILIES = ['Arial', 'Times New Roman', 'Verdana', 'Courier New', 'Garamond', 'Georgia', 'Helvetica', 'Tahoma']; // Giữ nguyên các font hệ thống
const BASE_Z_INDEX = 5;
const MAX_TEXT_LENGTH = 1000;
const defaultItemProps = {
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    brightness: 1,
    contrast: 1,
    grayscale: 0,
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
    textAlign: 'center',
    shape: 'square',
    imagePosition: { x: 0, y: 0 },
};

const MIN_ITEM_WIDTH = 20;
const MIN_ITEM_HEIGHT = 20;
const HANDLE_SIZE = 8;
const HANDLE_OFFSET = HANDLE_SIZE / 2;
const BORDER_COLOR = '#3B82F6';
const ZOOM_STEP = 0.1;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 3.0;
const LEFT_PRIMARY_SIDEBAR_WIDTH = 100;
const LEFT_SECONDARY_SIDEBAR_WIDTH = 340;
const DEFAULT_CANVAS_WIDTH = 800;
const DEFAULT_CANVAS_HEIGHT = 600;
const ROTATION_SNAP_ANGLE = 15;
const SNAP_THRESHOLD = 6;
const CM_TO_PX = 37.795;
const MAX_DIMENSION_PX = 800;
const fitToCanvas = (widthCm, heightCm) => {
    let widthPx = widthCm * CM_TO_PX;
    let heightPx = heightCm * CM_TO_PX;
    const ratio = widthPx / heightPx;

    if (widthPx > MAX_DIMENSION_PX) {
        widthPx = MAX_DIMENSION_PX;
        heightPx = MAX_DIMENSION_PX / ratio;
    }
    if (heightPx > MAX_DIMENSION_PX) {
        heightPx = MAX_DIMENSION_PX;
        widthPx = MAX_DIMENSION_PX * ratio;
    }
    return { width: Math.round(widthPx), height: Math.round(heightPx) };
};
const STANDARD_SIZES = {
    "Thiệp Cưới": {
        "Truyền thống (12 x 17 cm)": fitToCanvas(12, 17),
        "Truyền thống (12 x 18 cm)": fitToCanvas(12, 18),
        "Dài sang trọng (9.5 x 22 cm)": fitToCanvas(9.5, 22),
        "Vuông hiện đại (15 x 15 cm)": fitToCanvas(15, 15),
        "Nhỏ gọn, tiết kiệm (8.5 x 12 cm)": fitToCanvas(8.5, 12),
    },
    "Thiệp Mời Sự Kiện, Hội Nghị": {
        "Thông dụng (12 x 20 cm)": fitToCanvas(12, 20),
        "Thông dụng ngang (15 x 10 cm)": fitToCanvas(15, 10),
        "Sự kiện doanh nghiệp A5 (15 x 21 cm)": fitToCanvas(15, 21),
        "Dài đặc biệt (10 x 28 cm)": fitToCanvas(10, 28),
        "Dài đặc biệt (10 x 42 cm)": fitToCanvas(10, 42),
    },
    "Thiệp Chúc Mừng & Cảm Ơn": {
        "Vuông nhỏ (10 x 10 cm)": fitToCanvas(10, 10),
        "Vuông vừa (12 x 12 cm)": fitToCanvas(12, 12),
        "Vuông lớn (15 x 15 cm)": fitToCanvas(15, 15),
        "Chữ nhật chuẩn (10 x 15 cm)": fitToCanvas(10, 15),
        "Chữ nhật (12 x 15 cm)": fitToCanvas(12, 15),
        "Chữ nhật dài (10 x 20 cm)": fitToCanvas(10, 20),
        "Cảm ơn nhỏ gọn (7 x 10 cm)": fitToCanvas(7, 10),
        "Cảm ơn siêu nhỏ (5.5 x 9 cm)": fitToCanvas(5.5, 9),
    },
};
const CanvasWrapper = styled(Box)({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    overflow: 'auto',
    touchAction: 'none'
});
const CanvasContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    overflow: 'hidden',
    border: `1px solid ${theme.palette.divider}`
}));
const StyledCanvas = styled('canvas')({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none'
});
const DraggableItem = styled(motion.div)({
    position: 'absolute',
    cursor: 'grab',
    '&:active': {
        cursor: 'grabbing'
    },
    boxSizing: 'border-box',
    transformStyle: 'preserve-3d',
    backfaceVisibility: 'hidden',
});
const MinimalHandleStyle = {
    position: 'absolute',
    width: `${HANDLE_SIZE}px`,
    height: `${HANDLE_SIZE}px`,
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    border: `1.5px solid ${BORDER_COLOR}`,
    zIndex: 20000,
    boxSizing: 'border-box',
};
const RotateHandleStyle = {
    ...MinimalHandleStyle,
    cursor: 'alias',
    top: `-${HANDLE_OFFSET + 20}px`,
    left: `calc(50% - ${HANDLE_OFFSET}px)`,
};
const RotateLine = styled('div')({
    position: 'absolute',
    width: '1.5px',
    height: '18px',
    backgroundColor: BORDER_COLOR,
    left: 'calc(50% - 0.75px)',
    bottom: `calc(100% + ${HANDLE_OFFSET}px)`,
    zIndex: 19999,
});
const calculateSnapping = (draggedItem, allItems, zoomLevel) => {
    const otherItems = allItems.filter(it => it.id !== draggedItem.id && it.visible !== false);
    let finalX = draggedItem.x;
    let finalY = draggedItem.y;
    const guidesToShow = [];
    const draggedGeom = {
        left: draggedItem.x,
        center: draggedItem.x + draggedItem.width / 2,
        right: draggedItem.x + draggedItem.width,
        top: draggedItem.y,
        middle: draggedItem.y + draggedItem.height / 2,
        bottom: draggedItem.y + draggedItem.height,
    };
    let bestVSnap = { dist: Infinity, guide: 0, newPos: 0, item: null };
    let bestHSnap = { dist: Infinity, guide: 0, newPos: 0, item: null };
    for (const staticItem of otherItems) {
        const staticGeom = {
            left: staticItem.x,
            center: staticItem.x + staticItem.width / 2,
            right: staticItem.x + staticItem.width,
            top: staticItem.y,
            middle: staticItem.y + staticItem.height / 2,
            bottom: staticItem.y + staticItem.height,
        };
        const vPoints = ['left', 'center', 'right'];
        const hPoints = ['top', 'middle', 'bottom'];
        for (const dPoint of vPoints) {
            for (const sPoint of vPoints) { // Dòng 1744 (đã sửa) - Không còn lỗi
                const dist = Math.abs(draggedGeom[dPoint] - staticGeom[sPoint]);
                if (dist < bestVSnap.dist) {
                    bestVSnap = {
                        dist,
                        guide: staticGeom[sPoint],
                        newPos: staticGeom[sPoint] - (draggedGeom[dPoint] - draggedGeom.left),
                        item: staticItem
                    };
                }
            }
        }
        for (const dPoint of hPoints) {
            for (const sPoint of hPoints) { // Dòng 1758 (đã sửa) - Không còn lỗi
                const dist = Math.abs(draggedGeom[dPoint] - staticGeom[sPoint]);
                if (dist < bestHSnap.dist) {
                    bestHSnap = {
                        dist,
                        guide: staticGeom[sPoint],
                        newPos: staticGeom[sPoint] - (draggedGeom[dPoint] - draggedGeom.top),
                        item: staticItem
                    };
                }
            }
        }
    }
    if (bestVSnap.dist * zoomLevel < SNAP_THRESHOLD) {
        finalX = bestVSnap.newPos;
        const top = Math.min(draggedGeom.top, bestVSnap.item.y);
        const bottom = Math.max(draggedGeom.bottom, bestVSnap.item.y + bestVSnap.item.height);
        guidesToShow.push({
            type: 'v',
            x: bestVSnap.guide,
            y1: top,
            y2: bottom
        });
    }
    if (bestHSnap.dist * zoomLevel < SNAP_THRESHOLD) {
        finalY = bestHSnap.newPos;
        const left = Math.min(draggedGeom.left, bestHSnap.item.x);
        const right = Math.max(draggedGeom.right, bestHSnap.item.x + bestHSnap.item.width);
        guidesToShow.push({
            type: 'h',
            y: bestHSnap.guide,
            x1: left,
            x2: right
        });
    }
    return {
        snappedX: finalX,
        snappedY: finalY,
        guides: guidesToShow
    };
};
const PannableImageFrame = ({ item, onUpdateItem, onSelectItem }) => {
  // 1. Refs & State
  const frameRef = useRef(null);
  const imageRef = useRef(null);
  const [position, setPosition] = useState(item.imagePosition || { x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const pointerIdRef = useRef(null);
  const dragStartRef = useRef({ startX: 0, startY: 0, startPosX: 0, startPosY: 0 });

  const isEditing = item.isEditing && !item.locked;
  
  // 2. Effects
  
  /**
   * Đồng bộ state 'position' nội bộ nếu 'item.imagePosition' thay đổi từ bên ngoài.
   */
  useEffect(() => {
    if (!isDraggingRef.current) {
      setPosition(item.imagePosition || { x: 0, y: 0 });
    }
  }, [item.imagePosition]);

  // 4. Logic tính toán (Clamping) - Đã bọc trong useCallback
  /**
   * Hàm tính toán giới hạn kéo (clamp)
   */
  const clampPosition = useCallback((newX, newY) => {
    if (!frameRef.current || !imageRef.current || !imageRef.current.naturalWidth) {
      return { x: newX, y: newY };
    }

    const frameW = frameRef.current.clientWidth;
    const frameH = frameRef.current.clientHeight;
    const naturalW = imageRef.current.naturalWidth;
    const naturalH = imageRef.current.naturalHeight;
    const frameRatio = frameW / frameH;
    const naturalRatio = naturalW / naturalH;

    let coveredImgWidth, coveredImgHeight;
    
    if (naturalRatio > frameRatio) {
      coveredImgHeight = frameH;
      coveredImgWidth = frameH * naturalRatio;
    } else {
      coveredImgWidth = frameW;
      coveredImgHeight = frameW / naturalRatio;
    }

    const scaledImgW = coveredImgWidth * EDIT_SCALE;
    const scaledImgH = coveredImgHeight * EDIT_SCALE;

    const maxOffsetX = Math.max(0, (scaledImgW - frameW) / 2);
    const maxOffsetY = Math.max(0, (scaledImgH - frameH) / 2);

    const clampedX = Math.max(-maxOffsetX, Math.min(maxOffsetX, newX));
    const clampedY = Math.max(-maxOffsetY, Math.min(maxOffsetY, newY));

    return { x: clampedX, y: clampedY };
  }, []); // Refs là stable, không cần đưa vào dependency array

  // 3. Event Handlers (ĐÃ SỬA LỖI)

  // --- HÀM POINTER MOVE (Đã di chuyển ra ngoài và bọc bằng useCallback) ---
  const handlePointerMove = useCallback((e) => {
    if (!isDraggingRef.current || e.pointerId !== pointerIdRef.current) return;

    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    const newX = dragStartRef.current.startPosX + dx;
    const newY = dragStartRef.current.startPosY + dy;

    const clampedPos = clampPosition(newX, newY);
    setPosition(clampedPos);
  }, [clampPosition]); // Phụ thuộc vào clampPosition

  // --- HÀM POINTER UP (Đã di chuyển ra ngoài và bọc bằng useCallback) ---
  const handlePointerUp = useCallback((e) => {
    if (!isDraggingRef.current || (e.pointerId !== pointerIdRef.current && e.type !== 'pointercancel')) return;

    isDraggingRef.current = false;
    
    try {
      // Thêm kiểm tra 'e.target' và 'releasePointerCapture'
      if (e.target && typeof e.target.releasePointerCapture === 'function') {
        e.target.releasePointerCapture(pointerIdRef.current);
      }
    } catch (err) {
      // Bỏ qua lỗi (ví dụ: capture đã bị mất)
    }
    
    pointerIdRef.current = null;
    
    // Gỡ bỏ listener khỏi window
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
    window.removeEventListener('pointercancel', handlePointerUp);
  }, [handlePointerMove]); // Phụ thuộc vào handlePointerMove

  // --- UseEffect ĐÃ SỬA LẠI (Chỉ dùng để cleanup khi unmount) ---
  useEffect(() => {
    // Effect này chỉ dùng để dọn dẹp listener nếu component bị unmount
    // TRONG KHI đang kéo (isDraggingRef.current === true).
    return () => {
      if (isDraggingRef.current) {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerUp);
      }
    };
  }, [handlePointerMove, handlePointerUp]); // Phụ thuộc vào các hàm callback đã định nghĩa ở trên

  /**
   * Xử lý double-click: Bật/Tắt Edit Mode
   */
  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (item.locked) return;

    const newIsEditing = !item.isEditing;

    // Khi thoát chế độ (newIsEditing=false), commit vị trí pan
    if (!newIsEditing) {
        onUpdateItem(item.id, { imagePosition: position, isEditing: false }, true);
        toast.info("Đã lưu chỉnh sửa crop.");
    } else {
        // Khi vào chế độ, chỉ bật flag isEditing
        onUpdateItem(item.id, { isEditing: true }, false);
    }
  };

  /**
   * Xử lý Pointer Down: Bắt đầu hành động kéo (pan) ảnh
   */
  const handlePointerDown = (e) => {
    if (!isEditing) return;
    
    e.preventDefault();
    e.stopPropagation(); 

    isDraggingRef.current = true;
    pointerIdRef.current = e.pointerId;
    e.target.setPointerCapture(e.pointerId);

    dragStartRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startPosX: position.x,
        startPosY: position.y,
    };

    // Gắn listener vào window (Giờ đã hợp lệ vì các hàm đã ở trong scope)
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  };

  // 5. Render Logic (Giữ nguyên)
  const scale = isEditing ? EDIT_SCALE : 1;
  const displayPosition = isEditing ? position : (item.imagePosition || { x: 0, y: 0 });

  const frameStyles = {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: item.shape === 'circle' ? '50%' : '0',
    position: 'relative',
    cursor: item.locked ? 'not-allowed' : (isEditing ? 'grab' : 'inherit'),
    '&:active': {
      cursor: item.locked ? 'not-allowed' : (isEditing ? 'grabbing' : 'inherit'),
    }
  };

  const imageStyles = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    userSelect: 'none',
    pointerEvents: isEditing ? 'auto' : 'none', 
    touchAction: 'none',
    transform: `scale(${scale}) translate3d(${displayPosition.x}px, ${displayPosition.y}px, 0)`,
    transformOrigin: 'center center',
    transition: isDraggingRef.current ? 'none' : 'transform 0.3s ease',
    filter: `brightness(${item.brightness ?? 1}) contrast(${item.contrast ?? 1}) grayscale(${item.grayscale ?? 0})`,
  };

  return (
    <Tooltip 
      title={item.locked ? "Bị khóa" : (isEditing ? "Kéo để điều chỉnh. Nháy đúp hoặc click ra ngoài để hoàn tất." : "Nháy đúp để chỉnh sửa vị trí ảnh.")} 
      arrow 
      placement="top"
    >
      <Box
        ref={frameRef}
        sx={frameStyles}
        onDoubleClick={handleDoubleClick}
        onClick={(e) => {
          if (!isEditing) {
            e.stopPropagation();
            onSelectItem(item.id);
          }
        }}
        onMouseDown={(e) => { if (isEditing) e.stopPropagation(); }}
      >
        {isEditing && (
          <Box sx={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 10,
            boxShadow: 'inset 0 0 0 3px rgba(59, 130, 246, 0.7)', 
            background: 'rgba(59, 130, 246, 0.1)', 
            pointerEvents: 'none',
            borderRadius: item.shape === 'circle' ? '50%' : '0',
          }} />
        )}

        {item.locked && (
            <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 20, color: 'white', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', p: 0.5, pointerEvents: 'none' }}>
                <LockIcon fontSize="small" />
            </Box>
        )}

        <img
          ref={imageRef}
          src={item.url}
          alt="Đối tượng hình ảnh có thể kéo"
          style={imageStyles}
          onPointerDown={handlePointerDown}
          onDragStart={(e) => e.preventDefault()}
        />
      </Box>
    </Tooltip>
  );
};
const GenericImagePicker = ({ images, title, onItemClick }) => (
    <Box>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)', // <<< TẠO RA 3 CỘT BẰNG NHAU
            gap: 1.5,
            pt: 1,
            maxHeight: 'calc(100vh - 120px)',
            overflowY: 'auto'
        }}>
            {images.length === 0 ? (
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Grid>
            ) : (
                images.map(image => (
                    <DraggableSidebarItem data={{ id: image.id, url: image.url, type: 'image' }}>
                        <Card
                            onClick={() => onItemClick && onItemClick({ type: 'image', url: image.url })}
                            sx={{
                                cursor: 'grab',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': { transform: 'scale(1.04)', boxShadow: 3 },
                                aspectRatio: '1 / 1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <CardMedia component="img" image={image.url} alt={image.name}
                                sx={{ objectFit: 'contain', p: 1, maxHeight: '100%', maxWidth: '100%', pointerEvents: 'none' }}
                                onError={(e) => {
                                    const target = e.target; target.onerror = null;
                                    target.src = `https://placehold.co/100x100/EBF1FB/B0C7EE?text=Lỗi`;
                                }} />
                        </Card>
                    </DraggableSidebarItem>
                ))
            )}
        </Box>
    </Box>
);
const UserImageManager = ({ userImages, onSelectUserImage, onImageUploaded, isUploading, selectedIds, onToggleSelect }) => {
    const fileInputRef = useRef(null);
    const handleUploadButtonClick = () => fileInputRef.current?.click();

    const handleFileChange = (event) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            onImageUploaded(files);
        }
        if (event.currentTarget) {
           event.currentTarget.value = null;
        }
    };

    useEffect(() => {
        const fetchUserImages = async () => {
            try {
                const response = await api.get('/users/me/personal-images');
                onImageUploaded(response.data.data || [], true);
            } catch (error) {
                console.error("Lỗi khi tải ảnh cá nhân:", error);
                // Giảm thiểu báo lỗi phiền hà nếu user chưa có ảnh
            }
        };

        fetchUserImages();
    }, [onImageUploaded]);

    return (
        <Box>
            <Typography variant="h6" gutterBottom>Ảnh của bạn</Typography>
            <Button
                variant="contained"
                onClick={handleUploadButtonClick}
                startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                sx={{ mb: 2.5, width: '100%' }}
                size="large"
                disabled={isUploading}
            >
                {isUploading ? 'Đang tải lên...' : 'Tải ảnh lên'}
            </Button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
                multiple
            />
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 1.5,
                maxHeight: 'calc(100vh - 220px)',
                overflowY: 'auto',
                p: 0.5 // Thêm chút padding để khi hover shadow/transform không bị cắt
            }}>
                {userImages.map((img) => {
                    const isSelected = selectedIds.includes(img.id);
                    return (
                        <Box 
                            key={img.id} 
                            sx={{ 
                                position: 'relative', 
                                '&:hover .select-checkbox': { 
                                    opacity: 1, 
                                    transform: 'translateY(0)' 
                                } 
                            }}
                        >
                            {/* Checkbox độc lập, tuyệt đối không bọc trong Draggable */}
                            <Checkbox
                                className="select-checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    onToggleSelect(img.id);
                                }}
                                onPointerDown={(e) => e.stopPropagation()} // Chặn sự kiện dnd-kit bắt drag
                                onClick={(e) => e.stopPropagation()}       // Chặn sự kiện trigger click item
                                size="small"
                                sx={{
                                    position: 'absolute',
                                    top: 4,
                                    right: 4,
                                    zIndex: 10,
                                    // Logic Fade in & Move from top:
                                    opacity: isSelected ? 1 : 0,
                                    transform: isSelected ? 'translateY(0)' : 'translateY(-8px)',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    
                                    color: 'white',
                                    bgcolor: 'rgba(0,0,0,0.3)',
                                    p: 0.25,
                                    borderRadius: '4px',
                                    '&.Mui-checked': {
                                        color: 'primary.main',
                                        bgcolor: 'white'
                                    },
                                    '&:hover': {
                                        bgcolor: isSelected ? 'white' : 'rgba(0,0,0,0.6)'
                                    }
                                }}
                            />
                            
                            <DraggableSidebarItem data={{ id: img.id, url: img.url, type: 'image' }}>
                                <Card
                                    onClick={() => onSelectUserImage({ type: 'image', url: img.url })}
                                    sx={{
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s, box-shadow 0.2s, border 0.2s',
                                        '&:hover': { transform: 'scale(1.04)', boxShadow: 3 },
                                        aspectRatio: '1 / 1',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        // Viền sáng khi được chọn
                                        border: isSelected ? '2px solid' : '1px solid',
                                        borderColor: isSelected ? 'primary.main' : 'transparent',
                                    }}
                                >
                                    <CardMedia component="img" image={img.url} alt={img.name}
                                        sx={{
                                            objectFit: 'contain',
                                            p: 1,
                                            maxHeight: '100%',
                                            maxWidth: '100%',
                                            pointerEvents: 'none'
                                        }}
                                        onError={(e) => {
                                            const target = e.target; target.onerror = null;
                                            target.src = `https://placehold.co/120x120/EBF1FB/B0C7EE?text=Lỗi`;
                                        }} />
                                </Card>
                            </DraggableSidebarItem>
                        </Box>
                    );
                })}
            </Box>  
        </Box>
    );
};



const DraggableItemComponent = React.memo(({ item, onUpdateItem, isSelected, onSelectItem, zoomLevel, snapToGrid, gridSize, allItems, onSetSnapLines, snapToObject, children, canvasRef, id }) => {    const itemRef = useRef(null);
    const isLocked = item.locked;
    const [isTransforming, setIsTransforming] = useState(false);
    
    // --- BƯỚC 1: Thêm ref để lưu vị trí bắt đầu kéo ---
    const dragStartPos = useRef({ x: 0, y: 0 });

    const motionX = useMotionValue(item.x);
    const motionY = useMotionValue(item.y);
    const motionRotate = useMotionValue(item.rotation || 0);

    // // Dùng useEffect để đồng bộ motion values khi props thay đổi từ bên ngoài
    // useEffect(() => {
    //     motionX.set(item.x);
    //     motionY.set(item.y);
    //     motionRotate.set(item.rotation || 0);
    // }, [item.x, item.y, item.rotation, motionX, motionY, motionRotate]);


    // --- BƯỚC 3: Cập nhật handleDragStart ---
    const handleDragStart = (e, info) => {
        if (isLocked || isTransforming) return;
        dragStartPos.current = { x: item.x, y: item.y };
        onSelectItem(item.id);
    };


    // --- BƯỚC 4: Thêm hàm handleDrag từ phiên bản Admin ---
    const handleDrag = (e, info) => {
        if (isLocked || isTransforming) return;
        let newX = dragStartPos.current.x + info.offset.x / zoomLevel;
        let newY = dragStartPos.current.y + info.offset.y / zoomLevel;

        let guides = [];
        if (snapToObject) {
            const snapResult = calculateSnapping({ ...item, x: newX, y: newY }, allItems, zoomLevel);
            newX = snapResult.snappedX;
            newY = snapResult.snappedY;
            guides = snapResult.guides;
        }
        motionX.set(newX);
        motionY.set(newY);
        onSetSnapLines(guides);
    };
    
    // --- BƯỚC 5: Cập nhật handleDragEnd ---
    const handleDragEnd = (e, info) => {
        if (isLocked || isTransforming) return;
        let finalX = dragStartPos.current.x + info.offset.x / zoomLevel;
        let finalY = dragStartPos.current.y + info.offset.y / zoomLevel;

        const snapResult = calculateSnapping({ ...item, x: finalX, y: finalY }, allItems, zoomLevel);
        if (snapResult.guides.length > 0 && snapToObject) {
            finalX = snapResult.snappedX;
            finalY = snapResult.snappedY;
        } else if (snapToGrid && gridSize > 0) {
            finalX = Math.round(finalX / gridSize) * gridSize;
            finalY = Math.round(finalY / gridSize) * gridSize;
        }

        onSetSnapLines([]);
        onUpdateItem(item.id, { x: finalX, y: finalY }, true);
    };

    // createResizeHandler và handleRotateStart giữ nguyên không đổi...
    // createResizeHandler, handleRotateStart functions here...
    const createResizeHandler = (handleName) => (e) => {
        e.stopPropagation();
        setIsTransforming(true);
        onSelectItem(item.id);
        const startItem = { ...item };
        const angleRad = (startItem.rotation || 0) * (Math.PI / 180);
        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);
        const aspectRatio = startItem.width / startItem.height;
        const startMouseX = e.clientX;
        const startMouseY = e.clientY;
        const handleMove = (moveEvent) => {
            const isProportional = moveEvent.shiftKey;
            const mouseDx = (moveEvent.clientX - startMouseX) / zoomLevel;
            const mouseDy = (moveEvent.clientY - startMouseY) / zoomLevel;
            const localDx = mouseDx * cos + mouseDy * sin;
            const localDy = -mouseDx * sin + mouseDy * cos;
            let dw = 0;
            let dh = 0;
            if (handleName.includes('right')) dw = localDx;
            if (handleName.includes('left')) dw = -localDx;
            if (handleName.includes('bottom')) dh = localDy;
            if (handleName.includes('top')) dh = -localDy;
            if (isProportional) {
                const isCorner = handleName.includes('-');
                if (isCorner) {
                    if (Math.abs(localDx) > Math.abs(localDy)) {
                        dh = dw / aspectRatio;
                    } else {
                        dw = dh * aspectRatio;
                    }
                } else {
                    if (handleName.includes('left') || handleName.includes('right')) {
                        dh = dw / aspectRatio;
                    } else {
                        dw = dh * aspectRatio;
                    }
                }
            }
            let newWidth = startItem.width + dw;
            let newHeight = startItem.height + dh;
            if (newWidth < MIN_ITEM_WIDTH) {
                newWidth = MIN_ITEM_WIDTH;
                if (isProportional) newHeight = newWidth / aspectRatio;
            }
            if (newHeight < MIN_ITEM_HEIGHT) {
                newHeight = MIN_ITEM_HEIGHT;
                if (isProportional) newWidth = newHeight * aspectRatio;
            }
            const finalDw = newWidth - startItem.width;
            const finalDh = newHeight - startItem.height;
            let deltaCenterX = finalDw / 2;
            let deltaCenterY = finalDh / 2;
            if (handleName.includes('left')) deltaCenterX = -finalDw / 2;
            if (handleName.includes('top')) deltaCenterY = -finalDh / 2;
            if (handleName === 'left' || handleName === 'right') deltaCenterY = 0;
            if (handleName === 'top' || handleName === 'bottom') deltaCenterX = 0;
            const rotatedShiftX = deltaCenterX * cos - deltaCenterY * sin;
            const rotatedShiftY = deltaCenterX * sin + deltaCenterY * cos;
            const startCenterX = startItem.x + startItem.width / 2;
            const startCenterY = startItem.y + startItem.height / 2;
            const newCenterX = startCenterX + rotatedShiftX;
            const newCenterY = startCenterY + rotatedShiftY;
            const newX = newCenterX - newWidth / 2;
            const newY = newCenterY - newHeight / 2;
            const newProps = {
                width: newWidth,
                height: newHeight,
                x: newX,
                y: newY,
            };
            onUpdateItem(item.id, newProps, false);
        };
        const handleEnd = () => {
            window.removeEventListener('pointermove', handleMove);
            window.removeEventListener('pointerup', handleEnd);
            onUpdateItem(item.id, {}, true);
            setTimeout(() => { setIsTransforming(false); }, 0);
        };
        window.addEventListener('pointermove', handleMove);
        window.addEventListener('pointerup', handleEnd);
    };

    const handleRotateStart = (e) => {
        e.stopPropagation();
        setIsTransforming(true);
        onSelectItem(item.id);
        if (!itemRef.current) return;
        const rect = itemRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        const initialRotation = motionRotate.get();
        const handleRotateMove = (moveEvent) => {
            const currentX = moveEvent.clientX;
            const currentY = moveEvent.clientY;
            const currentAngle = Math.atan2(currentY - centerY, currentX - centerX);
            const angleDiff = (currentAngle - startAngle) * (180 / Math.PI);
            let newRotation = initialRotation + angleDiff;
            if (snapToGrid || snapToObject) {
                newRotation = Math.round(newRotation / ROTATION_SNAP_ANGLE) * ROTATION_SNAP_ANGLE;
            }
            motionRotate.set(newRotation);
        };
        const handleRotateEnd = () => {
            window.removeEventListener('pointermove', handleRotateMove);
            window.removeEventListener('pointerup', handleRotateEnd);
            onUpdateItem(item.id, { rotation: motionRotate.get() }, true);
            setTimeout(() => {
                setIsTransforming(false);
            }, 0);
        };
        window.addEventListener('pointermove', handleRotateMove);
        window.addEventListener('pointerup', handleRotateEnd);
    };


    return (
        // --- BƯỚC 6: Cập nhật các props cho DraggableItem ---
        <DraggableItem
            ref={itemRef}
            drag={!isTransforming && !isLocked && !item.isEditing}
            dragMomentum={false}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            style={{
                x: motionX, // Dùng motion value
                y: motionY, // Dùng motion value
                rotate: motionRotate,
                zIndex: isSelected ? item.zIndex + 1000 : item.zIndex,
                width: item.width,
                height: item.height,
                border: isSelected ? `1.5px solid ${BORDER_COLOR}` : `1.5px solid transparent`,
                transformOrigin: 'center center',
                opacity: item.opacity,
                cursor: isLocked ? 'not-allowed' : 'grab',
            }}
            id={id}
        >
            {children}
            {isSelected && !isLocked && (
                <>
                    <div style={{ ...MinimalHandleStyle, top: `-${HANDLE_OFFSET}px`, left: `-${HANDLE_OFFSET}px`, cursor: 'nwse-resize' }} onPointerDown={createResizeHandler('top-left')} />
                    <div style={{ ...MinimalHandleStyle, top: `-${HANDLE_OFFSET}px`, right: `-${HANDLE_OFFSET}px`, cursor: 'nesw-resize' }} onPointerDown={createResizeHandler('top-right')} />
                    <div style={{ ...MinimalHandleStyle, bottom: `-${HANDLE_OFFSET}px`, left: `-${HANDLE_OFFSET}px`, cursor: 'nesw-resize' }} onPointerDown={createResizeHandler('bottom-left')} />
                    <div style={{ ...MinimalHandleStyle, bottom: `-${HANDLE_OFFSET}px`, right: `-${HANDLE_OFFSET}px`, cursor: 'nwse-resize' }} onPointerDown={createResizeHandler('bottom-right')} />
                    <div style={{ ...MinimalHandleStyle, top: `calc(50% - ${HANDLE_OFFSET}px)`, left: `-${HANDLE_OFFSET}px`, cursor: 'ew-resize' }} onPointerDown={createResizeHandler('left')} />
                    <div style={{ ...MinimalHandleStyle, top: `calc(50% - ${HANDLE_OFFSET}px)`, right: `-${HANDLE_OFFSET}px`, cursor: 'ew-resize' }} onPointerDown={createResizeHandler('right')} />
                    <div style={{ ...MinimalHandleStyle, top: `-${HANDLE_OFFSET}px`, left: `calc(50% - ${HANDLE_OFFSET}px)`, cursor: 'ns-resize' }} onPointerDown={createResizeHandler('top')} />
                    <div style={{ ...MinimalHandleStyle, bottom: `-${HANDLE_OFFSET}px`, left: `calc(50% - ${HANDLE_OFFSET}px)`, cursor: 'ns-resize' }} onPointerDown={createResizeHandler('bottom')} />
                    <RotateLine />
                    <div style={RotateHandleStyle} onPointerDown={handleRotateStart} />
                </>
            )}
        </DraggableItem>
    );
});


const TextEditor = (props) => {
    const { item, onUpdateItem, onSelectItem } = props;
    const inputRef = useRef(null);
    const isLocked = item.locked;
    const textStyle = {
        fontSize: `${item.fontSize || 16}px`,
        fontFamily: item.fontFamily || 'Arial',
        color: item.color || '#000000',
        fontWeight: item.fontWeight || 'normal',
        fontStyle: item.fontStyle || 'normal',
        textDecoration: item.textDecoration || 'none',
        textAlign: item.textAlign || 'center',
        lineHeight: 1.4,
        padding: '5px',
        boxSizing: 'border-box',
        width: '100%',
        height: '100%',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        backgroundColor: 'transparent',
    };
    const handleBlur = () => onUpdateItem(item.id, { isEditing: false }, true);
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleBlur();
        }
    };
    useLayoutEffect(() => {
        if (!item.isEditing && inputRef.current) {
            const scrollHeight = inputRef.current.scrollHeight;
            if (Math.abs(scrollHeight - item.height) > 2) {
                onUpdateItem(item.id, { height: scrollHeight }, false);
            }
        }
    }, [item.content, item.fontSize, item.fontFamily, item.width, item.isEditing, item.fontWeight, item.fontStyle, item.textAlign, item.height, onUpdateItem, item.id]);
    return (
        <DraggableItemComponent {...props}>
            {item.isEditing && !isLocked ? (
                <textarea
                    ref={inputRef}
                    value={item.content}
                    onChange={(e) => onUpdateItem(item.id, { content: e.target.value.slice(0, MAX_TEXT_LENGTH) }, false)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        ...textStyle,
                        resize: 'none',
                        border: 'none',
                        outline: 'none',
                        overflow: 'hidden'
                    }}
                    autoFocus
                />
            ) : (
                <Box
                    sx={{
                        ...textStyle,
                        userSelect: 'none',
                        cursor: 'inherit',
                        display: 'flex', // Changed
                        alignItems: 'center', // Changed
                        justifyContent: 'center',
                        padding: '10px 5px',
                    }}
                    onDoubleClick={(e) => { if (!isLocked) { e.stopPropagation(); onUpdateItem(item.id, { isEditing: true }, true); } }}
                    onClick={(e) => { if (!item.isEditing) { e.stopPropagation(); onSelectItem(item.id); } }}
                >
                    {item.content || "Văn bản"}
                </Box>
            )}
        </DraggableItemComponent>
    );
};
const ImageEditor = React.memo((props) => {
    const { item, onSelectItem, onUpdateItem } = props; // Lấy thêm onUpdateItem

    // Giữ lại placeholder của bạn
    const placeholder = (
        <Box
            style={{ 
                width: '100%', 
                height: '100%', 
                backgroundColor: '#f0f0f0', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#888', 
                cursor: 'pointer', 
                textAlign: 'center', 
                padding: '10px', 
                boxSizing: 'border-box',
                // Đảm bảo placeholder cũng có hình dạng đúng
                borderRadius: item.shape === 'circle' ? '50%' : '0' 
            }}
            onClick={(e) => {
                e.stopPropagation();
                onSelectItem(item.id);
            }}
        >
            <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1}}>
                <BrokenImageIcon />
                Chọn ảnh
            </Box>
        </Box>
    );

    return (
        <DraggableItemComponent {...props}>
            {item.url ? (
                // Dùng component mới khi có ảnh
                <PannableImageFrame 
                    item={item} 
                    onUpdateItem={onUpdateItem} 
                    onSelectItem={onSelectItem}
                />
            ) : (
                // Dùng placeholder khi không có ảnh
                placeholder
            )}
        </DraggableItemComponent>
    );
});

const TextPropertyEditor = ({ item, onUpdate, customFonts }) => {
    const theme = useTheme();
    const [displayColorPicker, setDisplayColorPicker] = useState(false);
    
    // Thêm state quản lý filter font
    const [fontFilter, setFontFilter] = useState('All');

    // Cập nhật Live (kéo thanh màu thì đổi màu ngay nhưng KHÔNG lưu vào lịch sử Undo)
    const handleColorChangeLive = (color) => {
        // Hỗ trợ cả mã HEX và RGBA (nếu có độ trong suốt)
        const colorValue = color.rgb.a !== 1 
            ? `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})` 
            : color.hex;
        onUpdate(item.id, { color: colorValue }, false); 
    };

    // Khi thả chuột ra mới chính thức lưu vào lịch sử Undo/Redo
    const handleColorChangeComplete = (color) => {
        const colorValue = color.rgb.a !== 1 
            ? `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})` 
            : color.hex;
        onUpdate(item.id, { color: colorValue }, true); 
    };

    // Hàm riêng cho các nút bấm màu nhanh bên ngoài
    const handleQuickColorSelect = (colorHex) => {
        onUpdate(item.id, { color: colorHex }, true);
    };

    const PRESET_COLORS = ['#000000', '#FFFFFF', '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
    
    // Dải màu mở rộng cho bảng chọn nâng cao
    const EXTENDED_PRESET_COLORS = [
        '#D0021B', '#F5A623', '#F8E71C', '#8B572A', '#7ED321', '#417505',
        '#BD10E0', '#9013FE', '#4A90E2', '#50E3C2', '#B8E986', '#000000',
        '#4A4A4A', '#9B9B9B', '#FFFFFF', '#3B82F6', '#10B981', '#EF4444'
    ];
    
    // Xử lý logic filter font
    const filteredCustomFonts = customFonts.filter(f => {
        if (fontFilter === 'All') return true;
        if (fontFilter === 'General') return !f.category || f.category === 'General';
        return f.category === fontFilter;
    });

    const showSystemFonts = fontFilter === 'All' || fontFilter === 'General';
    let availableFonts = [
        ...(showSystemFonts ? FONT_FAMILIES : []),
        ...filteredCustomFonts.map(f => f.name)
    ];

    if (item.fontFamily && !availableFonts.includes(item.fontFamily)) {
        availableFonts = [item.fontFamily, ...availableFonts];
    }
    availableFonts = [...new Set(availableFonts)]; 

    return (
        <Box component="form" noValidate autoComplete="off" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
                label="Nội dung"
                value={item.content}
                onChange={(e) => onUpdate(item.id, { content: e.target.value.slice(0, MAX_TEXT_LENGTH) }, false)}
                onBlur={() => onUpdate(item.id, {}, true)}
                fullWidth margin="none" size="small" variant="outlined" multiline rows={3}
                inputProps={{ maxLength: MAX_TEXT_LENGTH }}
            />
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <TextField label="Rộng (px)" type="number" value={Math.round(item.width)} onChange={(e) => onUpdate(item.id, { width: parseInt(e.target.value, 10) || MIN_ITEM_WIDTH }, false)} onBlur={() => onUpdate(item.id, {}, true)} fullWidth margin="none" size="small" variant="outlined" InputProps={{ inputProps: { min: MIN_ITEM_WIDTH } }} />
                </Grid>
                <Grid item xs={6}>
                    <TextField label="Cao (px)" type="number" value={Math.round(item.height)} onChange={(e) => onUpdate(item.id, { height: parseInt(e.target.value, 10) || MIN_ITEM_HEIGHT }, false)} onBlur={() => onUpdate(item.id, {}, true)} fullWidth margin="none" size="small" variant="outlined" InputProps={{ inputProps: { min: MIN_ITEM_HEIGHT } }} />
                </Grid>
            </Grid>
            
            <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Lọc Font chữ:</Typography>
                <ToggleButtonGroup
                    value={fontFilter}
                    exclusive
                    onChange={(e, newVal) => { if(newVal) setFontFilter(newVal); }}
                    size="small"
                    sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 0.5,
                        '& .MuiToggleButtonGroup-grouped': {
                            border: `1px solid ${theme.palette.divider} !important`,
                            borderRadius: '16px !important',
                            textTransform: 'none',
                            px: 1.5,
                            py: 0.25,
                            '&.Mui-selected': {
                                bgcolor: 'primary.main',
                                color: 'white',
                                '&:hover': { bgcolor: 'primary.dark' }
                            }
                        }
                    }}
                >
                    <ToggleButton value="All">Tất cả</ToggleButton>
                    <ToggleButton value="Wedding">Cưới</ToggleButton>
                    <ToggleButton value="Vietnamese">Tiếng Việt</ToggleButton>
                    <ToggleButton value="Uppercase">Viết hoa</ToggleButton>
                    <ToggleButton value="General">Khác</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <FormControl fullWidth margin="none" size="small">
                <InputLabel id="font-family-label">Font</InputLabel>
                <Select
                    labelId="font-family-label"
                    value={item.fontFamily}
                    label="Font"
                    onChange={(e) => onUpdate(item.id, { fontFamily: e.target.value }, true)}
                    MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
                >
                    {availableFonts.length > 0 ? availableFonts.map(font => (
                        <MenuItem key={font} value={font} style={{ fontFamily: font }}>
                            {font}
                        </MenuItem>
                    )) : (
                        <MenuItem disabled>Không có font phù hợp</MenuItem>
                    )}
                </Select>
            </FormControl>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <TextField
                        label="Cỡ chữ"
                        type="number"
                        value={item.fontSize}
                        onChange={(e) => {
                            const newSize = Math.max(8, Math.min(200, parseInt(e.target.value, 10) || 12));
                            onUpdate(item.id, { fontSize: newSize }, false);
                        }}
                        onBlur={() => onUpdate(item.id, {}, true)}
                        fullWidth margin="none" size="small" variant="outlined"
                        InputProps={{ inputProps: { min: 8, max: 200 } }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Màu chữ</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                        {PRESET_COLORS.map(color => (
                            <Tooltip key={color} title={color}>
                                <IconButton
                                    onClick={() => handleQuickColorSelect(color)}
                                    sx={{
                                        width: 28, height: 28, bgcolor: color,
                                        border: `2px solid ${item.color === color ? theme.palette.primary.main : 'transparent'}`,
                                        '&:hover': { bgcolor: color, opacity: 0.8 }
                                    }}
                                />
                            </Tooltip>
                        ))}
                        
                        <Tooltip title="Bảng màu nâng cao">
                            <IconButton onClick={() => setDisplayColorPicker(true)} sx={{ border: '1px dashed', borderColor: 'divider', width: 28, height: 28 }}>
                                <PaletteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        {/* Thay thế Dropdown cũ bằng Dialog Modal ở giữa màn hình */}
                        <Dialog 
                            open={displayColorPicker} 
                            onClose={() => setDisplayColorPicker(false)}
                            maxWidth="xs"
                            fullWidth
                            PaperProps={{
                                sx: {
                                    borderRadius: 3, 
                                    p: 1
                                }
                            }}
                        >
                            <DialogTitle sx={{ pb: 1, fontWeight: '700', fontSize: '1.1rem', color: 'text.primary' }}>
                                Tùy chỉnh màu sắc
                            </DialogTitle>
                            <DialogContent sx={{ display: 'flex', justifyContent: 'center', pb: 2, pt: '10px !important' }}>
                                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                    <SketchPicker 
                                        color={item.color || '#000000'} 
                                        onChange={handleColorChangeLive} 
                                        onChangeComplete={handleColorChangeComplete}
                                        width="100%"
                                        presetColors={EXTENDED_PRESET_COLORS}
                                        disableAlpha={false} // Cho phép chỉnh độ mờ (opacity)
                                        style={{ boxShadow: 'none' }}
                                    />
                                </Box>
                            </DialogContent>
                            <DialogActions sx={{ px: 3, pb: 2 }}>
                                <Button onClick={() => setDisplayColorPicker(false)} variant="outlined" color="inherit" sx={{ fontWeight: 600 }}>
                                    Đóng
                                </Button>
                                <Button onClick={() => setDisplayColorPicker(false)} variant="contained" color="primary" sx={{ fontWeight: 600 }}>
                                    Hoàn tất
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </Box>
                </Grid>
            </Grid>
            <Box>
                <Typography gutterBottom variant="body2" color="text.secondary">Xoay (độ)</Typography>
                <Slider value={item.rotation || 0} onChange={(_e, newValue) => onUpdate(item.id, { rotation: newValue }, false)} onChangeCommitted={() => onUpdate(item.id, {}, true)} aria-labelledby="rotation-slider" valueLabelDisplay="auto" step={1} marks min={-180} max={180} size="small" />
            </Box>
            <Divider sx={{ my: 1 }} />
            <Button
                variant={item.isGuestName ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => onUpdate(item.id, { isGuestName: !item.isGuestName }, true)}
                fullWidth
            >
                {item.isGuestName ? 'Đã đặt làm Tên Khách Mời' : 'Đặt làm Tên Khách Mời'}
            </Button>
        </Box>
    );
}
const ImagePropertyEditor = ({ item, onUpdate, onScaleToCanvas }) => {
    const [liveBrightness, setLiveBrightness] = useState(item.brightness ?? 1);
    const [liveContrast, setLiveContrast] = useState(item.contrast ?? 1);
    const [liveGrayscale, setLiveGrayscale] = useState(item.grayscale ?? 0);
    useEffect(() => {
        setLiveBrightness(item.brightness ?? 1);
        setLiveContrast(item.contrast ?? 1);
        setLiveGrayscale(item.grayscale ?? 0);
    }, [item.id, item.brightness, item.contrast, item.grayscale]);
    const handleBrightnessCommit = () => onUpdate(item.id, { brightness: liveBrightness }, true);
    const handleContrastCommit = () => onUpdate(item.id, { contrast: liveContrast }, true);
    const handleGrayscaleCommit = () => onUpdate(item.id, { grayscale: liveGrayscale }, true);
    return (
        <Box component="form" noValidate autoComplete="off" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <TextField label="Rộng (px)" type="number" value={Math.round(item.width)} onChange={(e) => onUpdate(item.id, { width: parseInt(e.target.value, 10) || MIN_ITEM_WIDTH }, false)} onBlur={() => onUpdate(item.id, {}, true)} fullWidth margin="none" size="small" variant="outlined" InputProps={{ inputProps: { min: MIN_ITEM_WIDTH } }} />
                </Grid>
                <Grid item xs={6}>
                    <TextField label="Cao (px)" type="number" value={Math.round(item.height)} onChange={(e) => onUpdate(item.id, { height: parseInt(e.target.value, 10) || MIN_ITEM_HEIGHT }, false)} onBlur={() => onUpdate(item.id, {}, true)} fullWidth margin="none" size="small" variant="outlined" InputProps={{ inputProps: { min: MIN_ITEM_HEIGHT } }} />
                </Grid>
            </Grid>
            <Box>
                <Typography gutterBottom variant="body2" color="text.secondary">
                    Hình dạng Khung
                </Typography>
                <ToggleButtonGroup
                    value={item.shape || 'square'}
                    exclusive
                    onChange={(_e, newShape) => {
                        if (newShape) onUpdate(item.id, { shape: newShape }, true);
                    }}
                    aria-label="shape"
                    size="medium" 
                    fullWidth
                    sx={{
                        // Style tùy chỉnh để căn giữa icon và text
                        '& .MuiToggleButton-root': {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                            py: 1.5,
                            textTransform: 'none',
                            border: '1px solid rgba(0, 0, 0, 0.12)'
                        },
                        '& .Mui-selected': {
                            backgroundColor: 'rgba(59, 130, 246, 0.1) !important', // Màu nền nhẹ khi active (theo theme xanh của bạn)
                            color: '#3B82F6 !important', // Màu icon khi active
                            borderColor: '#3B82F6 !important'
                        }
                    }}
                >
                    <ToggleButton value="square" aria-label="vuông" sx={{ flex: 1 }}>
                        {/* Minh họa Khung Vuông bằng CSS */}
                        <Box sx={{
                            width: 36,
                            height: 36,
                            border: '2px solid currentColor', // Dùng currentColor để ăn theo màu text của nút
                            borderRadius: '4px', // Bo góc nhẹ cho hiện đại
                            bgcolor: 'transparent',
                            transition: 'all 0.2s'
                        }} />
                        <Typography variant="caption" sx={{ fontWeight: 500 }}>Hình Vuông</Typography>
                    </ToggleButton>

                    <ToggleButton value="circle" aria-label="tròn" sx={{ flex: 1 }}>
                        {/* Minh họa Khung Tròn bằng CSS */}
                        <Box sx={{
                            width: 36,
                            height: 36,
                            border: '2px solid currentColor',
                            borderRadius: '50%', // Bo tròn hoàn toàn
                            bgcolor: 'transparent',
                            transition: 'all 0.2s'
                        }} />
                        <Typography variant="caption" sx={{ fontWeight: 500 }}>Hình Tròn</Typography>
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>
            <Box>
                <Typography gutterBottom variant="body2" color="text.secondary">Xoay (độ)</Typography>
                <Slider value={item.rotation || 0} onChange={(_e, newValue) => onUpdate(item.id, { rotation: newValue }, false)} onChangeCommitted={() => onUpdate(item.id, {}, true)} aria-labelledby="rotation-slider" valueLabelDisplay="auto" step={1} marks min={-180} max={180} size="small" />
            </Box>
            <Divider sx={{ my: 1 }} />
            <Button
                variant="outlined"
                startIcon={<CropFreeIcon />}
                onClick={() => onScaleToCanvas(item.id)}
                disabled={!item.url || item.locked}
                fullWidth
                size="medium"
            >
                Vừa với Canvas
            </Button>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1" gutterBottom fontWeight="500">Hiệu ứng</Typography>
            <Box>
                <Typography gutterBottom variant="body2" color="text.secondary">Độ sáng</Typography>
                <Slider value={liveBrightness} onChange={(_e, val) => { setLiveBrightness(val); onUpdate(item.id, { brightness: val }, false); }} onChangeCommitted={handleBrightnessCommit} min={0} max={2} step={0.05} size="small" />
            </Box>
            <Box>
                <Typography gutterBottom variant="body2" color="text.secondary">Tương phản</Typography>
                <Slider value={liveContrast} onChange={(_e, val) => { setLiveContrast(val); onUpdate(item.id, { contrast: val }, false); }} onChangeCommitted={handleContrastCommit} min={0} max={2} step={0.05} size="small" />
            </Box>
            <Box>
                <Typography gutterBottom variant="body2" color="text.secondary">Trắng đen</Typography>
                <Slider value={liveGrayscale} onChange={(_e, val) => { setLiveGrayscale(val); onUpdate(item.id, { grayscale: val }, false); }} onChangeCommitted={handleGrayscaleCommit} min={0} max={1} step={0.05} size="small" />
            </Box>
        </Box>
    );
};
const TextToolbar = ({ item, onUpdate }) => {
    const theme = useTheme();
    const toggleStyle = (property, value, defaultValue) => {
        onUpdate(item.id, { [property]: item[property] === value ? defaultValue : value }, true);
    };
    const selectedButtonStyle = {
        bgcolor: alpha(theme.palette.primary.main, 0.1),
        color: 'primary.main',
    };
    return (
        <Paper elevation={0} sx={{ p: 1, mb: 2, display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap', border: `1px solid ${theme.palette.divider}` }}>
            <ButtonGroup size="small" variant="outlined" aria-label="text formatting">
                <Tooltip title="In Đậm (Ctrl+B)">
                    <IconButton onClick={() => toggleStyle('fontWeight', 'bold', 'normal')} sx={item.fontWeight === 'bold' ? selectedButtonStyle : {}}>
                        <FormatBoldIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="In Nghiêng (Ctrl+I)">
                    <IconButton onClick={() => toggleStyle('fontStyle', 'italic', 'normal')} sx={item.fontStyle === 'italic' ? selectedButtonStyle : {}}>
                        <FormatItalicIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Gạch Chân (Ctrl+U)">
                    <IconButton onClick={() => toggleStyle('textDecoration', 'underline', 'none')} sx={item.textDecoration === 'underline' ? selectedButtonStyle : {}}>
                        <FormatUnderlinedIcon />
                    </IconButton>
                </Tooltip>
            </ButtonGroup>
            <Divider orientation="vertical" flexItem />
            <ButtonGroup size="small" variant="outlined" aria-label="text alignment">
                <Tooltip title="Căn Trái">
                    <IconButton onClick={() => onUpdate(item.id, { textAlign: 'left' }, true)} sx={item.textAlign === 'left' ? selectedButtonStyle : {}}>
                        <FormatAlignLeftIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Căn Giữa">
                    <IconButton onClick={() => onUpdate(item.id, { textAlign: 'center' }, true)} sx={item.textAlign === 'center' ? selectedButtonStyle : {}}>
                        <FormatAlignCenterIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Căn Phải">
                    <IconButton onClick={() => onUpdate(item.id, { textAlign: 'right' }, true)} sx={item.textAlign === 'right' ? selectedButtonStyle : {}}>
                        <FormatAlignRightIcon />
                    </IconButton>
                </Tooltip>
            </ButtonGroup>
        </Paper>
    );
};
const BlankCanvasCreator = ({ onCreate }) => {
    const [category, setCategory] = useState(Object.keys(STANDARD_SIZES)[0]);
    const [sizeKey, setSizeKey] = useState(Object.keys(STANDARD_SIZES[Object.keys(STANDARD_SIZES)[0]])[0]);
    const [isCustomSize, setIsCustomSize] = useState(false);
    const [customWidth, setCustomWidth] = useState(10);
    const [customHeight, setCustomHeight] = useState(15);
    const [backgroundType, setBackgroundType] = useState('color');
    const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
    const [backgroundImageFile, setBackgroundImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const fileInputRef = useRef(null);

    const handleCategoryChange = (event) => {
        const newCategory = event.target.value;
        setCategory(newCategory);
        setSizeKey(Object.keys(STANDARD_SIZES[newCategory])[0]);
        setIsCustomSize(false);
    };

    const handleSizeChange = (event) => {
        const value = event.target.value;
        if (value === 'custom') {
            setIsCustomSize(true);
        } else {
            setIsCustomSize(false);
            setSizeKey(value);
        }
    };
    
    const handleCustomDimChange = (setter) => (event) => {
        // Chỉ cập nhật giá trị thô vào state để người dùng thoải mái gõ phím
        setter(event.target.value);
    };

    const handleCustomDimBlur = (setter, value) => () => {
        if (value === '') {
            setter(10); // Đặt về giá trị mặc định nếu người dùng xóa trắng rồi click ra ngoài
            return;
        }
        
        let numValue = parseFloat(value);
        
        if (isNaN(numValue)) {
            setter(10);
            return;
        }
        
        // Chỉ ép (clamp) kích thước khi người dùng đã gõ xong và click ra ngoài (Blur)
        if (numValue < 0) numValue = 0;
        if (numValue > 200) numValue = 200;
        
        setter(numValue);
    };

    const handleCustomDimKeyDown = (setter, value) => (event) => {
        // Nếu người dùng bấm phím Enter
        if (event.key === 'Enter') {
            event.preventDefault(); // Ngăn hành vi mặc định (như submit form ngoài ý muốn)
            
            // Gọi lại đúng logic kiểm tra của onBlur
            handleCustomDimBlur(setter, value)();
            
            // (Tuỳ chọn) Làm mất focus của ô input sau khi bấm Enter để UX giống với khi click ra ngoài
            event.target.blur(); 
        }
    };

    const handleBackgroundTypeChange = (event, newType) => {
        if (newType !== null) {
            setBackgroundType(newType);
        }
    };

    const handleImageFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setBackgroundImageFile(file);
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    const handleCreateClick = () => {
        let dimensions;
        if (isCustomSize) {
            if (customWidth < 3 || customWidth > 30 || customHeight < 3 || customHeight > 30) {
                toast.warn('Kích thước tùy chỉnh phải nằm trong khoảng từ 3cm đến 30cm.');
                return;
            }
            dimensions = fitToCanvas(customWidth, customHeight);
        } else {
            dimensions = STANDARD_SIZES[category][sizeKey];
        }

        const background = {
            type: backgroundType,
            value: backgroundType === 'color' ? backgroundColor : backgroundImageFile,
        };
        onCreate(dimensions.width, dimensions.height, background);
    };

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    return (
        <Paper variant="outlined" sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, bgcolor: 'transparent', borderStyle: 'dashed' }}>
            <Typography variant="subtitle1" fontWeight="600" color="text.primary">Tạo mới từ đầu</Typography>
            <FormControl fullWidth size="small">
                <InputLabel>Loại thiệp</InputLabel>
                <Select value={category} label="Loại thiệp" onChange={handleCategoryChange}>
                    {Object.keys(STANDARD_SIZES).map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                </Select>
            </FormControl>
            <FormControl fullWidth size="small">
                <InputLabel>Kích thước</InputLabel>
                <Select value={isCustomSize ? 'custom' : sizeKey} label="Kích thước" onChange={handleSizeChange}>
                    {Object.keys(STANDARD_SIZES[category]).map(key => <MenuItem key={key} value={key}>{key}</MenuItem>)}
                    <MenuItem value="custom">Tùy chỉnh kích thước...</MenuItem>
                </Select>
            </FormControl>

            {isCustomSize && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <Grid container spacing={2} sx={{ alignItems: 'center', mt: 1 }}>
                        <Grid item xs={6}>
                            <TextField
                                label="Rộng (cm)"
                                type="number"
                                value={customWidth}
                                onChange={handleCustomDimChange(setCustomWidth)}
                                onBlur={handleCustomDimBlur(setCustomWidth, customWidth)}
                                onKeyDown={handleCustomDimKeyDown(setCustomWidth, customWidth)} // <--- THÊM DÒNG NÀY
                                fullWidth
                                size="small"
                                inputProps={{ min: 3, max: 30, step: 0.1 }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Cao (cm)"
                                type="number"
                                value={customHeight}
                                onChange={handleCustomDimChange(setCustomHeight)}
                                onBlur={handleCustomDimBlur(setCustomHeight, customHeight)}
                                onKeyDown={handleCustomDimKeyDown(setCustomHeight, customHeight)} // <--- THÊM DÒNG NÀY
                                fullWidth
                                size="small"
                                inputProps={{ min: 3, max: 30, step: 0.1 }}
                            />
                        </Grid>
                    </Grid>
                </motion.div>
            )}

            <Divider />
            <Typography variant="subtitle2" fontWeight="500">Nền trang</Typography>
            <ToggleButtonGroup
                color="primary"
                value={backgroundType}
                exclusive
                onChange={handleBackgroundTypeChange}
                aria-label="Background Type"
                fullWidth
                size="small"
            >
                <ToggleButton value="color">Màu sắc</ToggleButton>
                <ToggleButton value="image">Ảnh nền</ToggleButton>
            </ToggleButtonGroup>
            {backgroundType === 'color' ? (
                <TextField
                    label="Màu nền"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    fullWidth
                    size="small"
                    variant="outlined"
                    sx={{ '& input[type=color]': { height: '40px', padding: '4px' } }}
                />
            ) : (
                <Box>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageFileChange}
                        style={{ display: 'none' }}
                    />
                    <Button
                        variant="outlined"
                        onClick={() => fileInputRef.current.click()}
                        fullWidth
                    >
                        Chọn ảnh nền
                    </Button>
                    {imagePreview && (
                        <Box
                            mt={2}
                            sx={{
                                height: 100,
                                borderRadius: 1,
                                border: '1px dashed',
                                borderColor: 'divider',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundImage: `url(${imagePreview})`,
                            }}
                        />
                    )}
                </Box>
            )}
            <Divider />
            <Button onClick={handleCreateClick} variant="contained" startIcon={<AddIcon />} size="large">
                Tạo thiệp mới
            </Button>
        </Paper>
    );
};

const SortableLayerItem = ({ id, item, selectedItemId, onSelectItem, onToggleVisibility, onToggleLock }) => {
    const theme = useTheme();
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <ListItem
            ref={setNodeRef}
            style={style}
            onClick={() => onSelectItem(item.id)}
            sx={{
                bgcolor: selectedItemId === item.id ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                border: `1px solid ${selectedItemId === item.id ? theme.palette.primary.main : theme.palette.divider}`,
                borderRadius: 1.5,
                mb: 1,
                transition: 'background-color 0.2s, border-color 0.2s',
                cursor: 'pointer',
                p: 0.5,
                '&:hover': {
                    bgcolor: selectedItemId !== item.id ? alpha(theme.palette.text.secondary, 0.05) : undefined,
                }
            }}
            secondaryAction={
                <Box>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); onToggleLock(item.id); }}>
                        {item.locked ? <LockIcon fontSize="small" color="primary" /> : <LockOpenIcon fontSize="small" />}
                    </IconButton>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); onToggleVisibility(item.id); }}>
                        {item.visible === false ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                </Box>
            }
        >
            <Box {...attributes} {...listeners} sx={{ cursor: 'grab', display: 'flex', alignItems: 'center', px: 1, color: 'text.secondary' }}>
                <DragIndicatorIcon fontSize="small" />
            </Box>
            <ListItemIcon sx={{ minWidth: 24, mr: 1, color: 'text.secondary' }}>
                {item.type === 'text' ? <TextFieldsIcon fontSize="small" /> : <ImageIcon fontSize="small" />}
            </ListItemIcon>
            <ListItemText
                primary={item.type === 'text' ? (item.content || "Văn bản trống") : 'Hình ảnh'}
                primaryTypographyProps={{ noWrap: true, sx: { opacity: item.visible === false ? 0.5 : 1, fontWeight: selectedItemId === item.id ? '500' : '400' } }}
            />
        </ListItem>
    );
};
const LayersPanel = ({ items, selectedItemId, onSelectItem, onToggleVisibility, onToggleLock }) => {
    // Items are now sorted by zIndex ascending in the parent, so we reverse to show top layer first
    const reversedItems = [...items].reverse();
    return (
        <List dense sx={{ p: 0 }}>
            {reversedItems.map((item) => (
                <SortableLayerItem
                    key={item.id}
                    id={item.id}
                    item={item}
                    selectedItemId={selectedItemId}
                    onSelectItem={onSelectItem}
                    onToggleVisibility={onToggleVisibility}
                    onToggleLock={onToggleLock}
                />
            ))}
        </List>
    );
};
const processTemplate = (templateData) => {
    if (!templateData || !templateData.pages) return [];
    return templateData.pages.map(page => ({
        ...page,
        id: uuidv4(),
        canvasWidth: templateData.width || page.canvasWidth,
        canvasHeight: templateData.height || page.canvasHeight,
        items: page.items.map(item => ({
            ...defaultItemProps,
            ...item,
            id: uuidv4(),
        }))
    }));
};
const TemplatePickerIntegrated = ({ templates, onSelectTemplate }) => (
    <Box>
        <Typography variant="h6" gutterBottom>Chọn mẫu thiệp</Typography>
        <Grid container spacing={2} sx={{ pt: 1, maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
            {templates.length === 0 && (<Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Grid>)}
            {templates.map(template => (
                <Grid item key={template._id} xs={12}>
                    <Card onClick={() => onSelectTemplate(template._id)} sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4, transform: 'scale(1.02)' }, transition: 'all 0.2s ease' }}>
                        <CardMedia component="img" height="150" image={template.imgSrc || 'https://placehold.co/400x400/EBF1FB/B0C7EE?text=No+Image'} alt={template.title} sx={{ objectFit: 'cover' }} />
                        <CardContent sx={{ p: 1.5 }}>
                            <Typography variant="body2" fontWeight="500">{template.title}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    </Box>
);
const SortablePageItem = ({ id, page, isSelected, onSelect, onRemove }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: 'pointer',
    };
    return (
        <Paper
            ref={setNodeRef}
            style={style}
            variant="outlined"
            onClick={() => onSelect(id)}
            sx={{
                p: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                mb: 1.5,
                borderColor: isSelected ? 'primary.main' : 'divider',
                borderWidth: isSelected ? '2px' : '1px',
                bgcolor: isSelected ? alpha('#3B82F6', 0.05) : 'transparent',
            }}
        >
            <Box {...attributes} {...listeners} sx={{ cursor: 'grab', color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                <DragIndicatorIcon />
            </Box>
            <Box
                sx={{
                    width: 60,
                    height: 45,
                    flexShrink: 0,
                    borderRadius: 1,
                    bgcolor: page.backgroundColor || '#FFFFFF',
                    backgroundImage: page.backgroundImage ? `url(${page.backgroundImage})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            />
            <ListItemText
                primary={page.name || `Trang`}
                primaryTypographyProps={{ noWrap: true, fontWeight: isSelected ? '600' : '400' }}
            />
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onRemove(id); }}>
                <DeleteIcon fontSize="small" />
            </IconButton>
        </Paper>
    );
};
const DroppablePage = ({ page, viewScale, children }) => {
    // Mỗi trang sẽ có một ID droppable duy nhất, ví dụ: 'page-drop-area-abc-123'
    const { setNodeRef, isOver } = useDroppable({
        id: `page-drop-area-${page.id}`,
    });

    return (
        <div
            ref={setNodeRef}
            id={`page-container-${page.id}`}
            style={{
                width: page.canvasWidth * viewScale,
                height: page.canvasHeight * viewScale,
                flexShrink: 0,
                position: 'relative',
                scrollSnapAlign: 'center',
                outline: isOver ? `2px dashed #3B82F6` : 'none',
                outlineOffset: '4px',
                transition: 'outline 0.1s ease-in-out',
                willChange: 'transform', // Báo cho trình duyệt tối ưu hóa
            }}
        >
            <motion.div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    scale: viewScale,
                    transformOrigin: 'top left',
                }}
            >
                {children}
            </motion.div>
        </div>
    );
};

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
const WeddingInvitationEditor = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const { templateId, invitationId } = useParams();
    const [customFonts, setCustomFonts] = useState([]);
    const [backendTemplates, setBackendTemplates] = useState([]);
    const [iconImages, setIconImages] = useState([]);
    const [componentImages, setComponentImages] = useState([]);
    const [tagImages, setTagImages] = useState([]);
    const [userUploadedImages, setUserUploadedImages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedUserImageIds, setSelectedUserImageIds] = useState([]);
    const [isDeletingImages, setIsDeletingImages] = useState(false);

    const handleToggleSelectUserImage = useCallback((id) => {
        setSelectedUserImageIds(prev =>
            prev.includes(id) ? prev.filter(imgId => imgId !== id) : [...prev, id]
        );
    }, []);

    const handleClearUserImageSelection = useCallback(() => {
        setSelectedUserImageIds([]);
    }, []);

    const handleDeleteSelectedUserImages = useCallback(async () => {
        if (selectedUserImageIds.length === 0) return;
        
        setIsDeletingImages(true);
        try {
            // GỌI API THỰC TẾ LÊN BACKEND ĐỂ XOÁ TRONG DATABASE & CLOUD (S3/Cloudinary)
            // Lưu ý: Phương thức DELETE trong axios cần truyền body thông qua thuộc tính 'data'
            await api.delete('/users/me/personal-images', { 
                data: { imageIds: selectedUserImageIds } 
            });
            
            // Sau khi DB xoá thành công, mới xoá trên local state React
            setUserUploadedImages(prev => prev.filter(img => !selectedUserImageIds.includes(img.id)));
            setSelectedUserImageIds([]);
            toast.success(`Đã xóa ${selectedUserImageIds.length} ảnh thành công!`);
        } catch (error) {
            console.error("Lỗi khi xóa ảnh:", error);
            // Hiển thị lỗi từ backend nếu có
            const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra khi xóa ảnh trên hệ thống.';
            toast.error(errorMsg);
        } finally {
            setIsDeletingImages(false);
        }
    }, [selectedUserImageIds]);

    const [history, setHistory] = useState({ stack: [], index: -1 });
    const pages = useMemo(() => history.stack[history.index] || [], [history.stack, history.index]);    const [currentPageId, setCurrentPageId] = useState(null);
    const [clipboard, setClipboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTool, setActiveTool] = useState('pages');
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [selectedSettingField, setSelectedSettingField] = useState(null);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [localItemData, setLocalItemData] = useState(null);
    const prevItemToEdit = usePrevious(itemToEdit);
    // const handleToggleCropMode = useCallback((item) => {
    //     // Nếu item đang được chỉnh sửa (nháy đúp lần 2), thoát chế độ crop (hành vi tương tự "lưu và thoát")
    //     if (itemToEdit && itemToEdit.id === item.id) {
    //         setItemToEdit(null); // Thoát chế độ crop
    //         toast.info("Đã lưu chỉnh sửa crop (nháy đúp)."); 
    //     } else if (item.type === 'image') { 
    //         // Vào chế độ crop (cho phép scale/pan ảnh bên trong khung)
    //         setItemToEdit(item); 
    //     }
    // }, [itemToEdit]);

    const handleUpdateSetting = useCallback((key, value) => {
        setEventSettings(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);

    const handleNavigateBack = () => {
        // history.index > 0 nghĩa là đã có thay đổi chưa lưu
        if (history.index > 0 && !saving) {
            setShowExitConfirm(true); // Mở Dialog thay vì navigate
        } else {
            // Không có gì thay đổi, đi về
            navigate('/invitation-management?tab=guests');
        }
    };
    const [zoomLevel, setZoomLevel] = useState(1);
    const [showGrid, setShowGrid] = useState(false);
    const gridSize = 20;
    const snapToObject = true;
    const [snapLines, setSnapLines] = useState([]);
    const [slug, setSlug] = useState('');
    const design = { themeColor: '#ffffff', fontFamily: 'Arial' };
    const [isScrolledToSettings, setIsScrolledToSettings] = useState(false);
    const [showSettingsPanel, setShowSettingsPanel] = useState(false);
    const [eventBlocks, setEventBlocks] = useState([]);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [showEnvelopeFlow, setShowEnvelopeFlow] = useState(false);
    const selectedEnvelope = MOCK_ENVELOPE_TEMPLATES[0];
    
    const currentPage = pages.find(p => p.id === currentPageId);
    const currentItems = useMemo(() => currentPage ? [...currentPage.items].sort((a, b) => a.zIndex - b.zIndex) : [], [currentPage]);    const currentBackgroundColor = currentPage ? currentPage.backgroundColor : '#FFFFFF';
    const currentBackgroundImage = currentPage ? currentPage.backgroundImage : null;
    const currentCanvasWidth = currentPage ? currentPage.canvasWidth : DEFAULT_CANVAS_WIDTH;
    const currentCanvasHeight = currentPage ? currentPage.canvasHeight : DEFAULT_CANVAS_HEIGHT;
    
    const setPages = useCallback((updater, recordHistory = true) => {
        setHistory(prev => {
            const currentPages = prev.stack[prev.index] || [];
            const newPages = typeof updater === 'function' ? updater(currentPages) : updater;

            if (_.isEqual(currentPages, newPages)) {
                return prev;
            }

            if (recordHistory) {
                const newStack = prev.stack.slice(0, prev.index + 1);
                newStack.push(newPages);
                return {
                    stack: newStack,
                    index: newStack.length - 1,
                };
            } else {
                const newStack = [...prev.stack];
                if (prev.index >= 0) {
                    newStack[prev.index] = newPages;
                }
                return {
                    ...prev,
                    stack: newStack,
                };
            }
        });
    }, []);
    const getNextZIndex = useCallback(() => {
        if (!currentPage || currentItems.length === 0) return BASE_Z_INDEX;
        return Math.max(...currentItems.map(item => item.zIndex), BASE_Z_INDEX) + 1;
    }, [currentItems, currentPage]);
    const addTextToCanvas = useCallback((content, targetPageId) => {
        const pageForAdding = pages.find(p => p.id === targetPageId);
        if (!pageForAdding) return;
        
        setActiveTool('default');
        const defaultWidth = 250;
        const defaultHeight = 50;

        // Luôn thêm vào chính giữa canvas của trang
        const itemX = (pageForAdding.canvasWidth / 2) - (defaultWidth / 2);
        const itemY = (pageForAdding.canvasHeight / 2) - (defaultHeight / 2);

        const newTextItem = { ...defaultItemProps, id: uuidv4(), content, x: itemX, y: itemY, width: defaultWidth, height: defaultHeight, fontSize: 24, type: 'text', zIndex: getNextZIndex() };

        setPages(currentPages => currentPages.map(page => page.id === targetPageId ? { ...page, items: [...page.items, newTextItem] } : page), true);
        setSelectedItemId(newTextItem.id);
    }, [pages, getNextZIndex, setPages]);





    const addImageToCanvas = useCallback((url, targetPageId = currentPageId) => {
        const pageForAdding = pages.find(p => p.id === targetPageId);
        if (!pageForAdding) {
            toast.warn("Vui lòng chọn hoặc tạo một trang trước khi thêm ảnh!");
            return;
        }

        setActiveTool('default');
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const ratio = img.width / img.height;
            // Đồng bộ logic scale giống Admin (0.25 thay vì 0.4)
            let newWidth = Math.min(img.width, pageForAdding.canvasWidth * 0.25);
            let newHeight = newWidth / ratio;
            if (newHeight > pageForAdding.canvasHeight * 0.25) {
                newHeight = pageForAdding.canvasHeight * 0.25;
                newWidth = newHeight * ratio;
            }
            const newImageItem = { ...defaultItemProps, id: uuidv4(), url, x: pageForAdding.canvasWidth / 2 - newWidth / 2, y: pageForAdding.canvasHeight / 2 - newHeight / 2, width: newWidth, height: newHeight, type: 'image', zIndex: getNextZIndex() };
            
            setPages(currentPages => currentPages.map(page =>
                page.id === targetPageId ? { ...page, items: [...page.items, newImageItem] } : page
            ), true);
            setSelectedItemId(newImageItem.id);
        };
        img.onerror = () => toast.error(`Không thể tải hình ảnh từ: ${url}`);
        img.src = url; // <--- ĐÃ SỬA: Tải URL trực tiếp
    }, [pages, getNextZIndex, setPages, currentPageId]);

    const [activeDragItem, setActiveDragItem] = useState(null);
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );
    const [eventSettings, setEventSettings] = useState({
        eventDate: '', groomName: '', brideName: '', groomInfo: '', brideInfo: '', groomImageUrl: '', brideImageUrl: '',
        heroImages: { main: '', sub1: '', sub2: '' }, galleryImages: [],
        bannerImages: [], contactGroom: '', contactBride: '',
        eventLocation: { lat: 21.028511, lng: 105.804817, address: '' },
        musicUrl: '',
        qrCodeImageUrls: [], videoUrl: '',
        invitationType: 'Thiệp cưới',
        eventDescription: '',
        groomNameStyle: { fontFamily: 'Playfair Display', fontSize: 28, color: '#4a4a68', fontWeight: '600' },
        brideNameStyle: { fontFamily: 'Playfair Display', fontSize: 28, color: '#4a4a68', fontWeight: '600' },
        groomImagePosition: { x: 0, y: 0, scale: 1 },
        brideImagePosition: { x: 0, y: 0, scale: 1 },
        eventDescriptionStyle: { fontFamily: 'Inter', fontSize: 18, color: '#555555', textAlign: 'center' },
        groomInfoStyle: { fontFamily: 'Inter', fontSize: 16, color: '#555555', textAlign: 'center' },
        brideInfoStyle: { fontFamily: 'Inter', fontSize: 16, color: '#555555', textAlign: 'center' },
        contactGroomStyle: { fontFamily: 'Inter', fontSize: 15, color: '#777777', textAlign: 'center' },
        contactBrideStyle: { fontFamily: 'Inter', fontSize: 15, color: '#777777', textAlign: 'center' },
        countdownTitleStyle: { fontFamily: 'Playfair Display', fontSize: 44, color: '#4a4a68', fontWeight: '600' },
        coupleTitleStyle: { fontFamily: 'Playfair Display', fontSize: 44, color: '#4a4a68', fontWeight: '600' },
        coupleSubtitleStyle: { fontFamily: 'Inter', fontSize: 18, color: '#777777', fontStyle: 'italic' },
        participantsTitleStyle: { fontFamily: 'Playfair Display', fontSize: 44, color: '#4a4a68', fontWeight: '600' },
        eventsTitleStyle: { fontFamily: 'Playfair Display', fontSize: 44, color: '#4a4a68', fontWeight: '600' },
        loveStoryTitleStyle: { fontFamily: 'Playfair Display', fontSize: 44, color: '#4a4a68', fontWeight: '600' },
        galleryTitleStyle: { fontFamily: 'Playfair Display', fontSize: 44, color: '#4a4a68', fontWeight: '600' },
        videoTitleStyle: { fontFamily: 'Playfair Display', fontSize: 44, color: '#4a4a68', fontWeight: '600' },
        contactTitleStyle: { fontFamily: 'Playfair Display', fontSize: 44, color: '#4a4a68', fontWeight: '600' },
        qrCodeTitleStyle: { fontFamily: 'Playfair Display', fontSize: 44, color: '#4a4a68', fontWeight: '600' },
        participantTitleStyle: { fontFamily: 'Playfair Display', fontSize: 20, color: '#4a4a68' },
        participantContentStyle: { fontFamily: 'Inter', fontSize: 15, color: '#555555' },
        eventCardTitleStyle: { fontFamily: 'Playfair Display', fontSize: 24, color: '#4a4a68' },
        eventCardInfoStyle: { fontFamily: 'Inter', fontSize: 16, color: '#555555' },
        loveStoryItemTitleStyle: { fontFamily: 'Playfair Display', fontSize: 36, color: '#4a4a68' },
        loveStoryItemDateStyle: { fontFamily: 'Inter', fontSize: 15, color: '#777777' },
        loveStoryItemDescStyle: { fontFamily: 'Inter', fontSize: 16, color: '#555555' },
        contactCardHeaderStyle: { fontFamily: 'Inter', fontSize: 18, color: '#4a4a68', fontWeight: '600', textTransform: 'uppercase' },
        contactCardNameStyle: { fontFamily: 'Inter', fontSize: 16, color: '#333333', fontWeight: '500' },
        qrCodeCaptionStyle: { fontFamily: 'Inter', fontSize: 14, color: '#555555', marginTop: '8px' },
        countdownValueStyle: { fontFamily: 'Playfair Display', fontSize: 40, color: '#4a4a68', fontWeight: '700' },
        countdownLabelStyle: { fontFamily: 'Inter', fontSize: 14, color: '#777777', textTransform: 'uppercase', fontWeight: '500' },
        events: [],
        participants: [],
        loveStory: [],
        blocksOrder: [],
        countdownTitle: 'Sự kiện trọng đại sẽ diễn ra trong',
        coupleTitle: 'Cô Dâu & Chú Rể',
        coupleSubtitle: '... và hai trái tim cùng chung một nhịp đập ...',
        participantsTitle: 'Thành Viên Tham Gia',
        eventsTitle: 'Sự Kiện Cưới',
        loveStoryTitle: 'Chuyện Tình Yêu',
        galleryTitle: 'Bộ Sưu Tập Ảnh',
        videoTitle: 'Video Sự Kiện',
        contactTitle: 'Thông Tin Liên Hệ',
        qrCodeTitle: 'Mã QR Mừng Cưới',
        rsvpTitle: 'Xác Nhận Tham Dự',
        rsvpSubtitle: 'Sự hiện diện của bạn là niềm vinh hạnh cho gia đình chúng tôi.',
        rsvpTitleStyle: { fontFamily: 'Playfair Display', fontSize: 44, color: '#4a4a68', fontWeight: '600' },
        rsvpSubtitleStyle: { fontFamily: 'Inter', fontSize: 18, color: '#555555', textAlign: 'center' },
     });
    const settingsPanelRef = useRef(null);
    const centralColumnRef = useRef(null); // Ref for the scrolling container
    const exportCanvasRef = useRef(null);
    const canvasContainerRef = useRef(null);
    const canvasWrapperRef = useRef(null);
    const isPanning = useRef(false);
    const panStart = useRef({ x: 0, y: 0 });
    const [downloadMenuAnchorEl, setDownloadMenuAnchorEl] = useState(null);

    // const handleStartSaveFlow = () => {
    //     // Lấy logic kiểm tra từ hàm executeSaveChanges
    //     if (!pages || pages.length === 0) {
    //         showErrorToast("Không có nội dung để lưu.");
    //         return;
    //     }
    //     if (!slug.trim()) {
    //         showErrorToast("Vui lòng nhập tên cho thiệp của bạn.");
    //         return;
    //     }
        
    //     // Kiểm tra xem đã qua bước "Tiếp theo" (showSettingsPanel) hay chưa
    //     if (!showSettingsPanel) {
    //          // Nếu chưa qua, chỉ cần cuộn xuống
    //         setShowSettingsPanel(true);
    //     } else {
    //          // Nếu đã ở bước 2 (setting), thì mới kích hoạt flow
    //         setShowEnvelopeFlow(true);
    //     }
    // };

    // 2. Hàm này được truyền cho EnvelopeFlow, nó sẽ gọi hàm lưu GỐC
    const handleFlowComplete = () => {
        setShowEnvelopeFlow(false);
        executeSaveChanges(); // Gọi hàm lưu ban đầu của bạn
    };

    // 3. Hàm này được truyền cho EnvelopeFlow để hủy
    const handleFlowCancel = () => {
        setShowEnvelopeFlow(false);
        // Tùy chọn: có thể cuộn về đầu trang nếu muốn
        // if (centralColumnRef.current) {
        //     centralColumnRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        // }
    };

    const handleDownloadMenuOpen = (event) => setDownloadMenuAnchorEl(event.currentTarget);
    const handleDownloadMenuClose = () => setDownloadMenuAnchorEl(null);

    useLayoutEffect(() => {
        const calculateScale = () => {
            if (canvasWrapperRef.current && pages.length > 0 && currentPage) {
                const wrapper = canvasWrapperRef.current;
                const wrapperWidth = wrapper.clientWidth;
                const wrapperHeight = wrapper.clientHeight;
                const padding = 60;

                const availableWidth = wrapperWidth - padding;
                const availableHeight = wrapperHeight - padding;

                const widthScale = availableWidth / currentPage.canvasWidth;
                const heightScale = availableHeight / currentPage.canvasHeight;

                // Luôn tính toán để canvas vừa vặn với không gian có sẵn
                const newScale = Math.min(widthScale, heightScale, MAX_ZOOM);

                setZoomLevel(newScale);
            }
        };
        calculateScale(); // Chạy một lần khi component mount hoặc khi dependency thay đổi
        window.addEventListener('resize', calculateScale);
        return () => window.removeEventListener('resize', calculateScale);
        // Dependency được thay đổi để chỉ chạy khi kích thước trang hiện tại thay đổi
    }, [pages.length, currentPage]);




    
    useEffect(() => {
        const centralColumn = centralColumnRef.current;
        if (!centralColumn) return;
        const handleScroll = () => {
            const settingsPanel = settingsPanelRef.current;
            if (showSettingsPanel && settingsPanel) {
                const { top } = settingsPanel.getBoundingClientRect();
                const centralColumnTop = centralColumn.getBoundingClientRect().top;

                if (top <= centralColumnTop + 10) {
                    setIsScrolledToSettings(true);
                } else {
                    setIsScrolledToSettings(false);
                }
            } else {
                setIsScrolledToSettings(false);
            }
        };
        centralColumn.addEventListener('scroll', handleScroll);
        return () => {
            centralColumn.removeEventListener('scroll', handleScroll);
        };
    }, [showSettingsPanel]);
    useEffect(() => {
        const fetchInitialAssets = async () => {
            try {
                const [iconsRes, componentsRes, tagsRes] = await Promise.all([
                    api.get('/design-assets?type=icon'),
                    api.get('/design-assets?type=component'),
                    api.get('/design-assets?type=tag')
                ]);
                const mapData = (item) => ({ id: item._id, name: item.name, url: item.imgSrc });
                setIconImages(iconsRes.data.data.map(mapData));
                setComponentImages(componentsRes.data.data.map(mapData));
                setTagImages(tagsRes.data.data.map(mapData));
                const fontsRes = await api.get('/fonts');
                setCustomFonts(fontsRes.data.data || []);
                const templatesRes = await api.get('/invitation-templates');
                setBackendTemplates(templatesRes.data.data || []);
            } catch (err) {
                console.error("Lỗi khi tải tài nguyên thiết kế ban đầu:", err);
                showErrorToast("Không thể tải một số tài nguyên thiết kế.");
            }
        };
        fetchInitialAssets();
    }, []);
    const snapCenterToCursor = ({ activatorEvent, active, transform }) => {
        if (active && active.rect.current && active.rect.current.measured) {
            const { width, height } = active.rect.current.measured;
            // Dịch chuyển transform đi một nửa chiều rộng và chiều cao
            return {
                ...transform,
                x: transform.x - width / 2,
                y: transform.y - height / 2,
            };
        }
        return transform;
    };

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                let invitationData;
                if (invitationId) {
                    const { data } = await api.get(`/invitations/${invitationId}`);
                    invitationData = data.data;
                    if (!invitationData) throw new Error("Không tìm thấy thiệp mời.");
                }
                else if (templateId) {
                    const { data } = await api.get(`/invitation-templates/${templateId}`);
                    const template = data.data;
                    if (!template || !template.templateData) {
                        throw new Error("Dữ liệu mẫu không hợp lệ.");
                    }

                    // --- BẮT ĐẦU LOGIC TẠO SLUG MỚI ---
                    // 1. Hàm helper để slugify tiêu đề
                    const slugify = (text = '') => text.toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/đ/g, "d")
                        .replace(/\s+/g, '-')
                        .replace(/[^\w-]+/g, '')
                        .replace(/--+/g, '-')
                        .trim();
                    
                    // 2. Tạo ID ngẫu nhiên ngắn
                    const shortId = Math.random().toString(36).substring(2, 8);

                    // 3. Kết hợp thành slug mới
                    const suggestedSlug = `${slugify(template.title || 'thiep-moi')}-${shortId}`;
                    // --- KẾT THÚC LOGIC TẠO SLUG MỚI ---
                    
                    const processedPages = processTemplate(template.templateData);
                    invitationData = {
                        content: processedPages,
                        design: template.templateData.design || { themeColor: '#ffffff', fontFamily: 'Arial' },
                        slug: suggestedSlug, // Gán slug đã tạo
                        settings: template.templateData.settings || {}
                    };
                }
                else if (backendTemplates.length > 0) {
                    navigate(`/canvas/template/${backendTemplates[0]._id}`, { replace: true });
                    return;
                } else {
                    setLoading(false);
                    return;
                }
                const contentWithDefaults = (invitationData.content || []).map(page => ({
                    ...page,
                    items: (page.items || []).map(item => ({ ...defaultItemProps, ...item }))
                }));
                if (contentWithDefaults.length === 0) {
                    console.warn("Dữ liệu không có trang nào. Hiển thị canvas trống.");
                }
                setHistory({ stack: [contentWithDefaults], index: 0 });
                setCurrentPageId(contentWithDefaults[0]?.id || null);
                setSlug(invitationData.slug || '');
                if (invitationData.settings) {
                    const normalizedBanners = (invitationData.settings.bannerImages || []).map(img =>
                        typeof img === 'string' ? { id: img, url: img } : img
                    );
                    const formattedEventDate = invitationData.settings.eventDate
                        ? new Date(invitationData.settings.eventDate).toISOString().slice(0, 16)
                        : '';
                    setEventSettings(prev => ({
                        ...prev, // 1. Bắt đầu với tất cả các giá trị mặc định trong state hiện tại
                        ...invitationData.settings, // 2. Ghi đè bằng TẤT CẢ các settings đã lưu từ server. Thao tác này sẽ tải lại đúng các style của bạn.
                        bannerImages: normalizedBanners, // 3. Ghi đè lại trường bannerImages đã được xử lý riêng
                        eventDate: formattedEventDate, // 4. Ghi đè lại trường eventDate đã được định dạng riêng
                    }));
                }
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu:", err);
                setHistory({ stack: [], index: -1 });
            } finally {
                setLoading(false);
            }
        };
        if (templateId || invitationId || backendTemplates.length > 0) {
            loadInitialData();
        } else {
            setLoading(true);
        }
    }, [invitationId, templateId, backendTemplates, navigate]);
    useEffect(() => {
        const initializeBlocks = () => {
            const order = eventSettings.blocksOrder;
            let blocks = [];
            const defaultOrder = [
                'BANNER_CAROUSEL', 'EVENT_DESCRIPTION', 'COUPLE_INFO',
                'PARTICIPANTS', 'EVENT_SCHEDULE', 'COUNTDOWN',
                'LOVE_STORY', 'GALLERY', 'VIDEO', 'CONTACT_INFO', 'QR_CODES', 'RSVP', 'CUSTOM_HTML'
            ];
            let applicableBlockTypes = defaultOrder;
            if (eventSettings.invitationType && eventSettings.invitationType !== 'Thiệp cưới') {
                applicableBlockTypes = [
                    'EVENT_DESCRIPTION',
                    'GALLERY',
                    'VIDEO',
                ];
            }
            if (order && order.length > 0) {
                blocks = order
                    .filter(type => applicableBlockTypes.includes(type))
                    .map(type => ({ id: uuidv4(), type }));

                applicableBlockTypes.forEach(type => {
                    if (!order.includes(type)) {
                        blocks.push({ id: uuidv4(), type });
                    }
                });

            } else {
                blocks = applicableBlockTypes.map(type => ({ id: uuidv4(), type }));
            }

            setEventBlocks(blocks);
        };
        initializeBlocks();
    }, [eventSettings.blocksOrder, eventSettings.invitationType]);

    useEffect(() => {
        // Chỉ lắng nghe khi có item đang được chỉnh sửa crop
        if (!itemToEdit || itemToEdit.type !== 'image') return;

        const handleGlobalClick = (event) => {
            const clickedElement = event.target;

            // Tìm element của item đang được chỉnh sửa. Giả định item được render với id: `design-item-${itemToEdit.id}`
            const itemElement = document.getElementById(`design-item-${itemToEdit.id}`);

            // Kiểm tra xem click có nằm ngoài item đang edit hay không
            // Đồng thời cần loại trừ các element UI bên ngoài khác (sidebar, settings panel...)
            // Tạm thời chỉ kiểm tra element của item:
            const isClickedOutsideItem = itemElement && !itemElement.contains(clickedElement);

            if (isClickedOutsideItem) {
                // Thoát chế độ chỉnh sửa crop (tương đương với Lưu và Thoát)
                setItemToEdit(null); 
                toast.info("Đã lưu chỉnh sửa crop (click ngoài).");
            }
        };

        // Lắng nghe click ở phase capturing để đảm bảo bắt được event trước khi nó lan truyền
        document.addEventListener('click', handleGlobalClick, true);

        return () => {
            document.removeEventListener('click', handleGlobalClick, true);
        };
    }, [itemToEdit]);

    // --- START: SCROLL FOCUS LOGIC ---
    const handleScrollFocus = useCallback(() => {
        const container = canvasWrapperRef.current;
        if (!container || pages.length === 0) return;

        const scrollCenter = container.scrollTop + container.clientHeight / 2;

        let closestPageId = null;
        let minDistance = Infinity;

        pages.forEach(page => {
            const pageElement = document.getElementById(`page-container-${page.id}`);
            if (pageElement) {
                const pageTop = pageElement.offsetTop;
                const pageHeight = pageElement.offsetHeight;
                const pageCenter = pageTop + pageHeight / 2;
                const distance = Math.abs(scrollCenter - pageCenter);

                if (distance < minDistance) {
                    minDistance = distance;
                    closestPageId = page.id;
                }
            }
        });

        if (closestPageId && closestPageId !== currentPageId) {
            setCurrentPageId(closestPageId);
        }
    }, [pages, currentPageId]);

    const debouncedScrollHandler = useMemo(
        () => _.debounce(handleScrollFocus, 150),
        [handleScrollFocus]
    );

    useEffect(() => {
        const container = canvasWrapperRef.current;
        if (container) {
            container.addEventListener('scroll', debouncedScrollHandler);
        }
        return () => {
            if (container) {
                container.removeEventListener('scroll', debouncedScrollHandler);
            }
            debouncedScrollHandler.cancel();
        };
    }, [debouncedScrollHandler]);
    const handleDragStart = (event) => {
        setActiveDragItem(event.active.data.current);
    };
        
    const handleDragEnd = (event) => {
        const { over, active } = event;
        setActiveDragItem(null);
        if (!over || !active.data.current || !String(over.id).startsWith('page-drop-area-')) {
            return; 
        }
        const itemData = active.data.current;
        
        const prefix = 'page-drop-area-';
        const targetPageId = String(over.id).substring(prefix.length);

        if (itemData.type === 'image') {
            addImageToCanvas(itemData.url, targetPageId); 
        } else if (itemData.type === 'text') {
            addTextToCanvas(itemData.content, targetPageId);
        }
    };

    const scrollToPage = useCallback((pageId) => {
        const pageElement = document.getElementById(`page-container-${pageId}`);
        if (pageElement && canvasWrapperRef.current) {
            canvasWrapperRef.current.scrollTo({
                top: pageElement.offsetTop, 
                behavior: 'smooth',
            });
        }
    }, []);

    const handleUndo = useCallback(() => {
        setHistory(prev => ({ ...prev, index: Math.max(-1, prev.index - 1) }));
    }, []);
    const handleRedo = useCallback(() => {
        setHistory(prev => ({ ...prev, index: Math.min(prev.stack.length - 1, prev.index + 1) }));
    }, []);
    const executeSaveChanges = async () => {
        // if (!pages || pages.length === 0) {
        //     showErrorToast("Không có nội dung để lưu.");
        //     return;
        // }
        // if (!slug.trim()) {
        //     showErrorToast("Vui lòng nhập tên cho thiệp của bạn.");
        //     return;
        // }

        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('slug', slug.trim());
            if (templateId) {
                formData.append('templateId', templateId);
            }
            const pagesForBackend = pages.map(page => ({ ...page, items: page.items.map(({ isEditing, ...rest }) => rest) }));
            formData.append('content', JSON.stringify(pagesForBackend));
            formData.append('design', JSON.stringify(design));
            const settingsForDb = { ...eventSettings };
            settingsForDb.blocksOrder = eventBlocks.map(block => block.type);
            const processSingleImageField = (fieldName, file) => {
                if (file instanceof File) {
                    formData.append(fieldName, file);
                    return null;
                }
                return file;
            };
            settingsForDb.groomImageUrl = processSingleImageField('groomImageUrl', eventSettings.groomImageUrl);
            settingsForDb.brideImageUrl = processSingleImageField('brideImageUrl', eventSettings.brideImageUrl);
            settingsForDb.heroImages = {
                main: processSingleImageField('heroImages_main', eventSettings.heroImages.main),
                sub1: processSingleImageField('heroImages_sub1', eventSettings.heroImages.sub1),
                sub2: processSingleImageField('heroImages_sub2', eventSettings.heroImages.sub2),
            };
        
            settingsForDb.galleryImages = [];
            (eventSettings.galleryImages || []).forEach(image => {
                if (image instanceof File) {
                    formData.append('galleryImages', image);
                    // (Đảm bảo placeholder này khớp với logic backend của bạn)
                    settingsForDb.galleryImages.push(`__FILE_PLACEHOLDER_galleryImages__`); 
                } else if (typeof image === 'string') {
                    settingsForDb.galleryImages.push(image); // Giữ nguyên URL cũ
                }
            });
            settingsForDb.events = (eventSettings.events || []).map(item => {
                if (item.imageUrl instanceof File) {
                    formData.append('eventImages', item.imageUrl);
                    return { ...item, imageUrl: `__FILE_PLACEHOLDER_${item.imageUrl.name}__` };
                }
                return item;
            });

            settingsForDb.participants = (eventSettings.participants || []).map(item => {
                if (item.imageUrl instanceof File) {
                    formData.append('participantImages', item.imageUrl);
                    return { ...item, imageUrl: `__FILE_PLACEHOLDER_${item.imageUrl.name}__` };
                }
                return item;
            });
            settingsForDb.loveStory = (eventSettings.loveStory || []).map(item => {
                if (item.imageUrl instanceof File) {
                    formData.append('loveStoryImages', item.imageUrl);
                    return { ...item, imageUrl: `__FILE_PLACEHOLDER_${item.imageUrl.name}__` };
                }
                return item;
            });
            settingsForDb.qrCodes = (eventSettings.qrCodes || []).map(item => {
                if (item.url instanceof File) {
                    formData.append('qrCodeImageUrls', item.url);
                    return { ...item, url: `__FILE_PLACEHOLDER_${item.url.name}__` };
                }
                return item;
            });
            settingsForDb.bannerImages = (eventSettings.bannerImages || []).map(item => {
                 const image = item.file || item;
                if (image instanceof File) {
                    formData.append('bannerImages', image);
                    return null;
                }
                return typeof item.url === 'string' ? item.url : item;
            }).filter(Boolean);
            formData.append('settings', JSON.stringify(settingsForDb));
            let finalId = invitationId;
            if (invitationId) {
                await api.put(`/invitations/${invitationId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Cập nhật thiệp thành công!');
            } else {
                const response = await api.post('/invitations', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Tạo thiệp mới thành công!');
                const newId = response.data.data?._id;
                if (newId) {
                    finalId = newId;
                } else {
                    navigate('/invitation-management?tab=guests');
                    return;
                }
            }
             if (finalId) {
                navigate(`/invitation-management/${finalId}?tab=guests`);
            }
        } catch (error) {
            console.error("Lỗi khi lưu thiệp:", error.response?.data || error);
            const serverError = error.response?.data?.message || 'Đã có lỗi xảy ra.';
            toast.error(`Lưu thất bại: ${serverError}`);
            if (error.response?.status === 401) navigate('/sign-in');
        } finally {
            setSaving(false);
        }
    };
    const prepareSettingsForPreview = async (settings) => {
        const newSettings = { ...settings };

        // Xử lý galleryImages
        if (newSettings.galleryImages && Array.isArray(newSettings.galleryImages)) {
            const imagePromises = newSettings.galleryImages.map(img => {
                if (img instanceof File) {
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(img);
                    });
                }
                return Promise.resolve(img); // Trả về URL nếu nó đã là string
            });
            newSettings.galleryImages = await Promise.all(imagePromises);
        }

        // CẬP NHẬT: Luôn lấy thứ tự khối mới nhất từ state `eventBlocks`
        newSettings.blocksOrder = eventBlocks.map(block => block.type);

        return newSettings;
    };
    const handlePreviewInNewTab = async () => {
        try {
            // Sử dụng hàm trợ giúp mới để chuẩn bị dữ liệu
            const preparedSettings = await prepareSettingsForPreview(eventSettings);

            const previewData = {
                pages: pages,
                invitationSettings: preparedSettings,
            };
            
            sessionStorage.setItem('invitationPreviewData', JSON.stringify(previewData));
            
            const idForPreview = invitationId || templateId || 'preview';
            
            window.open(`/events/${idForPreview}`, '_blank');

        } catch (error) {
            console.error("Không thể lưu dữ liệu xem trước:", error);
            toast.error("Có lỗi khi chuẩn bị xem trước.");
        }
    };





    const handleNextButtonClick = () => {
        if (!showSettingsPanel) {
            setShowSettingsPanel(true);
        } else {
            executeSaveChanges();
        }
        // handleStartSaveFlow();
    };
    useEffect(() => {
        if (showSettingsPanel) {
            setTimeout(() => {
                settingsPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [showSettingsPanel]);
    
    const calculateFitZoom = useCallback(() => {
        if (!canvasWrapperRef.current || !currentCanvasWidth || !currentCanvasHeight) return 1;
        const wrapperRect = canvasWrapperRef.current.getBoundingClientRect();
        const padding = 40;
        const availableWidth = wrapperRect.width - padding;
        const availableHeight = wrapperRect.height - padding;
        const widthScale = availableWidth / currentCanvasWidth;
        const heightScale = availableHeight / currentCanvasHeight;
        return Math.min(widthScale, heightScale, MAX_ZOOM);
    }, [currentCanvasWidth, currentCanvasHeight]);
    const fitToScreen = useCallback(() => {
        const newZoom = calculateFitZoom();
        setZoomLevel(newZoom);
    }, [calculateFitZoom]);
    useLayoutEffect(() => { if (currentPage) fitToScreen(); }, [currentPage, fitToScreen]);
    useEffect(() => { window.addEventListener('resize', fitToScreen); return () => window.removeEventListener('resize', fitToScreen); }, [fitToScreen]);
    const handleZoomIn = () => setZoomLevel(prevZoom => Math.min(MAX_ZOOM, prevZoom + ZOOM_STEP));
    const handleZoomOut = () => setZoomLevel(prevZoom => Math.max(MIN_ZOOM, prevZoom - ZOOM_STEP));
    const handleZoomSliderChange = (_event, newValue) => setZoomLevel(newValue);
    const handleSelectItem = useCallback((id) => {
        if (id !== selectedItemId) {
            setSelectedItemId(id);
            if(selectedSettingField) setSelectedSettingField(null);
        }
        const item = currentItems.find(i => i.id === id);
        if (item?.locked) return;
        if (id !== null && currentPageId) {
            const updater = (currentPages) => currentPages.map(page =>
                page.id === currentPageId
                    ? { ...page, items: page.items.map(item => 
                        // Tắt isEditing cho BẤT KỲ item nào khác đang được edit
                        (item.id !== id && item.isEditing) 
                            ? { ...item, isEditing: false } 
                            : item
                      )}
                    : page
            );
            setPages(updater, false);
        }
    }, [currentPageId, currentItems, selectedItemId, setPages, selectedSettingField]);
    const handleSetActiveTool = (tool) => {
        setSelectedItemId(null);
        setSelectedSettingField(null);
        setItemToEdit(null);
        setActiveTool(prevTool => prevTool === tool ? 'default' : tool);
    };
    useEffect(() => {
        if (prevItemToEdit && !itemToEdit && localItemData) {
            const { type, isNew } = prevItemToEdit;
            const listKey = type;
            setEventSettings(prev => {
                const list = prev[listKey] || [];
                let newList;
                const itemExists = list.some(item => item.id === localItemData.id);
                if (isNew && !itemExists) {
                    newList = [...list, localItemData];
                } else {
                     newList = list.map(item => item.id === localItemData.id ? localItemData : item);
                }
                return { ...prev, [listKey]: newList };
            });
            setLocalItemData(null);
        }
    }, [itemToEdit, prevItemToEdit, localItemData, setEventSettings]);
    const handleSelectSettingField = (key) => {
        setSelectedItemId(null);
        setItemToEdit(null);
        setSelectedSettingField(prevKey => (prevKey === key ? null : key));
    };
    const handleSelectBlock = (blockType) => {
        const blockConfig = AVAILABLE_BLOCKS[blockType];
        if (blockConfig) {
            const keyToSelect = blockConfig.titleKey || blockConfig.key || (blockConfig.relatedFields && blockConfig.relatedFields[0]);
            if (keyToSelect) {
                handleSelectSettingField(keyToSelect);
            }
        }
    };
    const handleRemoveBlock = (blockId) => {
        setEventBlocks(prev => prev.filter(b => b.id !== blockId));
        toast.success("Đã xóa khối thành công.");
    };
    const handleAddBlock = (blockType) => {
        setEventBlocks(prev => [...prev, { id: uuidv4(), type: blockType }]);
        toast.success("Đã thêm khối mới.");
    };
    const handleReorderBlocks = (activeId, overId) => {
        setEventBlocks(items => {
            const oldIndex = items.findIndex(item => item.id === activeId);
            const newIndex = items.findIndex(item => item.id === overId);
            return arrayMove(items, oldIndex, newIndex);
        });
    };
    const handleEditItem = (item) => {
        const listKeyMap = {
            events: 'events',
            participants: 'participants',
            loveStory: 'loveStory',
        };
        const key = listKeyMap[item.type];
        if (key) {
            setSelectedSettingField(key);
            setItemToEdit(item);
        } else {
            console.warn("Unknown item type for editing:", item.type);
        }
    };
    const handleCanvasWrapperMouseDown = (event) => {
        if (event.button === 1 || (event.button === 0 && (event.ctrlKey || event.metaKey))) {
            event.preventDefault();
            isPanning.current = true;
            if (canvasWrapperRef.current) canvasWrapperRef.current.style.cursor = 'grabbing';
            panStart.current = { x: event.clientX, y: event.clientY };
            if (canvasWrapperRef.current) {
                canvasWrapperRef.current.style.cursor = 'grabbing';
            }
            const handleMove = (e) => {
                if (!isPanning.current) return;
                panStart.current = { x: e.clientX, y: e.clientY };
            };
            const handleUp = () => {
                isPanning.current = false;
                if (canvasWrapperRef.current) canvasWrapperRef.current.style.cursor = 'grab';
                if (canvasWrapperRef.current) {
                    canvasWrapperRef.current.style.cursor = 'grab';
                }
                window.removeEventListener('pointermove', handleMove);
                window.removeEventListener('pointerup', handleUp);
            };

            window.addEventListener('pointermove', handleMove);
            window.addEventListener('pointerup', handleUp);
            return;
        }
        if (event.button === 0) {
            const target = event.target;
            const isClickOnItem = target.closest('.draggable-item-class');
            
            // Logic: Nếu đang có item được chỉnh sửa (image crop hoặc text edit)
            if (selectedItemId) {
                const item = currentItems.find(i => i.id === selectedItemId);
                
                if (item?.isEditing) {
                    // Cần kiểm tra xem click có nằm ngoài item đang được chỉnh sửa không
                    const itemElement = document.getElementById(`design-item-${selectedItemId}`);
                    const isClickInsideActiveItem = itemElement && itemElement.contains(target);

                    if (!isClickInsideActiveItem) {
                        // THOÁT CHẾ ĐỘ CHỈNH SỬA (Lưu và Thoát)
                        // Lệnh này sẽ kích hoạt logic lưu vị trí crop nếu là image
                        handleUpdateItem(selectedItemId, { isEditing: false }, true);
                        if (item.type === 'image') {
                            // Cần gọi thêm toast vì PannableImageFrame không gọi khi thoát bằng cách này
                            toast.info("Đã lưu chỉnh sửa crop (click ngoài).");
                        }
                        // Sau khi lưu xong, chúng ta vẫn tiếp tục với logic deselect bên dưới
                    }
                }
            }

            // Nếu click không nằm trên bất kỳ item nào, hoặc click ra ngoài item đang edit, thì deselect.
            if (!isClickOnItem) {
                handleSelectItem(null);
            }
        }
    };
    const handleCanvasWrapperContextMenu = (event) => event.preventDefault();
    const handleSelectTemplate = useCallback((id) => {
        if (!id) return;
        setActiveTool('default');
        navigate(`/canvas/template/${id}`);
    }, [navigate]);
    const handleCreateBlankCanvas = (width, height, background) => {
        const newPage = {
            id: uuidv4(),
            name: `Thiệp mới ${width}x${height}`,
            items: [],
            backgroundColor: '#FFFFFF',
            backgroundImage: '',
            canvasWidth: width,
            canvasHeight: height
        };
        if (background.type === 'color') {
            newPage.backgroundColor = background.value;
        } else if (background.type === 'image' && background.value) {
            newPage.backgroundImage = URL.createObjectURL(background.value);
        }
        setPages([newPage], true);
        setCurrentPageId(newPage.id);
        setSelectedItemId(null);
        setActiveTool('default');
    };
    const handleAddPage = useCallback(() => {
        if (!currentPage) {
            toast.warn("Vui lòng tạo hoặc chọn một trang trước khi thêm trang mới.");
            return;
        }
        const newPage = {
            id: uuidv4(),
            name: `Trang ${pages.length + 1}`,
            items: [],
            backgroundColor: currentPage.backgroundColor || '#FFFFFF',
            backgroundImage: currentPage.backgroundImage || '',
            canvasWidth: currentPage?.canvasWidth || DEFAULT_CANVAS_WIDTH,
            canvasHeight: currentPage?.canvasHeight || DEFAULT_CANVAS_HEIGHT
        };
        const newPages = [...pages, newPage];
        setPages(newPages, true);
        setCurrentPageId(newPage.id);
        setSelectedItemId(null);

        setTimeout(() => {
            scrollToPage(newPage.id);
        }, 100);
    }, [currentPage, pages, setPages, scrollToPage]);


    const handleDeletePage = useCallback((id) => {
        if (!id || pages.length <= 1) { toast.warn("Không thể xóa trang cuối cùng."); return; }
        if (window.confirm(`Bạn có chắc muốn xóa trang "${pages.find(p => p.id === id)?.name}"?`)) {
            const newPages = pages.filter(p => p.id !== id);
            const newPageIndex = Math.max(0, pages.findIndex(p => p.id === id) - 1);
            const newCurrentPageId = newPages[newPageIndex].id;
            setCurrentPageId(newCurrentPageId);
            setPages(newPages, true);
            toast.success("Đã xóa trang!");
            setTimeout(() => scrollToPage(newCurrentPageId), 100);
        }
    }, [pages, setPages, scrollToPage]);

    const handleReorderPages = useCallback((activeId, overId) => {
        setPages(currentPages => {
            const oldIndex = currentPages.findIndex(p => p.id === activeId);
            const newIndex = currentPages.findIndex(p => p.id === overId);
            return arrayMove(currentPages, oldIndex, newIndex);
        }, true);
    }, [setPages]);
    
    useEffect(() => { if (pages.length > 0 && !pages.find(p => p.id === currentPageId)) setCurrentPageId(pages[0]?.id || null); }, [currentPageId, pages]);

    const handleBackgroundColorChange = (color) => { if (!currentPageId) return; setPages(pages.map(p => p.id === currentPageId ? { ...p, backgroundColor: color } : p), true); };
    const handleBackgroundImageChange = (file) => {
        if (!currentPageId || !file) return;
        const imageUrl = URL.createObjectURL(file);
        setPages(currentPages =>
            currentPages.map(p =>
                p.id === currentPageId ? { ...p, backgroundImage: imageUrl, backgroundImageFile: file } : p
            ), true
        );
    };

    const handleRemoveBackgroundImage = () => {
        if (!currentPageId) return;
        setPages(currentPages =>
            currentPages.map(p =>
                p.id === currentPageId ? { ...p, backgroundImage: null } : p
            ), true
        );
    };
    const handleUserImageFileUpload = useCallback(async (filesOrData, replace = false) => {
    // Trường hợp 1: Fetch initial data (từ useEffect)
    if (replace) {
        setUserUploadedImages(filesOrData || []);
        return;
    }

    // Trường hợp 2: Upload file mới
    const files = filesOrData;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    let successCount = 0;
    let newImagesAdded = [];

    try {
        // CHUYỂN SANG GỬI REQUEST SONG SONG TỪNG FILE MỘT
        // Cách này giúp chia nhỏ Payload, vĩnh viễn không bao giờ dính lỗi 413 Too Large
        const uploadPromises = Array.from(files).map(async (file) => {
            if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                showErrorToast(`Ảnh "${file.name}" quá lớn (> ${MAX_FILE_SIZE_MB}MB).`);
                return null;
            }

            const formData = new FormData();
            formData.append('images', file); // Gửi duy nhất 1 ảnh cho 1 request

            try {
                const response = await api.post('/users/me/upload-images', formData, { 
                    headers: { 'Content-Type': 'multipart/form-data' } 
                });
                return response.data.data; // Trả về data của request thành công
            } catch (err) {
                console.error(`Lỗi tải ảnh ${file.name}:`, err);
                return null; // Bỏ qua file lỗi, không làm crash các file khác
            }
        });

        // Đợi tất cả các file upload xong
        const results = await Promise.all(uploadPromises);

        // Lọc và gộp các kết quả thành công
        results.forEach(resArray => {
            if (resArray && resArray.length > 0) {
                // Mapping dữ liệu trả về từ server
                const mappedImgs = resArray.map(img => ({ 
                    id: img.id || uuidv4(), 
                    name: img.name, 
                    url: img.url 
                }));
                newImagesAdded = [...newImagesAdded, ...mappedImgs];
                successCount++;
            }
        });

        // Cập nhật UI nếu có ít nhất 1 ảnh thành công
        if (newImagesAdded.length > 0) {
            setUserUploadedImages(prev => [...newImagesAdded, ...prev]);

            // Tự động thêm vào Canvas
            if (currentPageId) {
                newImagesAdded.forEach((img) => {
                    addImageToCanvas(img.url, currentPageId);
                });
                setActiveTool('default'); 
            }
            showSuccessToast(`Tải lên thành công ${successCount}/${files.length} ảnh!`);
        }

    } catch (error) {
        console.error("Lỗi hệ thống khi tải ảnh lên:", error);
        toast.error('Có lỗi xảy ra trong quá trình tải ảnh.');
    } finally { 
        setIsUploading(false); 
    }
}, [currentPageId, addImageToCanvas]);
    const handleUpdateItem = useCallback((id, updates, record) => {
        if (!currentPageId) return;
        const updater = (currentPages) => currentPages.map(p =>
            p.id === currentPageId
                ? { ...p, items: p.items.map(i => i.id === id ? { ...i, ...updates } : i) }
                : p
        );
        setPages(updater, record);
    }, [currentPageId, setPages]);
    const handleDeleteItem = useCallback((id) => { if (!currentPageId || !id) return; setPages(pages.map(p => p.id === currentPageId ? { ...p, items: p.items.filter(i => i.id !== id) } : p), true); if (selectedItemId === id) setSelectedItemId(null); }, [currentPageId, selectedItemId, pages, setPages]);
    
    const handleBringToFront = useCallback((id) => {
        if (!currentPageId || !id) return;
        setPages(currentPages => currentPages.map(page => {
            if (page.id !== currentPageId) return page;
            const maxZ = (page.items.length > 0 ? Math.max(...page.items.map(i => i.zIndex)) : BASE_Z_INDEX);
            return {
                ...page,
                items: page.items.map(i => i.id === id ? { ...i, zIndex: maxZ + 1 } : i)
            };
        }), true);
    }, [currentPageId, setPages]);

    const handleSendToBack = useCallback((id) => {
        if (!currentPageId || !id) return;
        setPages(currentPages => currentPages.map(page => {
            if (page.id !== currentPageId) return page;
            const minZ = (page.items.length > 0 ? Math.min(...page.items.map(i => i.zIndex)) : BASE_Z_INDEX);
            return {
                ...page,
                items: page.items.map(i => i.id === id ? { ...i, zIndex: minZ - 1 } : i)
            };
        }), true);
    }, [currentPageId, setPages]);
    
    const handleReorderItems = useCallback((activeId, overId) => {
        setPages(currentPages => currentPages.map(page => {
            if (page.id !== currentPageId) return page;
            
            const reversedItems = [...page.items].sort((a, b) => a.zIndex - b.zIndex).reverse();
            const oldIndex = reversedItems.findIndex(i => i.id === activeId);
            const newIndex = reversedItems.findIndex(i => i.id === overId);
            
            const reorderedReversed = arrayMove(reversedItems, oldIndex, newIndex);
            
            const finalOrderedItems = reorderedReversed.reverse();
            const idToZIndexMap = new Map();
            finalOrderedItems.forEach((item, index) => {
                idToZIndexMap.set(item.id, BASE_Z_INDEX + index);
            });

            const newItems = page.items.map(item => ({
                ...item,
                zIndex: idToZIndexMap.get(item.id) ?? item.zIndex
            }));

            return { ...page, items: newItems };
        }), true);
    }, [currentPageId, setPages]);


    const handleCopy = useCallback(() => { if (!selectedItemId || !currentPage) return; const item = currentPage.items.find(i => i.id === selectedItemId); if (item) setClipboard(item); }, [selectedItemId, currentPage]);
    const handlePaste = useCallback(() => { if (!clipboard || !currentPage) return; const newItem = { ...clipboard, id: uuidv4(), x: clipboard.x + 20, y: clipboard.y + 20, zIndex: getNextZIndex(), isEditing: false, locked: false }; setPages(pages.map(p => p.id === currentPageId ? { ...p, items: [...p.items, newItem] } : p), true); setSelectedItemId(newItem.id); }, [clipboard, currentPage, currentPageId, getNextZIndex, pages, setPages]);
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            const meta = e.ctrlKey || e.metaKey;
            if (meta && e.key === 'z') { e.preventDefault(); handleUndo(); }
            if (meta && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) { e.preventDefault(); handleRedo(); }
            if (meta && e.key === 'c') { e.preventDefault(); handleCopy(); }
            if (meta && e.key === 'v') { e.preventDefault(); handlePaste(); }
            if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); if (selectedItemId) handleDeleteItem(selectedItemId); }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo, handleRedo, handleCopy, handlePaste, handleDeleteItem, selectedItemId]);
    useEffect(() => {
        const bgCanvas = document.getElementById(`background-canvas-${currentPage?.id}`);
        if (!bgCanvas || !currentPage) return;
        const bgCtx = bgCanvas.getContext('2d');
        bgCanvas.width = currentCanvasWidth;
        bgCanvas.height = currentCanvasHeight;
        bgCtx.clearRect(0, 0, currentCanvasWidth, currentCanvasHeight);
        bgCtx.fillStyle = currentBackgroundColor || '#FFFFFF';
        bgCtx.fillRect(0, 0, currentCanvasWidth, currentCanvasHeight);
        if (currentBackgroundImage) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => bgCtx.drawImage(img, 0, 0, currentCanvasWidth, currentCanvasHeight);
            img.onerror = () => console.error(`Không thể tải ảnh nền cho canvas: ${currentBackgroundImage}`);
            img.src = currentBackgroundImage;
        }

    }, [currentBackgroundImage, currentBackgroundColor, currentCanvasWidth, currentCanvasHeight, currentPage]);
    useEffect(() => {
        const gridCanvas = document.getElementById(`grid-canvas-${currentPage?.id}`); 
        if (!gridCanvas || !currentPage) return; 
        const gridCtx = gridCanvas.getContext('2d');
        
        gridCanvas.width = currentCanvasWidth; 
        gridCanvas.height = currentCanvasHeight; 
        gridCtx.clearRect(0, 0, currentCanvasWidth, currentCanvasHeight);
        
        // Thêm điều kiện && showGrid vào đây
        if (showGrid && gridSize > 0) { 
            gridCtx.strokeStyle = 'rgba(0, 0, 0, 0.1)'; 
            gridCtx.lineWidth = Math.max(0.5, 0.5 / zoomLevel); 
            gridCtx.beginPath();
            for (let x = gridSize; x < currentCanvasWidth; x += gridSize) { gridCtx.moveTo(x, 0); gridCtx.lineTo(x, currentCanvasHeight); }
            for (let y = gridSize; y < currentCanvasHeight; y += gridSize) { gridCtx.moveTo(0, y); gridCtx.lineTo(currentCanvasWidth, y); }
            gridCtx.stroke();
        }
    }, [gridSize, currentCanvasWidth, currentCanvasHeight, zoomLevel, currentPage, showGrid]);
    useEffect(() => {
        const snapCanvas = document.getElementById(`snap-lines-canvas-${currentPage?.id}`);
        if (!snapCanvas || !currentPage) return;
        const snapCtx = snapCanvas.getContext('2d');
        snapCanvas.width = currentCanvasWidth;
        snapCanvas.height = currentCanvasHeight;
        snapCtx.clearRect(0, 0, currentCanvasWidth, currentCanvasHeight);
        if (snapLines.length > 0) {
            snapCtx.strokeStyle = 'rgba(6, 86, 161, 0.9)';
            snapCtx.lineWidth = 1 / zoomLevel;
            snapCtx.setLineDash([4 / zoomLevel, 2 / zoomLevel]);
            snapCtx.beginPath();
            snapLines.forEach(line => {
                if (line.type === 'v') {
                    snapCtx.moveTo(line.x, line.y1);
                    snapCtx.lineTo(line.x, line.y2);
                } else {
                    snapCtx.moveTo(line.x1, line.y);
                    snapCtx.lineTo(line.x2, line.y);
                }
            });
            snapCtx.stroke();
            snapCtx.setLineDash([]);
        }
    }, [snapLines, currentCanvasWidth, currentCanvasHeight, zoomLevel, currentPage]);
    // useEffect(() => { if (canvasWrapperRef.current) canvasWrapperRef.current.style.cursor = isPanning.current ? 'grabbing' : 'grab'; }, [isPanning.current]);
    const handleToggleLayerVisibility = (id) => { const i = currentItems.find(it => it.id === id); if (i) handleUpdateItem(id, { visible: !(i.visible ?? true) }, true); };
    const handleToggleLayerLock = (id) => { const i = currentItems.find(it => it.id === id); if (i) handleUpdateItem(id, { locked: !i.locked }, true); };
    const handleScaleImageToFit = useCallback((id) => {
        const page = pages.find(p => p.id === currentPageId);
        if (!page || !id) return;

        const item = page.items.find(i => i.id === id);
        if (!item || item.type !== 'image' || !item.url) return;

        const cw = page.canvasWidth;
        const ch = page.canvasHeight;
        
        handleUpdateItem(id, {
            width: cw,
            height: ch,
            x: 0,
            y: 0,
        }, true);

    }, [pages, currentPageId, handleUpdateItem]);

    const handleSidebarItemClick = useCallback((itemData) => {
        // 1. Kiểm tra xem đã có trang nào được chọn chưa
        if (!currentPageId) {
            toast.warn("Vui lòng chọn hoặc tạo một trang trước khi thêm đối tượng!");
            return;
        }

        // 2. Gọi hàm thêm tương ứng với loại item
        if (itemData.type === 'image' && itemData.url) {
            addImageToCanvas(itemData.url, currentPageId);
        } else if (itemData.type === 'text' && itemData.content) {
            addTextToCanvas(itemData.content, currentPageId);
        }
    }, [currentPageId, addImageToCanvas, addTextToCanvas]); 
    const generateCanvasFromPage = useCallback(async (page) => {
        const canvas = exportCanvasRef.current;
        if (!canvas || !page) return null;

        canvas.width = page.canvasWidth;
        canvas.height = page.canvasHeight;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = page.backgroundColor || '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (page.backgroundImage) {
            try {
                const img = new Image();
                img.crossOrigin = "anonymous";
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = (err) => reject(new Error('Không thể tải ảnh nền.'));
                    img.src = page.backgroundImage;
                });
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            } catch (e) {
                console.error("Không thể tải ảnh nền để xuất:", e);
                toast.warn('Một ảnh nền không thể tải được và sẽ bị bỏ qua.');
            }
        }


        const sortedItems = [...page.items].sort((a, b) => a.zIndex - b.zIndex);
        for (const item of sortedItems) {
            if (item.visible === false) continue;

            ctx.save();
            
            ctx.translate(item.x + item.width / 2, item.y + item.height / 2);
            ctx.rotate((item.rotation || 0) * Math.PI / 180);
            ctx.translate(-(item.x + item.width / 2), -(item.y + item.height / 2));
            
            ctx.globalAlpha = item.opacity ?? 1;

            if (item.type === 'image' && item.url) {
                try {
                    const img = new Image();
                    img.crossOrigin = "anonymous";
                    await new Promise((resolve, reject) => { // Sửa lỗi cú pháp Promise
                        img.onload = resolve;
                        img.onerror = (err) => reject(new Error(`Không thể tải ảnh: ${item.url}`));
                        img.src = item.url;
                    });

                    // 1. Set clipping path (khung) dựa trên item.shape
                    ctx.beginPath();
                    if (item.shape === 'circle') {
                        const radiusX = item.width / 2;
                        const radiusY = item.height / 2;
                        
                        if (ctx.ellipse) {
                            ctx.ellipse(item.x + radiusX, item.y + radiusY, radiusX, radiusY, 0, 0, Math.PI * 2);
                        } else {
                            const radius = Math.min(radiusX, radiusY);
                            ctx.arc(item.x + radiusX, item.y + radiusY, radius, 0, Math.PI * 2);
                        }
                    } else {
                        // Mặc định là hình chữ nhật
                        ctx.rect(item.x, item.y, item.width, item.height);
                    }
                    ctx.closePath();
                    ctx.clip(); // Áp dụng clipping

                    // 2. Áp dụng filter (nếu có)
                    const filterString = `brightness(${item.brightness ?? 1}) contrast(${item.contrast ?? 1}) grayscale(${item.grayscale ?? 0})`;
                    ctx.filter = filterString;

                    // 3. Tính toán kích thước "object-fit: cover"
                    const frameRatio = item.width / item.height;
                    const imgRatio = img.naturalWidth / img.naturalHeight;
                    
                    let drawWidth, drawHeight;
                    if (imgRatio > frameRatio) {
                        // Ảnh rộng hơn khung
                        drawHeight = item.height;
                        drawWidth = drawHeight * imgRatio;
                    } else {
                        // Ảnh cao hơn khung
                        drawWidth = item.width;
                        drawHeight = drawWidth / imgRatio;
                    }

                    // 4. Lấy vị trí pan/scan
                    const posX = (item.imagePosition?.x || 0);
                    const posY = (item.imagePosition?.y || 0);
                    
                    // 5. Tính toán vị trí vẽ (drawX, drawY)
                    // Căn giữa ảnh (đã "cover") sau đó áp dụng vị trí pan/scan
                    const drawX = item.x - (drawWidth - item.width) / 2 + posX;
                    const drawY = item.y - (drawHeight - item.height) / 2 + posY;

                    // 6. Vẽ ảnh đã được tính toán
                    ctx.drawImage(
                        img,
                        drawX, 
                        drawY,
                        drawWidth,
                        drawHeight
                    );
                    

                } catch (e) {
                    console.error("Không thể tải ảnh của đối tượng để xuất:", e);
                    toast.warn('Một hình ảnh không thể tải được và sẽ bị bỏ qua.');
                }
            } else if (item.type === 'text' && item.content) {
                const fontStyle = item.fontStyle || 'normal';
                const fontWeight = item.fontWeight || 'normal';
                const fontSize = item.fontSize || 16;
                const fontFamily = item.fontFamily || 'Arial';
                ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
                ctx.fillStyle = item.color || '#000000';
                
                const lineHeight = fontSize * 1.4;
                wrapText(ctx, item.content, item.x, item.y + fontSize, item.width, lineHeight, item.textAlign);
            }

            ctx.restore();
        }
        return canvas;
    }, []);


    const handleDownloadPNG = useCallback(async () => {
        if (!currentPage) {
            toast.error("Vui lòng chọn một trang để tải xuống.");
            return;
        }
        handleDownloadMenuClose();
        const promise = generateCanvasFromPage(currentPage).then(canvas => {
            if (canvas) {
                const dataUrl = canvas.toDataURL('image/png');
                triggerDownload(dataUrl, `${slug || 'invitation'}-page.png`);
            } else {
                throw new Error("Không thể tạo ảnh.");
            }
        });
        handlePromiseToast(promise, "Đang xuất ảnh PNG...", "Xuất ảnh PNG thành công!", "Xuất ảnh PNG thất bại.");
    }, [currentPage, generateCanvasFromPage, slug]);

    const handleDownloadPDF = useCallback(async () => {
        if (!pages || pages.length === 0) {
            toast.error("Không có trang nào để tạo PDF.");
            return;
        }
        handleDownloadMenuClose();

        const promise = new Promise(async (resolve, reject) => {
            try {
                const firstPage = pages[0];
                const pdf = new jsPDF({
                    orientation: firstPage.canvasWidth > firstPage.canvasHeight ? 'l' : 'p',
                    unit: 'px',
                    format: [firstPage.canvasWidth, firstPage.canvasHeight]
                });

                for (let i = 0; i < pages.length; i++) {
                    const page = pages[i];
                    const canvas = await generateCanvasFromPage(page);
                    if (canvas) {
                        if (i > 0) {
                            pdf.addPage([page.canvasWidth, page.canvasHeight], page.canvasWidth > page.canvasHeight ? 'l' : 'p');
                        }
                        const dataUrl = canvas.toDataURL('image/png');
                        pdf.addImage(dataUrl, 'PNG', 0, 0, page.canvasWidth, page.canvasHeight);
                    }
                }
                pdf.save(`${slug || 'invitation'}.pdf`);
                resolve();
            } catch (err) {
                console.error(err);
                reject(err);
            }
        });

        handlePromiseToast(promise, "Đang tạo file PDF...", "Tạo PDF thành công!", "Tạo PDF thất bại.");

    }, [pages, generateCanvasFromPage, slug]);
    const handleDownloadZIP = useCallback(async () => {
        if (!pages || pages.length === 0) {
            toast.error("Không có trang nào để tạo file ZIP.");
            return;
        }
        handleDownloadMenuClose();

        const promise = new Promise(async (resolve, reject) => {
            try {
                const zip = new JSZip();
                for (let i = 0; i < pages.length; i++) {
                    const page = pages[i];
                    const canvas = await generateCanvasFromPage(page);
                    if (canvas) {
                        const blob = await new Promise(resolveBlob => canvas.toBlob(resolveBlob, 'image/png'));
                        zip.file(`${slug || 'invitation'}-page-${i + 1}.png`, blob);
                    }
                }
                const zipBlob = await zip.generateAsync({ type: 'blob' });
                triggerDownload(URL.createObjectURL(zipBlob), `${slug || 'invitation'}.zip`);
                resolve();
            } catch (err) {
                console.error("Lỗi khi tạo file ZIP:", err);
                reject(err);
            }
        });

        handlePromiseToast(promise, "Đang nén file ZIP...", "Tạo file ZIP thành công!", "Tạo file ZIP thất bại.");
    }, [pages, generateCanvasFromPage, slug]);


    const activeItem = currentPage ? currentItems.find(i => i.id === selectedItemId) : null;
    if (isMobile) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
                <Paper sx={{ p: 4 }}>
                    <Typography variant="h5" color="text.primary" gutterBottom>Trình chỉnh sửa không hỗ trợ trên di động</Typography>
                    <Typography variant="body1" color="text.secondary">Vui lòng sử dụng trên máy tính để có trải nghiệm tốt nhất.</Typography>
                </Paper>
            </Box>
        );
    }
    const renderPageContent = (page, isActive) => {
        if (!page) return null;
        return (
            <CanvasContainer
                theme={theme}
                ref={canvasContainerRef}
                style={{ width: page.canvasWidth, height: page.canvasHeight }} >
                <StyledCanvas id={`background-canvas-${page.id}`} style={{ zIndex: 1, backgroundColor: page.backgroundColor || '#FFFFFF' }} />
                <StyledCanvas id={`grid-canvas-${page.id}`} style={{ zIndex: 2 }} />
                <StyledCanvas id={`snap-lines-canvas-${page.id}`} style={{ zIndex: 9999 }} />
                {/* SỬA LỖI 2: Xóa AnimatePresence để tránh flicker */}
                {(page.items || []).filter(item => item.visible !== false).sort((a, b) => a.zIndex - b.zIndex).map(item => {
                    const EditorComponent = item.type === 'text' ? TextEditor : ImageEditor;
                    const isItemSelected = isActive && selectedItemId === item.id;
                    return <EditorComponent
                        key={item.id} 
                        item={item} 
                        onUpdateItem={handleUpdateItem}
                        isSelected={isItemSelected} 
                        onSelectItem={handleSelectItem}
                        canvasRef={canvasContainerRef} 
                        zoomLevel={zoomLevel}
                        snapToGrid={true}
                        gridSize={gridSize} 
                        allItems={page.items} 
                        onSetSnapLines={setSnapLines}
                        snapToObject={snapToObject} 
                        id={`design-item-${item.id}`} // Đặt ID cho DOM element
                        />;
                })}
            </CanvasContainer>
        );
    };


    const renderSecondarySidebar = () => {
        if (isScrolledToSettings) {
            if (selectedSettingField && selectedSettingField !== 'invitationType') { // Cập nhật điều kiện
                return (
                    <Box sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>{SETTINGS_META[selectedSettingField]?.label || 'Chỉnh sửa'}</Typography>
                        <SettingsPropertyEditor
                            selectedKey={selectedSettingField}
                            settings={eventSettings}
                            setSettings={setEventSettings}
                            customFonts={customFonts}
                            itemToEdit={itemToEdit}
                            setItemToEdit={setItemToEdit}
                            localItemData={localItemData}
                            setLocalItemData={setLocalItemData}
                        />
                    </Box>
                );
            }
            const currentBlockTypes = new Set(eventBlocks.map(b => b.type));
            const allToggleableBlocks = Object.entries(AVAILABLE_BLOCKS).filter(([type, config]) => !config.required);

            return (
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box>
                        <Typography variant="h6" gutterBottom sx={{ mb: 1.5 }}>{SETTINGS_META['invitationType'].label}</Typography>
                        <SettingsPropertyEditor
                            selectedKey="invitationType"
                            settings={eventSettings}
                            setSettings={setEventSettings}
                            customFonts={customFonts}
                            itemToEdit={itemToEdit}
                            setItemToEdit={setItemToEdit}
                        />
                    </Box>
                    <Divider />

                    <Box>
                        <Typography variant="h6" gutterBottom>Quản lý Khối</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Thêm hoặc xóa các khối nội dung cho trang sự kiện của bạn.
                        </Typography>
                        <List>
                            {allToggleableBlocks.map(([type, config]) => {
                                // Kiểm tra xem khối này đã được thêm vào canvas/settings chưa
                                const isSelected = currentBlockTypes.has(type);

                                return (
                                    <ListItemButton 
                                        key={type} 
                                        onClick={() => {
                                            if (isSelected) {
                                                // Nếu ĐÃ CHỌN -> Tìm ID của khối đó và Xóa
                                                const blockToRemove = eventBlocks.find(b => b.type === type);
                                                if (blockToRemove) handleRemoveBlock(blockToRemove.id);
                                            } else {
                                                // Nếu CHƯA CHỌN -> Thêm mới
                                                handleAddBlock(type);
                                            }
                                        }}
                                        sx={{ 
                                            alignItems: 'flex-start', 
                                            py: 1.5,
                                            pr: 5, // Thêm padding-right để text không bị đè bởi checkbox
                                            borderRadius: 1.5, // Bo góc mượt hơn
                                            mb: 1,
                                            position: 'relative', // Quan trọng: Để định vị absolute cho Checkbox
                                            border: '1px solid',
                                            borderColor: isSelected ? 'primary.main' : 'divider', // Đổi màu viền nếu được chọn
                                            backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.05)' : 'transparent', // Nền xanh nhạt nếu được chọn
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'action.hover',
                                            }
                                        }}
                                    >
                                        <ListItemIcon sx={{ mt: 0.5, minWidth: 40, color: isSelected ? 'primary.main' : 'inherit' }}>
                                            {config.icon}
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary={config.label} 
                                            secondary={config.description}
                                            primaryTypographyProps={{ 
                                                variant: 'subtitle2', 
                                                fontWeight: 600,
                                                color: isSelected ? 'primary.main' : 'text.primary' // Đổi màu chữ nếu chọn
                                            }}
                                            secondaryTypographyProps={{ 
                                                variant: 'caption', 
                                                color: 'text.secondary',
                                                sx: { display: 'block', mt: 0.5, lineHeight: 1.4 } 
                                            }}
                                        />
                                        
                                        {/* Checkbox ở góc trên bên phải */}
                                        <Checkbox
                                            checked={isSelected}
                                            size="small"
                                            disableRipple
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                p: 0.5,
                                                '&.Mui-checked': {
                                                    color: 'primary.main',
                                                }
                                            }}
                                            // Không cần onchange vì sự kiện click đã được bắt bởi ListItemButton bọc ngoài
                                        />
                                    </ListItemButton>
                                );
                            })}
                        </List>
                    </Box>
                </Box>
            );
        }
        if (activeItem) {
            return (
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Thuộc tính</Typography>
                    {activeItem.type === 'text' && <TextToolbar item={activeItem} onUpdate={handleUpdateItem} />}
                    {activeItem.type === 'text' && <TextPropertyEditor item={activeItem} onUpdate={handleUpdateItem} customFonts={customFonts} />}
                    {activeItem.type === 'image' && <ImagePropertyEditor item={activeItem} onUpdate={handleUpdateItem} onScaleToCanvas={handleScaleImageToFit} />}
                </Box>
            );
        }
        if (selectedSettingField) {
            return (
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>{SETTINGS_META[selectedSettingField]?.label || 'Chỉnh sửa'}</Typography>
                    <SettingsPropertyEditor
                        selectedKey={selectedSettingField}
                        settings={eventSettings}
                        setSettings={setEventSettings}
                        customFonts={customFonts}
                        itemToEdit={itemToEdit}
                        setItemToEdit={setItemToEdit}
                        localItemData={localItemData}
                        setLocalItemData={setLocalItemData}
                    />
                </Box>
            );
        }
        switch (activeTool) {
            case 'templates':
                return <Box sx={{ p: 2 }}><TemplatePickerIntegrated templates={backendTemplates} onSelectTemplate={handleSelectTemplate} /></Box>;
            case 'user-images':
                return <Box sx={{ p: 2 }}><UserImageManager userImages={userUploadedImages} onSelectUserImage={handleSidebarItemClick} onImageUploaded={handleUserImageFileUpload} isUploading={isUploading} selectedIds={selectedUserImageIds} onToggleSelect={handleToggleSelectUserImage} /></Box>;
            case 'icons':
                return <Box sx={{ p: 2 }}><GenericImagePicker images={iconImages} title="Chọn Icon" onItemClick={handleSidebarItemClick} /></Box>;
            case 'components':
                return <Box sx={{ p: 2 }}><GenericImagePicker images={componentImages} title="Chọn Thành Phần" onItemClick={handleSidebarItemClick} /></Box>;
            case 'tags':
                return <Box sx={{ p: 2 }}><GenericImagePicker images={tagImages} title="Chọn Tag/Khung" onItemClick={handleSidebarItemClick} /></Box>;
            case 'create-new':
                return <Box sx={{ p: 2 }}><BlankCanvasCreator onCreate={handleCreateBlankCanvas} /></Box>;
            default:
                return (
                    <IntegratedSidebarPanel
                        pages={pages}
                        currentPageId={currentPageId}
                        currentItems={currentItems}
                        selectedItemId={selectedItemId}
                        currentBackgroundColor={currentBackgroundColor}
                        currentBackgroundImage={currentBackgroundImage}
                        onSelectPage={(pageId) => {
                            setCurrentPageId(pageId);
                            scrollToPage(pageId);
                        }}
                        onDeletePage={handleDeletePage}
                        onReorderPages={handleReorderPages}
                        onAddPage={handleAddPage}
                        onSelectItem={handleSelectItem}
                        onToggleVisibility={handleToggleLayerVisibility}
                        onToggleLock={handleToggleLayerLock}
                        onBackgroundColorChange={handleBackgroundColorChange}
                        onBackgroundImageChange={handleBackgroundImageChange}
                        onRemoveBackgroundImage={handleRemoveBackgroundImage}
                        onReorderItems={handleReorderItems}
                    />
                );
        }
    };
    
    return (
        <>
            <Helmet>
                <style>
                    {customFonts.map(font => `
                        @font-face {
                            font-family: "${font.name}";
                            src: url('${font.url}');
                        }
                    `).join('\n')}
                </style>
            </Helmet>
            <DndContext 
                        onDragStart={handleDragStart} 
                        onDragEnd={handleDragEnd}
                        sensors={sensors} // Sử dụng PointerSensor cho trải nghiệm kéo thả mượt mà
            >             
                <DndCursorManager />    
                <Box sx={{ display: 'flex', height: '100vh', flexDirection: 'column', bgcolor: 'background.default' }}>
                    <Paper square elevation={0} sx={{ display: 'flex', alignItems: 'center', p: '8px 16px', flexShrink: 0, height: 64, zIndex: (theme) => theme.zIndex.drawer + 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                        <Tooltip title="Quay về trang quản lý thiệp">
                            <IconButton onClick={handleNavigateBack} sx={{ mr: 1.5 }}>
                                <ArrowBackIcon />
                            </IconButton>
                        </Tooltip>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mr: 2 }}>{invitationId ? 'Chỉnh sửa thiệp' : 'Tạo thiệp mới'}</Typography>
                        <TextField label="Tên thiệp" variant="outlined" size="small" value={slug} onChange={(e) => setSlug(e.target.value)} sx={{ ml: 'auto', mr: 2, minWidth: '300px', '.MuiOutlinedInput-root': { borderRadius: 2 } }} />
                        <Button variant="outlined" color="primary" onClick={handleDownloadMenuOpen} size="medium" startIcon={<DownloadIcon />} sx={{marginRight: "6px"}}>Tải về</Button>
                        <Menu anchorEl={downloadMenuAnchorEl} open={Boolean(downloadMenuAnchorEl)} onClose={handleDownloadMenuClose}>
                            <MenuItem onClick={handleDownloadPNG}>Tải về PNG (Trang hiện tại)</MenuItem>
                            <MenuItem onClick={handleDownloadZIP}>Tải về ZIP (Tất cả trang PNG)</MenuItem>
                            <MenuItem onClick={handleDownloadPDF}>Tải về PDF (Tất cả trang)</MenuItem>
                        </Menu>
                        {!showSettingsPanel ? (
                            // CHỈ HIỂN THỊ NÚT "TIẾP THEO" KHI CHƯA CUỘN XUỐNG
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleNextButtonClick}
                                size="medium"
                                startIcon={<NavigateNextIcon />}
                                disabled={saving || loading}
                            >
                                Tiếp theo
                            </Button>
                        ) : (
                            // HIỂN THỊ CÁC NÚT CÒN LẠI SAU KHI ĐÃ NHẤN "TIẾP THEO"
                            <>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={handlePreviewInNewTab}
                                    size="medium"
                                    startIcon={<VisibilityIcon />}
                                    disabled={saving || loading}
                                >
                                    Xem trước
                                </Button>

                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleNextButtonClick}
                                    size="medium"
                                    startIcon={<Save />}
                                    sx={{ ml: 1.5 }}
                                    disabled={saving || loading}
                                >
                                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </Button>
                            </>
                        )}
                    </Paper>

                    <FloatingSelectionBar 
                        count={selectedUserImageIds.length} 
                        onClear={handleClearUserImageSelection} 
                        onDelete={handleDeleteSelectedUserImages} 
                        isDeleting={isDeletingImages} 
                    />

                    <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
                        <Box sx={{ display: 'flex', flexShrink: 0, height: 'calc(100vh - 64px)' }}>
                            <Paper
                                square
                                elevation={0}
                                sx={{
                                    width: LEFT_PRIMARY_SIDEBAR_WIDTH,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    py: 2,
                                    borderRight: `1px solid ${theme.palette.divider}`
                                }}
                            >
                                <List sx={{ width: '100%' }}>
                                    {isScrolledToSettings ? (
                                        <>
                                            <ListItemButton selected={!selectedSettingField} onClick={() => handleSelectSettingField(null)} sx={{ flexDirection: 'column', px: 1, mb: 1 }}>
                                                <ViewModuleIcon />
                                                <ListItemText primary="Các Khối" primaryTypographyProps={{ variant: 'caption' }} />
                                            </ListItemButton>
                                        </>
                                    ) : (
                                        <>
                                            <ListItemButton selected={activeTool === 'pages'} onClick={() => handleSetActiveTool('pages')} sx={{ flexDirection: 'column', px: 1, mb: 1 }}><FileCopyIcon /><ListItemText primary="Trang" primaryTypographyProps={{ variant: 'caption' }} /></ListItemButton>
                                            <ListItemButton selected={activeTool === 'templates'} onClick={() => handleSetActiveTool('templates')} sx={{ flexDirection: 'column', px: 1, mb: 1 }}><StyleIcon /><ListItemText primary="Mẫu" primaryTypographyProps={{ variant: 'caption' }} /></ListItemButton>
                                            <ListItemButton selected={activeTool === 'create-new'} onClick={() => handleSetActiveTool('create-new')} sx={{ flexDirection: 'column', px: 1, mb: 1 }}>
                                                <AddCircleOutlineIcon />
                                                <ListItemText primary="Tạo mới" primaryTypographyProps={{ variant: 'caption' }} />
                                            </ListItemButton>
                                            <DraggableSidebarItem data={{ id: 'sidebar-text-item', type: 'text', content: 'Nội dung mới' }}>
                                                <ListItemButton sx={{ flexDirection: 'column', px: 1, mb: 1, cursor: 'grab' }} component="div" onClick={() => handleSidebarItemClick({ type: 'text', content: 'Nội dung mới' })}>
                                                    <TextFieldsIcon />
                                                    <ListItemText primary="Văn bản" primaryTypographyProps={{ variant: 'caption' }} />
                                                </ListItemButton>
                                            </DraggableSidebarItem>
                                            <ListItemButton selected={activeTool === 'user-images'} onClick={() => handleSetActiveTool('user-images')} sx={{ flexDirection: 'column', px: 1, mb: 1 }}><CloudUploadIcon /><ListItemText primary="Tải lên" primaryTypographyProps={{ variant: 'caption' }} /></ListItemButton>
                                            <ListItemButton selected={activeTool === 'icons'} onClick={() => handleSetActiveTool('icons')} sx={{ flexDirection: 'column', px: 1, mb: 1 }}><ImageIcon /><ListItemText primary="Icon" primaryTypographyProps={{ variant: 'caption' }} /></ListItemButton>
                                            <ListItemButton selected={activeTool === 'components'} onClick={() => handleSetActiveTool('components')} sx={{ flexDirection: 'column', px: 1, mb: 1 }}><CategoryIcon /><ListItemText primary="Thành phần" primaryTypographyProps={{ variant: 'caption' }} /></ListItemButton>
                                            <ListItemButton selected={activeTool === 'tags'} onClick={() => handleSetActiveTool('tags')} sx={{ flexDirection: 'column', px: 1, mb: 1 }}><LabelIcon /><ListItemText primary="Tag/Khung" primaryTypographyProps={{ variant: 'caption' }} /></ListItemButton>
                                        </>
                                    )}
                                </List>
                            </Paper>
                            <Paper
                                square
                                elevation={0}
                                sx={{
                                    width: LEFT_SECONDARY_SIDEBAR_WIDTH,
                                    height: '100%',
                                    borderRight: `1px solid ${theme.palette.divider}`,
                                    overflowY: 'auto'
                                }}
                            >
                                {renderSecondarySidebar()}
                            </Paper>
                        </Box>
                        <Box ref={centralColumnRef} sx={{ flexGrow: 1, height: 'calc(100vh - 64px)', overflowY: 'auto', bgcolor: 'background.default' }}>
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                p: 2
                            }}>
                                <Paper elevation={0} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, gap: 1, flexShrink: 0, flexWrap: 'wrap', mb: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Tooltip title="Hoàn tác (Ctrl+Z)"><IconButton size="small" onClick={handleUndo} disabled={history.index < 0}><UndoIcon /></IconButton></Tooltip>
                                        <Tooltip title="Làm lại (Ctrl+Y)"><IconButton size="small" onClick={handleRedo} disabled={history.index >= history.stack.length - 1}><RedoIcon /></IconButton></Tooltip>
                                        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                                        <Tooltip title="Sao chép (Ctrl+C)"><IconButton size="small" onClick={handleCopy} disabled={!activeItem}><ContentCopyIcon /></IconButton></Tooltip>
                                        <Tooltip title="Dán (Ctrl+V)"><IconButton size="small" onClick={handlePaste} disabled={!clipboard}><ContentPasteIcon /></IconButton></Tooltip>
                                    </Box>
                                    {activeItem && !activeItem.locked && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Tooltip title="Độ mờ"><OpacityIcon fontSize="small" sx={{ color: 'text.secondary' }} /></Tooltip>
                                            <Slider value={activeItem.opacity} onChange={(_e, val) => handleUpdateItem(selectedItemId, { opacity: val }, false)} onChangeCommitted={() => handleUpdateItem(selectedItemId, {}, true)} min={0} max={1} step={0.01} sx={{ width: 100 }} size="small" />
                                            <Divider orientation="vertical" flexItem />
                                            <Tooltip title="Đưa lên trên"><IconButton size="small" onClick={() => handleBringToFront(selectedItemId)}><FlipToFrontIcon /></IconButton></Tooltip>
                                            <Tooltip title="Đưa xuống dưới"><IconButton size="small" onClick={() => handleSendToBack(selectedItemId)}><FlipToBackIcon /></IconButton></Tooltip>
                                            <Tooltip title="Xóa đối tượng"><IconButton size="small" color="error" onClick={() => handleDeleteItem(selectedItemId)}><DeleteIcon /></IconButton></Tooltip>
                                        </Box>
                                    )}
                                </Paper>
                                <Box sx={{ flexGrow: 1, position: 'relative' }}>
                                    <CanvasWrapper
                                        ref={(node) => {
                                            canvasWrapperRef.current = node;
                                        }}
                                        onMouseDown={handleCanvasWrapperMouseDown}
                                        onContextMenu={handleCanvasWrapperContextMenu}
                                        sx={{
                                            borderRadius: 2,
                                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                            display: 'block',
                                            overflowY: 'auto',
                                            scrollSnapType: 'y mandatory',
                                            padding: '20px 0',
                                        }}
                                    >
                                        {pages.length > 0 ? (
                                            // Box này chỉ để căn giữa các trang theo chiều dọc
                                            <Box sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: `40px`, // Khoảng cách giữa các trang
                                            }}>
                                                {/* LẶP QUA MẢNG PAGES Ở ĐÂY */}
                                                {pages.map((page) => (
                                                    // VỚI MỖI `page`, TẠO RA MỘT `DroppablePage`
                                                    <DroppablePage key={page.id} page={page} viewScale={zoomLevel}>
                                                        {/* `renderPageContent` sẽ render nội dung thực tế của trang */}
                                                        {renderPageContent(page, page.id === currentPageId)}
                                                    </DroppablePage>
                                                ))}
                                            </Box>
                                        ) : (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                                <Paper sx={{ p: 4, textAlign: 'center', flexShrink: 0 }}>
                                                    <Typography variant="h5" color="text.secondary">Bắt đầu thiết kế</Typography>
                                                    <Typography color="text.secondary">Chọn hoặc tạo mẫu thiệp mới.</Typography>
                                                </Paper>
                                            </Box>
                                        )}
                                    </CanvasWrapper>
                                </Box>
                                <Paper elevation={0} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, p: 1, flexShrink: 0, borderRadius: 2, mt: 2, border: `1px solid ${theme.palette.divider}` }}>
                                    <Tooltip title={showGrid ? "Tắt lưới" : "Bật lưới"}>
                                        <IconButton 
                                            onClick={() => setShowGrid(!showGrid)} 
                                            size="small" 
                                            color={showGrid ? "primary" : "default"}
                                            disabled={!currentPageId}
                                        >
                                            {showGrid ? <GridOnIcon /> : <GridOffIcon />}
                                        </IconButton>
                                    </Tooltip>
                                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                                    <IconButton onClick={handleZoomOut} disabled={zoomLevel <= MIN_ZOOM || !currentPageId} size="small"><ZoomOutIcon /></IconButton>
                                    <Slider value={zoomLevel} onChange={handleZoomSliderChange} min={MIN_ZOOM} max={MAX_ZOOM} step={0.01} sx={{ width: 150, mx: 1 }} size="small" disabled={!currentPageId} />
                                    <Typography variant="body2" sx={{ minWidth: '50px', textAlign: 'center', color: 'text.secondary' }}>{currentPageId ? `${Math.round(zoomLevel * 100)}%` : '0%'}</Typography>
                                    <IconButton onClick={handleZoomIn} disabled={zoomLevel >= MAX_ZOOM || !currentPageId} size="small"><ZoomInIcon /></IconButton>
                                    <Tooltip title="Vừa với màn hình"><IconButton onClick={fitToScreen} disabled={!currentPageId} size="small"><CenterFocusStrongIcon /></IconButton></Tooltip>
                                </Paper>
                            </Box>
                            {showSettingsPanel && (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                >
                                    <Box ref={settingsPanelRef} sx={{ px: 2, pb: 2 }}>
                                        <VisualSettingsEditor
                                            settings={eventSettings}
                                            onSelectField={handleSelectSettingField}
                                            selectedFieldKey={selectedSettingField}
                                            eventBlocks={eventBlocks}
                                            onSelectBlock={handleSelectBlock}
                                            onRemoveBlock={handleRemoveBlock}
                                            onReorderBlocks={handleReorderBlocks}
                                            onEditItem={handleEditItem}
                                            onUpdateSetting={handleUpdateSetting}
                                        />
                                    </Box>
                                </motion.div>
                            )}
                        </Box>
                    </Box>
                    <canvas ref={exportCanvasRef} style={{ display: 'none' }} />
                </Box>
                <DragOverlay modifiers={[snapCenterToCursor]}>
                    {activeDragItem ? (
                        activeDragItem.type === 'image' ? (
                            <Card sx={{ width: 150, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CardMedia component="img" image={activeDragItem.url} sx={{ objectFit: 'contain', p: 1, maxHeight: '100%', maxWidth: '100%' }} />
                            </Card>
                        ) : (
                            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TextFieldsIcon />
                                <Typography>{activeDragItem.content}</Typography>
                            </Paper>
                        )
                    ) : null}
                </DragOverlay>
        </DndContext>
        <Dialog
            open={showExitConfirm}
            onClose={() => setShowExitConfirm(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {"Bạn có thay đổi chưa lưu"}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Bạn có muốn lưu lại các thay đổi của mình trước khi thoát không?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setShowExitConfirm(false)} color="primary">
                    Hủy
                </Button>
                <Button onClick={() => {
                    setShowExitConfirm(false);
                    navigate('/invitation-management?tab=guests'); // Nút "Thoát (Không lưu)"
                }} color="error">
                    Thoát (Không lưu)
                </Button>
                <Button onClick={() => {
                    setShowExitConfirm(false);
                    executeSaveChanges(); // Hàm này đã bao gồm navigate sau khi lưu thành công
                }} color="primary" variant="contained" autoFocus>
                    Lưu và Thoát
                </Button>
            </DialogActions>
        </Dialog>
        {showEnvelopeFlow && (
            <EnvelopeFlow
                onComplete={handleFlowComplete}
                onCancel={handleFlowCancel}
                
                // Dữ liệu từ THIỆP của bạn (giữ nguyên)
                frontCoverUrl={pages[0]?.backgroundImage} 
                backCoverUrl={pages[pages.length - 1]?.backgroundImage || pages[0]?.backgroundImage}
                
                // Dữ liệu từ PHONG BÌ (thay thế bằng state)
                envelopeFrontUrl={selectedEnvelope.envelopeFrontUrl}
                envelopeBackUrl={selectedEnvelope.envelopeBackUrl}
                lidOuterUrl={selectedEnvelope.lidOuterUrl}
                lidInnerUrl={selectedEnvelope.lidInnerUrl}
            />
        )}
        </>
    );
};
const DesignContent = () => {
    return <WeddingInvitationEditor />;
};
export default DesignContent;