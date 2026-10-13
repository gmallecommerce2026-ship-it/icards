import React, { useCallback, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import './CustomEditor.css'; 

import api from '../../services/api'; // API của user
import { toast } from 'react-toastify';
import {
    Bold, Italic, Strikethrough, Underline as UnderlineIcon, Pilcrow,
    Heading1, Heading2, Heading3, List, ListOrdered,
    Quote, Code, Minus, Link2, Image as ImageIcon,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    PaintBucket, Highlighter, Undo, Redo, Code2,
    PanelLeft, PanelRight, AlignCenterHorizontal,
    Table as TableIcon, Trash2, Columns, Rows, Combine, SplitSquareHorizontal
} from 'lucide-react';

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: '100%' },
      height: { default: 'auto' },
      'data-float': {
        default: null,
        renderHTML: attributes => ({ 'data-float': attributes['data-float'] }),
        parseHTML: element => element.getAttribute('data-float'),
      }
    };
  },
});

const ImageActionMenu = ({ editor, menuPosition, onUpdate, onHide }) => {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) onHide();
        };
        if (menuPosition.visible) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuPosition.visible, onHide]);

    if (!editor || !menuPosition.visible) return null;

    const handleSetWidth = (e) => onUpdate({ width: `${e.target.value}%` });
    const currentWidth = editor.getAttributes('image').width?.replace('%', '') || 100;
    const currentFloat = editor.getAttributes('image')['data-float'];

    return (
        <div ref={menuRef} className="image-action-menu" style={{ top: menuPosition.top, left: menuPosition.left }}>
            <button type="button" onClick={() => onUpdate({ 'data-float': 'left' })} className={currentFloat === 'left' ? 'is-active' : ''} title="Căn trái, chữ bao quanh"><PanelLeft size={18} /></button>
            <button type="button" onClick={() => onUpdate({ 'data-float': null })} className={!currentFloat ? 'is-active' : ''} title="Ở giữa (Mặc định)"><AlignCenterHorizontal size={18} /></button>
            <button type="button" onClick={() => onUpdate({ 'data-float': 'right' })} className={currentFloat === 'right' ? 'is-active' : ''} title="Căn phải, chữ bao quanh"><PanelRight size={18} /></button>
            <div className="divider"></div>
            <input type="range" min="20" max="100" value={currentWidth} onChange={handleSetWidth} className="image-width-slider" title={`Kích thước: ${currentWidth}%`} />
        </div>
    );
};
// Thêm component này ngay trên MenuBar
const TableGridSelector = ({ editor }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [gridSize, setGridSize] = useState({ rows: 0, cols: 0 });
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);

    const MAX_ROWS = 10;
    const MAX_COLS = 10;

    // Hàm tính toán vị trí động tránh mọi hiện tượng tràn hoặc khuất màn hình
    const updatePosition = () => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        
        const dropdownWidth = 234;  // Chiều rộng ước tính của dropdown (10 ô * 18px + gaps + paddings)
        const dropdownHeight = 246; // Chiều cao ước tính của dropdown 
        
        let top = rect.bottom + window.scrollY + 6; // Mặc định hiển thị phía dưới nút
        let left = rect.left + window.scrollX;

        // 1. Kiểm tra cận đáy màn hình (Smart Flip giống Word)
        const spaceBelow = window.innerHeight - rect.bottom;
        if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
            top = rect.top + window.scrollY - dropdownHeight - 6; // Lật ngược dropdown lên trên nút
        }

        // 2. Kiểm tra cận rìa phải màn hình (Chống tràn bề ngang khi sidebar quá bé)
        if (left + dropdownWidth > window.innerWidth) {
            left = window.innerWidth - dropdownWidth - 16;
        }

        setCoords({ top, left });
    };

    const toggleMenu = () => {
        if (!isOpen) {
            updatePosition();
        }
        setIsOpen(!isOpen);
    };

    // Quản lý sự kiện click ngoài vùng và cập nhật lại tọa độ khi cuộn trang/thay đổi kích thước cửa sổ
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                buttonRef.current && !buttonRef.current.contains(event.target) &&
                dropdownRef.current && !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
                setGridSize({ rows: 0, cols: 0 });
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            window.addEventListener("scroll", updatePosition, { passive: true });
            window.addEventListener("resize", updatePosition);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", updatePosition);
            window.removeEventListener("resize", updatePosition);
        };
    }, [isOpen]);

    const handleInsertTable = (rows, cols) => {
        if (rows > 0 && cols > 0) {
            editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
        }
        setIsOpen(false);
        setGridSize({ rows: 0, cols: 0 });
    };

    return (
        <div style={{ display: 'inline-flex', alignItems: 'center' }}>
            <button
                ref={buttonRef}
                type="button"
                onClick={toggleMenu}
                title="Chèn Bảng"
                className={isOpen || editor.isActive('table') ? 'is-active' : ''}
            >
                <TableIcon size={16} />
            </button>

            {/* Bắn phần dropdown này thẳng ra body, bỏ qua thuộc tính overflow của sidebar */}
            {isOpen && createPortal(
                <div 
                    ref={dropdownRef}
                    className="table-grid-dropdown-portal" 
                    style={{
                        position: 'absolute', 
                        top: `${coords.top}px`, 
                        left: `${coords.left}px`,
                        backgroundColor: '#fff', 
                        border: '1px solid #e2e8f0',
                        padding: '12px', 
                        zIndex: 99999, // Đặt chỉ số z-index tuyệt đối để đè lên mọi panel canvas
                        borderRadius: '4px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                        pointerEvents: 'auto'
                    }}
                >
                    <div className="table-grid-label" style={{ marginBottom: '8px', fontSize: '13px', textAlign: 'center', fontWeight: 500, color: '#333' }}>
                        {gridSize.cols > 0 && gridSize.rows > 0 ? `${gridSize.cols} x ${gridSize.rows}` : 'Chọn kích thước'}
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${MAX_COLS}, 18px)`, gap: '4px' }}>
                        {Array.from({ length: MAX_ROWS }).map((_, rIndex) => (
                            Array.from({ length: MAX_COLS }).map((_, cIndex) => {
                                const r = rIndex + 1;
                                const c = cIndex + 1;
                                const isHovered = r <= gridSize.rows && c <= gridSize.cols;

                                return (
                                    <div
                                        key={`${r}-${c}`}
                                        onMouseEnter={() => setGridSize({ rows: r, cols: c })}
                                        onClick={() => handleInsertTable(r, c)}
                                        style={{
                                            width: '18px', 
                                            height: '18px',
                                            border: isHovered ? '1px solid #2563eb' : '1px solid #cbd5e1',
                                            backgroundColor: isHovered ? '#bfdbfe' : '#f8fafc',
                                            cursor: 'pointer',
                                            borderRadius: '3px',
                                            transition: 'background-color 0.05s ease, border-color 0.05s ease'
                                        }}
                                    />
                                );
                            })
                        ))}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
const MenuBar = ({ editor, onHtmlToggle, isHtmlMode }) => {
    const fileInputRef = useRef(null);

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        // Dùng key 'images' cho API User
        formData.append('images', file); 

        const toastId = toast.loading("Đang tải ảnh lên...");
        try {
            // Gọi API User
            const response = await api.post('/users/me/upload-images', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (response.data && response.data.data && response.data.data.length > 0) {
                const imageUrl = response.data.data[0].url;
                editor.chain().focus().setImage({ src: imageUrl, width: '50%' }).run();
                toast.update(toastId, { render: "Tải ảnh thành công!", type: "success", isLoading: false, autoClose: 3000 });
            } else {
                 toast.update(toastId, { render: "Server không trả về URL ảnh.", type: "error", isLoading: false, autoClose: 5000 });
            }
        } catch (error) {
            console.error("Lỗi tải ảnh:", error);
            toast.update(toastId, { render: `Lỗi: ${error.response?.data?.message || 'Không thể tải ảnh'}`, type: "error", isLoading: false, autoClose: 5000 });
        } finally {
            if(fileInputRef.current) fileInputRef.current.value = '';
        }
    };
    
    const addImage = () => fileInputRef.current?.click();

    const setLink = useCallback(() => {
        if (!editor) return;
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    if (!editor) return null;

    return (
        <div className="tiptap-menubar">
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{ display: 'none' }} accept="image/*" />
            
            <button type="button" onClick={onHtmlToggle} className={isHtmlMode ? 'is-active' : ''} title="HTML Source"><Code2 size={16} /></button>
            <div className="divider"></div>
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''}><Bold size={16} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''}><Italic size={16} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'is-active' : ''}><UnderlineIcon size={16} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'is-active' : ''}><Strikethrough size={16} /></button>
            <div className="divider"></div>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}><Heading1 size={16} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}><Heading2 size={16} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}><Heading3 size={16} /></button>
            <button type="button" onClick={() => editor.chain().focus().setParagraph().run()} className={editor.isActive('paragraph') ? 'is-active' : ''}><Pilcrow size={16} /></button>
            <div className="divider"></div>
            <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'is-active' : ''}><List size={16} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'is-active' : ''}><ListOrdered size={16} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'is-active' : ''}><Quote size={16} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive('codeBlock') ? 'is-active' : ''}><Code size={16} /></button>
            <div className="divider"></div>
            <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}><AlignLeft size={16} /></button>
            <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}><AlignCenter size={16} /></button>
            <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}><AlignRight size={16} /></button>
            <button type="button" onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}><AlignJustify size={16} /></button>
            <div className="divider"></div>
            <button type="button" onClick={setLink} className={editor.isActive('link') ? 'is-active' : ''}><Link2 size={16} /></button>
            <button type="button" onClick={addImage}><ImageIcon size={16} /></button>
            <div className="divider"></div>
            <div className="color-picker-wrapper" title="Text Color">
                <PaintBucket size={16}/>
                <input type="color" onInput={event => editor.chain().focus().setColor(event.target.value).run()} value={editor.getAttributes('textStyle').color || '#000000'} />
            </div>
             <button type="button" onClick={() => editor.chain().focus().toggleHighlight().run()} className={editor.isActive('highlight') ? 'is-active' : ''}><Highlighter size={16}/></button>
            <div className="divider"></div>
            <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={16} /></button>
            <div className="divider"></div>
            <div className="table-controls" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <TableGridSelector editor={editor} />
                
                {editor.isActive('table') && (
                    <>
                        <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()} title="Thêm cột bên phải"><Columns size={16} /></button>
                        <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()} title="Thêm dòng bên dưới"><Rows size={16} /></button>
                        <button type="button" onClick={() => editor.chain().focus().mergeCells().run()} disabled={!editor.can().mergeCells()} title="Gộp ô (Quét chọn nhiều ô trước)"><Combine size={16} /></button>
                        <button type="button" onClick={() => editor.chain().focus().splitCell().run()} disabled={!editor.can().splitCell()} title="Tách ô"><SplitSquareHorizontal size={16} /></button>
                        <button type="button" onClick={() => editor.chain().focus().deleteTable().run()} title="Xóa toàn bộ bảng" style={{color: 'red'}}><Trash2 size={16} /></button>
                    </>
                )}
            </div>
            <div className="divider"></div>
            <button type="button" onClick={() => editor.chain().focus().undo().run()}><Undo size={16} /></button>
            <button type="button" onClick={() => editor.chain().focus().redo().run()}><Redo size={16} /></button>
        </div>
    );
};

const TipTapEditor = ({ data, onChange }) => {
    const [isHtmlMode, setIsHtmlMode] = useState(false);
    const [htmlContent, setHtmlContent] = useState(data || '');
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, visible: false });

    const editor = useEditor({
        extensions: [
            StarterKit, Underline, TextAlign.configure({ types: ['heading', 'paragraph', 'image'] }),
            TextStyle, Color, Highlight.configure({ multicolor: true }), Link.configure({ openOnClick: false }),
            CustomImage.configure({ inline: false, allowBase64: true }),
            Table.configure({
                resizable: true, 
                HTMLAttributes: {
                    class: 'custom-table', 
                },
            }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: data,
        onUpdate: ({ editor }) => {
            const newHtml = editor.getHTML();
            setHtmlContent(newHtml);
            if (onChange) onChange(newHtml);
        },
        onSelectionUpdate: ({ editor }) => {
            const { selection } = editor.state;
            const node = selection.node;
            if (node && node.type.name === 'image') {
                const nodeView = editor.view.nodeDOM(selection.from); 
                if (nodeView) {
                    const rect = nodeView.getBoundingClientRect();
                    setMenuPosition({
                        top: rect.bottom + window.scrollY + 5, 
                        left: rect.left + window.scrollX + rect.width / 2, 
                        visible: true
                    });
                }
            } else {
                setMenuPosition(prev => ({ ...prev, visible: false }));
            }
        },
    });

    useEffect(() => {
      if (editor && !isHtmlMode && editor.getHTML() !== data) {
          editor.commands.setContent(data, false);
          setHtmlContent(data);
      }
    }, [data, editor, isHtmlMode]);

    const handleHtmlChange = (e) => {
        setHtmlContent(e.target.value);
        if (onChange) onChange(e.target.value);
    };

    const toggleHtmlMode = () => {
        if (!isHtmlMode) setHtmlContent(editor.getHTML());
        else editor.commands.setContent(htmlContent);
        setIsHtmlMode(!isHtmlMode);
    };
    
    useEffect(() => {
        return () => { if (editor) editor.destroy(); };
    }, [editor]);

    return (
        <div className="tiptap-wrapper">
            {editor && <MenuBar editor={editor} onHtmlToggle={toggleHtmlMode} isHtmlMode={isHtmlMode} />}
            {editor && <ImageActionMenu
                editor={editor}
                menuPosition={menuPosition}
                onUpdate={(attrs) => {
                    const currentAttributes = editor.getAttributes('image');
                    editor.chain().focus().updateAttributes('image', { ...currentAttributes, ...attrs }).run();
                }}
                onHide={() => setMenuPosition(prev => ({ ...prev, visible: false }))}
            />}
            {isHtmlMode ? (
                <textarea className="tiptap-html-editor" value={htmlContent} onChange={handleHtmlChange} />
            ) : (
                <EditorContent editor={editor} />
            )}
        </div>
    );
};

// Đảm bảo export default khớp với cách bạn đang import ở các component khác
export default TipTapEditor;