import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import api from '../../../../services/api';
import { showSuccessToast, showErrorToast, handlePromiseToast } from '../../../../Utils/toastHelper';
import _ from 'lodash';
import './InvitationManagementContent.css';
import { FiMail } from 'react-icons/fi';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'; // <--- Thêm Import

const MasterGuestPanel = ({ user, onAddGuestsToInvitation, onClose }) => {
    const [masterGuests, setMasterGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedGuests, setSelectedGuests] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const selectAllCheckboxRef = useRef(null);


    const filteredGuests = useMemo(() => masterGuests.filter(g =>
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (g.email && g.email.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [masterGuests, searchTerm]);
    
    useEffect(() => {
        const fetchMasterGuests = async () => {
            try {
                const response = await api.get('/master-guests');
                setMasterGuests(response.data.data || []);
            } catch (error) {
                showErrorToast("Không thể tải danh bạ khách mời.");
            } finally {
                setLoading(false);
            }
        };
        fetchMasterGuests();
    }, []);

    useEffect(() => {
        if (selectAllCheckboxRef.current) {
            const numSelected = selectedGuests.size;
            const numVisible = filteredGuests.length;
            selectAllCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numVisible;
            selectAllCheckboxRef.current.checked = numVisible > 0 && numSelected === numVisible;
        }
    }, [selectedGuests, filteredGuests]);
    
    const handleSelectGuest = (guestId) => {
        setSelectedGuests(prev => {
            const newSet = new Set(prev);
            if (newSet.has(guestId)) {
                newSet.delete(guestId);
            } else {
                newSet.add(guestId);
            }
            return newSet;
        });
    };
    
    const handleSelectAllGuests = () => {
        if (selectedGuests.size === filteredGuests.length) {
            setSelectedGuests(new Set());
        } else {
            setSelectedGuests(new Set(filteredGuests.map(g => g._id)));
        }
    };


    const handleAddSelectedToInvitation = () => {
        const guestsToAdd = masterGuests.filter(g => selectedGuests.has(g._id));
        if (guestsToAdd.length > 0) {
            onAddGuestsToInvitation(guestsToAdd);
            setSelectedGuests(new Set());
        } else {
            showErrorToast("Vui lòng chọn ít nhất một khách mời để thêm.");
        }
    };

    
    if (loading) return <p>Đang tải danh bạ...</p>;

    return (
        <div style={{ backgroundColor: "rgba(255,255,255,1)", display: "flex", flexDirection: "column", width: "100%" }}>
            {/* Header của Popup */}
            <div style={{ backgroundColor: "rgba(39,84,138,1)", height: "53.4px", width: "100%", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", boxSizing: 'border-box' }}>
                <div style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "20px", color: "rgba(255,255,255,1)", fontWeight: "700" }}>Danh bạ khách mời</div>
                <div onClick={onClose} style={{ cursor: 'pointer', backgroundColor: "rgba(255,255,255,1)", borderRadius: "59px", width: "29.4px", height: "29.4px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <CloseIcon />
                </div>
            </div>

            {/* Phần Content bên trong */}
            <div style={{ padding: '20px' }}>
                 <p style={{ marginTop: 0 }}>Chọn khách mời từ danh bạ để thêm vào sự kiện hiện tại.</p>
                 <div style={{display: 'flex', gap: '20px', margin: '20px 0', alignItems: 'center'}}>
                    <input 
                        className="filter-input"
                        placeholder="Tìm kiếm trong danh bạ..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <button 
                        className="guest-action-btn"
                        onClick={handleAddSelectedToInvitation} 
                        disabled={selectedGuests.size === 0}
                    >
                        Thêm {selectedGuests.size} khách đã chọn
                    </button>
                    {/* Checkbox "Chọn tất cả" */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="checkbox"
                            ref={selectAllCheckboxRef}
                            onChange={handleSelectAllGuests}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <label>Chọn tất cả</label>
                    </div>
                 </div>
                
                <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    {/* ... (giữ nguyên phần render danh sách filteredGuests) ... */}
                    {filteredGuests.length > 0 ? filteredGuests.map(guest => (
                        <div key={guest._id} style={{ display: 'flex', alignItems: 'center', padding: '10px', borderBottom: '1px solid #eee', cursor: 'pointer' }} onClick={() => handleSelectGuest(guest._id)}>
                            <input
                                type="checkbox"
                                checked={selectedGuests.has(guest._id)}
                                onChange={() => handleSelectGuest(guest._id)}
                                style={{ marginRight: '15px' }}
                                onClick={(e) => e.stopPropagation()}
                            />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold' }}>{guest.name}</div>
                                <div style={{ color: '#666', fontSize: '14px' }}>{guest.email}</div>
                            </div>
                        </div>
                    )) : <p style={{textAlign: 'center', color: '#666', marginTop: '20px'}}>Không tìm thấy khách mời nào.</p>}
                </div>
            </div>
        </div>
    );
};

const GuestActionDropdown = ({ guest, invitationId, onSendEmail, onClose }) => {
    const dropdownRef = useRef(null);
    const invitationBaseUrl = `${window.location.origin}/events/${invitationId}`;
    const guestUrl = `${invitationBaseUrl}?guestId=${guest._id}`;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(guestUrl).then(() => {
            showSuccessToast('Đã sao chép liên kết thành công!');
        }).catch(err => {
            showErrorToast('Không thể sao chép liên kết.');
        });
        onClose();
    };

    const handleOpenLink = () => {
        window.open(guestUrl, '_blank');
        onClose();
    };

    const handleSendEmail = () => {
        onSendEmail(guest);
        onClose();
    };

    return (
        <div className="guest-action-dropdown" ref={dropdownRef}>
            <ul>
                <li onClick={handleCopyLink}>Copy link thiệp online</li>
                <li onClick={handleSendEmail}>Gửi email cho khách mời</li>
                <li onClick={handleOpenLink}>Xem trước thiệp online</li>
            </ul>
        </div>
    );
};

const BulkActionsBar = ({ count, onDelete, onSendEmail, onAddToGroup, onRemoveFromGroup, onDeselectAll }) => {
    return (
        <div className="bulk-action-bar">
            <div className="bulk-action-info">
                <strong>Đã chọn: {count}</strong>
            </div>
            <div className="bulk-action-buttons">
                <button onClick={onSendEmail}>Gửi Email</button>
                <button onClick={onAddToGroup}>Thêm vào nhóm</button>
                <button onClick={onRemoveFromGroup}>Loại khỏi nhóm</button>
                <button onClick={onDelete} className="danger">Xóa</button>
            </div>
            <button onClick={onDeselectAll} className="deselect-btn">Bỏ chọn</button>
        </div>
    );
};
const SelectGroupModal = ({ groups, onClose, onConfirm, count }) => {
    const [selectedGroupId, setSelectedGroupId] = useState('');

    const handleConfirm = () => {
        if (!selectedGroupId) {
            showErrorToast("Vui lòng chọn một nhóm.");
            return;
        }
        onConfirm(selectedGroupId);
    };

    return (
        <Modal onClose={onClose} size="normal">
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{fontFamily: "'SVN-Gilroy', sans-serif", color: "#27548a"}}>Thêm vào nhóm</h3>
                <p>Thêm <strong>{count}</strong> khách mời đã chọn vào nhóm:</p>
                <select value={selectedGroupId} onChange={(e) => setSelectedGroupId(e.target.value)} className="settings-select">
                    <option value="">-- Vui lòng chọn nhóm --</option>
                    {groups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                </select>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                     <button type="button" onClick={onClose} className="guest-action-btn" style={{background: 'white', borderColor: '#ccc'}}>Hủy</button>
                     <button type="button" onClick={handleConfirm} className="guest-action-btn" style={{background: '#27548a', color: 'white', borderColor: '#27548a'}}>Xác nhận</button>
                </div>
            </div>
        </Modal>
    );
};

const wrapText = (context, text, maxWidth) => {
    if (!text) return [];
    const paragraphs = text.split('\n');
    const allLines = [];
    paragraphs.forEach(paragraph => {
        if (paragraph === '') { allLines.push(''); return; }
        let words = paragraph.split(' ');
        let currentLine = words[0] || '';
        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = context.measureText(currentLine + " " + word).width;
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                allLines.push(currentLine);
                currentLine = word;
            }
        }
        allLines.push(currentLine);
    });
    return allLines;
};

const useResponsive = (width) => {
    const [targetReached, setTargetReached] = useState(false);
    const updateTarget = useCallback((e) => {
        setTargetReached(e.matches);
    }, []);
    useEffect(() => {
        const media = window.matchMedia(`(max-width: ${width}px)`);
        media.addEventListener('change', updateTarget);
        setTargetReached(media.matches);
        return () => media.removeEventListener('change', updateTarget);
    }, [updateTarget, width]);
    return targetReached;
};
const DragHandleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line>
        <line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
);
const AddIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);
const GroupIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>);
const ExportIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>);
const ImportIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 12 12 7 7 12"></polyline><line x1="12" y1="7" x2="12" y2="21"></line></svg>);
// const InfoIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>);
const EditIcon = ({width="20", height="20"}) => (<svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>);
const DeleteIcon = ({width="20", height="20"}) => (<svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>);
const BackArrowIcon = () => (<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>);
const CloseIcon = () => (<svg width="13.4px" height="13.4px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const RequiredIcon = () => (<svg width="12px" height="12px" viewBox="0 0 24 24" fill="red"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>);
const SaveIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>);
const CancelIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const SendEmailIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0 1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>);
const CheckIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>);
const StatItem = ({ label, value }) => (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "12px", flex: 1, height: "96px", backgroundColor: '#fff', width: '100%' }}>
        <div style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "16px", textAlign: "center", color: "rgba(102,102,102,1)", fontWeight: "500" }}>{label}</div>
        <div style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "20px", textAlign: "center", color: "rgba(39,84,138,1)", textTransform: "uppercase", fontWeight: "700" }}>{value}</div>
    </div>
);

const VerticalSeparator = () => <div style={{width: '1px', height: '52px', backgroundColor: '#E0E0E0'}} />;

const SettingsField = ({ label, required, description, children }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "16px", color: "rgba(0,0,0,1)", fontWeight: "600" }}>{label}</div>
            {required && <RequiredIcon />}
        </div>
        {description && (
            <div style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "16px", color: "rgba(102,102,102,1)" }}
                 dangerouslySetInnerHTML={{ __html: description }}></div>
        )}
        {children}
    </div>
);

const Modal = ({ children, onClose, size = 'normal' }) => (
    <div className="modal-overlay" onClick={onClose}>
        <div className={`modal-container ${size === 'large' ? 'modal-large' : ''}`} onClick={e => e.stopPropagation()}>
            <div className="modal-body">{children}</div>
        </div>
    </div>
);

const DeleteConfirmationModal = ({ onConfirm, onClose, message = 'Bạn thực sự muốn xóa mục này?', description = 'Hành động này không thể hoàn tác. Vui lòng xác nhận.' }) => (
    <div className="modal-overlay" onClick={onClose}>
        <div style={{ backgroundColor: "rgba(255,255,255,1)", width: '702px', display: "flex", flexDirection: "column", justifyContent: "start", alignItems: "center", gap: "20px", paddingTop: "20px", borderRadius: "8px", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "20px", textAlign: "center", color: "rgba(39,84,138,1)", fontWeight: "700" }}>
                {message}
            </div>
            <div style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "16px", textAlign: "center", maxWidth: "650px", color: "rgba(0,0,0,1)", lineHeight: "21px", fontWeight: "500", padding: '0 20px' }}>
                {description}
            </div>
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "start", alignItems: "center", borderTop: '1px solid #ccc', width: '100%', marginTop: '10px' }}>
                <div onClick={onClose} style={{ backgroundColor: "rgba(255,255,255,1)", borderRight: '0.5px solid #ccc', width: "50%", height: "60px", display: "flex", justifyContent: "center", alignItems: "center", cursor: 'pointer', fontWeight: 600, color: 'rgba(39,84,138,1)', fontSize: '16px' }}>
                    Hủy
                </div>
                <div onClick={onConfirm} style={{ backgroundColor: "rgba(255,255,255,1)", borderLeft: '0.5px solid #ccc', width: "50%", height: "60px", display: "flex", justifyContent: "center", alignItems: "center", cursor: 'pointer', fontWeight: 600, color: 'rgba(39,84,138,1)', fontSize: '16px' }}>
                    Xác nhận
                </div>
            </div>
        </div>
    </div>
);

const AddGuestForm = ({ onSave, onClose, onManageGroups, invitationId }) => {
    // ... (this component looks fine, no changes needed)
    const [formData, setFormData] = useState({ name: '', email: '', group: '' });
    const [availableGroups, setAvailableGroups] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchGroups = async () => {
            if (!invitationId) return;
            try {
                const response = await api.get(`/invitations/${invitationId}/guest-groups`);
                setAvailableGroups(Array.isArray(response.data.data) ? response.data.data : []);
            } catch (error) {
                console.error("Lỗi khi tải danh sách nhóm:", error);
                setAvailableGroups([]);
            }
        };
        fetchGroups();
    }, [invitationId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!invitationId || !formData.name) {
            showErrorToast("Vui lòng nhập tên khách mời.");
            return;
        }
        setIsSubmitting(true);
        
        const promise = api.post(`/invitations/${invitationId}/guests`, { ...formData, group: formData.group || null });

        handlePromiseToast(promise, {
            pending: 'Đang thêm khách mời...',
            success: 'Đã thêm khách mời thành công!',
            error: 'Thêm khách mời thất bại!'
        }).then((response) => {
            onSave(response.data.data, 'add-guest'); 
            onClose();
        }).catch(err => console.error(err))
        .finally(() => setIsSubmitting(false));
    };

    return (
        <div style={{ backgroundColor: "rgba(255,255,255,1)", display: "flex", flexDirection: "column", justifyContent: "start", alignItems: "center", gap: "20px" }}>
            <div style={{ backgroundColor: "rgba(39,84,138,1)", height: "53.4px", width: "100%", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", boxSizing: 'border-box' }}>
                <div style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "20px", color: "rgba(255,255,255,1)", fontWeight: "700" }}>Thêm mới một khách mời</div>
                <div onClick={onClose} style={{ cursor: 'pointer', backgroundColor: "rgba(255,255,255,1)", borderRadius: "59px", width: "29.4px", height: "29.4px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <CloseIcon />
                </div>
            </div>
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "start", alignItems: "center", gap: "20px", padding: "0 20px", width: "100%", boxSizing: 'border-box' }}>
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "start", alignItems: "start", gap: "8px", width: '100%' }}>
                        <label style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "16px", color: "rgba(0,0,0,1)", fontWeight: "500" }}>Tên khách mời</label>
                        <input name="name" value={formData.name} onChange={handleChange} placeholder="Nhập tên khách mời..." style={{ borderColor: "rgb(128,128,128)", borderWidth: "0.5px", borderStyle: "solid", width: "100%", height: "40.5px", padding: "0 20px", boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "start", alignItems: "start", gap: "8px", width: '100%' }}>
                        <label style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "16px", color: "rgba(0,0,0,1)", fontWeight: "500" }}>Email</label>
                        <input name="email" value={formData.email} onChange={handleChange} placeholder="Email khách mời..." style={{ borderColor: "rgb(128,128,128)", borderWidth: "0.5px", borderStyle: "solid", width: "100%", height: "40.5px", padding: "0 20px", boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "start", alignItems: "start", gap: "8px", width: '100%' }}>
                        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "start", width: "100%" }}>
                            <label style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "16px", color: "rgba(0,0,0,1)", fontWeight: "500" }}>Nhóm khách mời</label>
                            <div onClick={onManageGroups} style={{ cursor: 'pointer', fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "16px", color: "rgba(39,84,138,1)", fontWeight: "500" }}>[Quản lý nhóm]</div>
                        </div>
                        <select name="group" value={formData.group} onChange={handleChange} style={{ borderColor: "rgb(128,128,128)", borderWidth: "0.5px", borderStyle: "solid", width: "100%", height: "40px", padding: "0 20px", boxSizing: 'border-box' }}>
                             <option value="">Chọn nhóm khách mời (không bắt buộc)</option>
                             {availableGroups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                        </select>
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", gap: "20px", padding: "20px", width: "100%", boxSizing: 'border-box' }}>
                    <button type="submit" disabled={isSubmitting} style={{ backgroundColor: "rgba(39,84,138,1)", flex: 1, height: "40px", border: 'none', color: 'white', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer' }}>{isSubmitting ? 'Đang lưu...' : 'Lưu thông tin'}</button>
                    <button type="button" onClick={onClose} style={{ borderColor: "rgb(128,128,128)", borderWidth: "0.5px", borderStyle: "solid", flex: 1, height: "40px", background: 'white', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer' }}>Hủy</button>
                </div>
            </form>
        </div>
    );
};

const UpdateGuestForm = ({ guestToEdit, onSave, onClose, onManageGroups, invitationId }) => {
    const [formData, setFormData] = useState({
        name: '', phone: '', email: '', group: '', status: 'pending',
        attendingCount: 1, giftAmount: '', giftUnit: 'VND', salutation: ''
    });
    const [availableGroups, setAvailableGroups] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchGroups = async () => {
            if (!invitationId) return;
            try {
                const response = await api.get(`/invitations/${invitationId}/guest-groups`);
                setAvailableGroups(Array.isArray(response.data.data) ? response.data.data : []);
            } catch (error) {
                console.error("Lỗi khi tải danh sách nhóm:", error);
                setAvailableGroups([]);
            }
        };
        fetchGroups();
    }, [invitationId]);
    
    useEffect(() => {
        if (guestToEdit) {
            setFormData({
                name: guestToEdit.name || '',
                phone: guestToEdit.phone || '',
                email: guestToEdit.email || '',
                group: guestToEdit.group || '',
                status: guestToEdit.status || 'pending',
                attendingCount: guestToEdit.attendingCount || 1,
                giftAmount: guestToEdit.giftAmount || '',
                giftUnit: guestToEdit.giftUnit || 'VND',
                salutation: guestToEdit.salutation || 'Lời xưng hô mặc định',
            });
        }
    }, [guestToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!invitationId) {
            showErrorToast("Không tìm thấy ID của thiệp mời.");
            return;
        }
        setIsSubmitting(true);
        
        const promise = api.put(`/invitations/${invitationId}/guests/${guestToEdit._id}`, { ...formData, group: formData.group || null });

        handlePromiseToast(promise, {
            pending: 'Đang cập nhật khách mời...',
            success: 'Đã cập nhật khách mời thành công!',
            error: 'Cập nhật thất bại!'
        }).then((response) => {
            onSave(response.data.data, 'update-guest'); 
            onClose();
        }).catch(err => console.error(err))
        .finally(() => setIsSubmitting(false));
    };

    return (
        <form onSubmit={handleSubmit} style={{ backgroundColor: "rgba(255,255,255,1)", display: "flex", flexDirection: "column", justifyContent: "start", alignItems: "center", gap: "20px" }}>
            <div style={{ backgroundColor: "rgba(39,84,138,1)", height: "53.1px", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", boxSizing: 'border-box' }}>
                <div style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "20px", color: "rgba(255,255,255,1)", fontWeight: "700" }}>Cập nhật khách mời</div>
                <div onClick={onClose} style={{ cursor: 'pointer', backgroundColor: "rgba(255,255,255,1)", borderRadius: "59px", width: "29.1px", height: "29.1px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <CloseIcon />
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "start", gap: "20px", padding: "0 20px", width: "100%", boxSizing: 'border-box' }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <label style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "16px", fontWeight: "500" }}>Nhóm khách mời</label>
                            <div onClick={onManageGroups} style={{ cursor: 'pointer', fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "16px", color: "rgba(39,84,138,1)", fontWeight: "500" }}>[Quản lý nhóm]</div>
                        </div>
                        <select name="group" value={formData.group} onChange={handleChange} style={{ borderColor: "rgb(128,128,128)", borderWidth: "0.5px", borderStyle: "solid", width: "100%", height: "40px", padding: "0 20px" }}>
                            <option value="">Không có nhóm</option>
                            {availableGroups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                        </select>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "16px", fontWeight: "500" }}>Địa chỉ Email</label>
                        <input name="email" value={formData.email} onChange={handleChange} style={{ borderColor: "rgb(128,128,128)", borderWidth: "0.5px", borderStyle: "solid", width: "100%", height: "40px", padding: "0 20px" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "16px", fontWeight: "500" }}>Đi cùng</label>
                        <select name="attendingCount" value={formData.attendingCount} onChange={handleChange} style={{ borderColor: "rgb(128,128,128)", borderWidth: "0.5px", borderStyle: "solid", width: "100%", height: "40px", padding: "0 20px" }}>
                            {[...Array(10).keys()].map(i => <option key={i + 1} value={i + 1}>{i + 1} người</option>)}
                        </select>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                         <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <label style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "16px", fontWeight: "500" }}>Tiền mừng</label>
                            <div style={{display: 'flex', gap: '10px'}}>
                                <input name="giftAmount" type="number" value={formData.giftAmount} onChange={handleChange} placeholder="Số tiền mừng" style={{ borderColor: "rgb(128,128,128)", borderWidth: "0.5px", borderStyle: "solid", height: "40px", padding: "0 20px", flex: 3 }} />
                                <select name="giftUnit" value={formData.giftUnit} onChange={handleChange} style={{ borderColor: "rgb(128,128,128)", borderWidth: "0.5px", borderStyle: "solid", height: "40px", padding: "0 10px", flex: 2 }}>
                                    <option value="VND">VND</option>
                                    <option value="Phân vàng">Phân vàng</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "16px", color: "rgba(102,102,102,1)", lineHeight: "21px", fontWeight: "500" }}>
                            Bạn có thể sử dụng đơn vị "VNĐ" hoặc "Phân vàng" cho tiền mừng. Chú ý luôn quy đổi số vàng thành đơn vị Phân vàng ( 1 cây = 10 chỉ, 1 chỉ = 10 phân ).
                        </div>
                    </div>
                </div>
                {/* Right Column */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "16px", fontWeight: "500" }}>Tên khách mời</label>
                        <input name="name" value={formData.name} onChange={handleChange} style={{ borderColor: "rgb(128,128,128)", borderWidth: "0.5px", borderStyle: "solid", width: "100%", height: "40px", padding: "0 20px" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "16px", fontWeight: "500" }}>Số điện thoại</label>
                        <input name="phone" value={formData.phone} onChange={handleChange} style={{ borderColor: "rgb(128,128,128)", borderWidth: "0.5px", borderStyle: "solid", width: "100%", height: "40px", padding: "0 20px" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "16px", fontWeight: "500" }}>Trạng thái tham gia</label>
                        <select name="status" value={formData.status} onChange={handleChange} style={{ borderColor: "rgb(128,128,128)", borderWidth: "0.5px", borderStyle: "solid", width: "100%", height: "40px", padding: "0 20px" }}>
                            <option value="attending">Tham gia</option>
                            <option value="declined">Không tham gia</option>
                            <option value="pending">Chưa xác nhận</option>
                        </select>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <label style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "16px", fontWeight: "500" }}>Kiểu hiển thị lời xưng hô</label>
                            <select name="salutation" value={formData.salutation} onChange={handleChange} style={{ borderColor: "rgb(128,128,128)", borderWidth: "0.5px", borderStyle: "solid", width: "100%", height: "40px", padding: "0 20px" }}>
                                <option>Lời xưng hô mặc định</option>
                                <option>Thân gửi</option>
                                <option>Trân trọng kính mời</option>
                            </select>
                        </div>
                        <div style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "16px", color: "rgba(102,102,102,1)", lineHeight: "21px", fontWeight: "500" }}>
                            Bạn có thể sử mặc định của thiệp mời đã chọn thì không cần cập nhập lại vd : kính gửi
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", gap: "20px", padding: "0 20px 20px", width: "100%", boxSizing: 'border-box' }}>
                <button type="submit" disabled={isSubmitting} style={{ backgroundColor: "rgba(39,84,138,1)", flex: 1, height: "40px", border: 'none', color: "white", textTransform: "uppercase", fontWeight: "600", cursor: 'pointer' }}>{isSubmitting ? 'Đang lưu...' : 'Lưu thông tin'}</button>
                <button type="button" onClick={onClose} style={{ borderColor: "rgb(128,128,128)", borderWidth: "0.5px", borderStyle: "solid", flex: 1, height: "40px", background: 'white', textTransform: "uppercase", fontWeight: "600", cursor: 'pointer' }}>Hủy</button>
            </div>
        </form>
    );
};

const ManageGroupsModalContent = ({ invitationId, onClose, onDataChange }) => {
    const [groups, setGroups] = useState([]);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupSalutation, setNewGroupSalutation] = useState('Lời xưng hô mặc định');
    const [editingGroupId, setEditingGroupId] = useState(null);
    const [editedName, setEditedName] = useState('');
    const [editedSalutation, setEditedSalutation] = useState('');
    const [groupToDelete, setGroupToDelete] = useState(null);
    const availableSalutations = ['Lời xưng hô mặc định', 'Thân gửi', 'Kính mời', 'Trân trọng kính mời'];

    const fetchGroups = useCallback(async () => {
        if (!invitationId) return;
        try {
            const response = await api.get(`/invitations/${invitationId}/guest-groups`);
            setGroups(Array.isArray(response.data.data) ? response.data.data : []);
        } catch (error) {
            showErrorToast("Tải danh sách nhóm thất bại.");
        }
    }, [invitationId]);

    useEffect(() => { 
        fetchGroups(); 
    }, [fetchGroups]);

    const handleAddGroup = async () => {
        if (!newGroupName.trim()) {
            showErrorToast('Tên nhóm không được để trống.');
            return;
        }
        const promise = api.post(`/invitations/${invitationId}/guest-groups`, { name: newGroupName, salutation: newGroupSalutation });
        handlePromiseToast(promise, {
            pending: 'Đang thêm nhóm...', success: 'Thêm nhóm thành công!', error: 'Thêm nhóm thất bại!'
        }).then((response) => {
            const newGroup = response.data.data;
            setGroups(prev => [...prev, newGroup]);
            onDataChange(newGroup, 'add-group');
            setNewGroupName(''); 
            setNewGroupSalutation('Lời xưng hô mặc định');
        });
    };
    
    const handleSaveEdit = async (groupId) => {
        if (!editedName.trim()) {
            showErrorToast('Tên nhóm không được để trống.');
            return;
        }
        const promise = api.put(`/invitations/${invitationId}/guest-groups/${groupId}`, { name: editedName, salutation: editedSalutation });
        handlePromiseToast(promise, {
            pending: 'Đang cập nhật...', success: 'Cập nhật thành công!', error: 'Cập nhật thất bại!'
        }).then((response) => {
            const updatedGroup = response.data.data;
            setGroups(prev => prev.map(g => g._id === groupId ? updatedGroup : g));
            onDataChange(updatedGroup, 'update-group');
            setEditingGroupId(null);
        });
    };
    const confirmDeleteGroup = async () => {
        if (!groupToDelete) return;
        const promise = api.delete(`/invitations/${invitationId}/guest-groups/${groupToDelete}`);
        handlePromiseToast(promise, {
            pending: 'Đang xóa nhóm...', success: 'Xóa nhóm thành công!', error: 'Xóa nhóm thất bại!'
        }).then(() => {
            setGroups(prev => prev.filter(g => g._id !== groupToDelete));
            onDataChange(groupToDelete, 'delete-group');
        }).finally(() => setGroupToDelete(null));
    };
    return (
        <div style={{ backgroundColor: "rgba(255,255,255,1)", border: "0.5px solid rgb(128,128,128)", boxShadow: "0px 0px 8px 0px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", justifyContent: "start", alignItems: "start", gap: "20px" }}>
            <div style={{ backgroundColor: "rgba(39,84,138,1)", height: "53.4px", width: '100%', display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", boxSizing: 'border-box' }}>
                <div style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "20px", color: "rgba(255,255,255,1)", fontWeight: "700" }}>Quản lí nhóm</div>
                <div onClick={onClose} style={{ cursor: 'pointer', backgroundColor: "rgba(255,255,255,1)", borderRadius: "59px", width: "29.4px", height: "29.4px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <CloseIcon />
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "start", alignItems: "center", gap: "20px", padding: "0 20px", width: "100%", boxSizing: 'border-box' }}>
                    <input 
                            placeholder="Nhập tên nhóm mới..." 
                            value={newGroupName}
                            onChange={e => setNewGroupName(e.target.value)}
                            style={{ borderColor: "rgb(128,128,128)", borderWidth: "0.5px", borderStyle: "solid", flex: 1, height: "40px", padding: '0 20px' }} 
                        />             
                <select value={newGroupSalutation} onChange={e => setNewGroupSalutation(e.target.value)} style={{ borderColor: "rgb(128,128,128)", borderWidth: "0.5px", borderStyle: "solid", flex: 1, height: "40px", padding: '0 20px' }}>
                {availableSalutations.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
                <button onClick={handleAddGroup} style={{ backgroundColor: "rgba(39,84,138,1)", width: "180px", height: "40px", display: "flex", justifyContent: "center", alignItems: "center", color: 'white', border: 'none', cursor: 'pointer', textTransform: 'uppercase', fontWeight: 600 }}>Thêm mới</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "0 20px 20px", width: "100%", boxSizing: 'border-box' }}>
                <div style={{ display: "flex", flexDirection: "row", width: '100%' }}>
                    <div style={{ border: "0.5px solid rgb(128,128,128)", width: "60px", height: "60px", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "600", textTransform: 'uppercase' }}>#</div>
                    <div style={{ border: "0.5px solid rgb(128,128,128)", flex: 1.5, height: "60px", display: "flex", alignItems: "center", paddingLeft: "20px", fontWeight: "600", textTransform: 'uppercase' }}>Tên nhóm</div>
                    <div style={{ border: "0.5px solid rgb(128,128,128)", flex: 3, height: "60px", display: "flex", alignItems: "center", paddingLeft: "20px", fontWeight: "600", textTransform: 'uppercase' }}>Kiểu hiển thị lời xưng hô</div>
                    <div style={{ border: "0.5px solid rgb(128,128,128)", flex: 1, height: "60px" }}></div>
                </div>
                {groups.map((group, index) => (
                    <div key={group._id} style={{ display: "flex", flexDirection: "row", width: '100%', borderBottom: '0.5px solid #ccc', borderLeft: '0.5px solid #ccc', borderRight: '0.5px solid #ccc' }}>
                        {editingGroupId === group._id ? (
                            <>
                                <div style={{ borderRight: "0.5px solid rgb(128,128,128)", width: "60px", minHeight: "60px", display: "flex", justifyContent: "center", alignItems: "center" }}>{index + 1}</div>
                                <div style={{ borderRight: "0.5px solid rgb(128,128,128)", flex: 1.5, minHeight: "60px", display: "flex", alignItems: "center", padding: "5px 10px" }}>
                                    <input value={editedName} onChange={e => setEditedName(e.target.value)} style={{width: '100%', padding: '8px'}}/>
                                </div>
                                <div style={{ borderRight: "0.5px solid rgb(128,128,128)", flex: 3, minHeight: "60px", display: "flex", alignItems: "center", padding: "5px 10px" }}>
                                     <select value={editedSalutation} onChange={e => setEditedSalutation(e.target.value)} style={{width: '100%', padding: '8px'}}>
                                         {availableSalutations.map(s => <option key={s} value={s}>{s}</option>)}
                                     </select>
                                </div>
                                <div style={{ flex: 1, minHeight: "60px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
                                    <button onClick={() => handleSaveEdit(group._id)} className="table-action-btn"><SaveIcon /></button>
                                    <button onClick={() => setEditingGroupId(null)} className="table-action-btn"><CancelIcon /></button>
                                </div>
                            </>
                        ) : (
                             <>
                                <div style={{ borderRight: "0.5px solid rgb(128,128,128)", width: "60px", minHeight: "60px", display: "flex", justifyContent: "center", alignItems: "center" }}>{index + 1}</div>
                                <div style={{ borderRight: "0.5px solid rgb(128,128,128)", flex: 1.5, minHeight: "60px", display: "flex", alignItems: "center", paddingLeft: "20px" }}>{group.name}</div>
                                <div style={{ borderRight: "0.5px solid rgb(128,128,128)", flex: 3, minHeight: "60px", display: "flex", alignItems: "center", paddingLeft: "20px" }}>{group.salutation}</div>
                                <div style={{ flex: 1, minHeight: "60px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
                                    <button onClick={() => { setEditingGroupId(group._id); setEditedName(group.name); setEditedSalutation(group.salutation);}} className="table-action-btn"><EditIcon width="20" height="20"/></button>
                                    <button onClick={() => setGroupToDelete(group._id)} className="table-action-btn"><DeleteIcon width="20" height="20"/></button>
                                    <input type="checkbox" style={{ width: '16px', height: '16px' }} />
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
            {groupToDelete && (
                <DeleteConfirmationModal
                    onClose={() => setGroupToDelete(null)}
                    onConfirm={confirmDeleteGroup}
                    message="Bạn thực sự muốn xóa nhóm khách mời này?"
                    description="Việc xóa nhóm sẽ không xóa khách mời thuộc nhóm đó, nhưng khách mời sẽ không còn thuộc nhóm nào. Bạn có chắc chắn muốn tiếp tục?"
                />
            )}
        </div>
    );
};

const GuestCard = ({ guest, onEdit, onDelete, onSendEmail, index, groupName, isSelected, onSelect }) => {
    const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

    const getEmailStatusText = (status) => {
        switch (status) {
            case 'Đang gửi...': return 'Đang gửi...';
            case 'Đã gửi': return 'Đã gửi Email';
            case 'Thất bại': return 'Gửi thất bại';
            default: return 'Chưa gửi Email';
        }
    };

    return (
        <div className="guest-card">
            <div className="guest-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={onSelect}
                        style={{width: '18px', height: '18px', cursor: 'pointer'}}
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div className="guest-card-number">#{index + 1}</div>
                </div>
                <div className="guest-card-actions">
                    {guest.email && (
                        <button className="guest-card-action-btn" onClick={() => onSendEmail(guest)}>
                            <SendEmailIcon /> Gửi Email
                        </button>
                    )}
                    <button className="guest-card-action-btn" onClick={() => onEdit(guest)}>
                        <EditIcon /> Sửa
                    </button>
                    <button className="guest-card-action-btn" onClick={() => onDelete(guest._id)}>
                        <DeleteIcon /> Xóa
                    </button>
                </div>
            </div>
            <div className="guest-card-body">
                <div className="guest-info-item">
                    <span className="guest-info-label">Tên khách mời:</span>
                    <span className="guest-info-value guest-name">{guest.name}</span>
                </div>
                {guest.email && (
                    <div className="guest-info-item">
                        <span className="guest-info-label">Email:</span>
                        <span className="guest-info-value">{guest.email}</span>
                    </div>
                )}
                 {guest.phone && (
                    <div className="guest-info-item">
                        <span className="guest-info-label">Điện thoại:</span>
                        <span className="guest-info-value">{guest.phone}</span>
                    </div>
                )}
                <div className="guest-info-item">
                    <span className="guest-info-label">Nhóm:</span>
                    <div className="group-tag-mobile">{groupName}</div>
                </div>
                <div className="guest-info-item">
                    <span className="guest-info-label">Trạng thái:</span>
                    <span className="guest-info-value">
                        {guest.status === 'attending' ? 'Có' : (guest.status === 'declined' ? 'Không' : 'Chờ')}
                    </span>
                </div>
                <div className="guest-info-item">
                    <span className="guest-info-label">Đi cùng:</span>
                    <span className="guest-info-value">{guest.attendingCount || 0}</span>
                </div>
                <div className="guest-info-item">
                    <span className="guest-info-label">Mừng cưới:</span>
                    <span className="guest-info-value">{formatCurrency(guest.giftAmount)}</span>
                </div>
                <div className="guest-info-item">
                    <span className="guest-info-label">Trạng thái Email:</span>
                    <span className="guest-info-value">{getEmailStatusText(guest.emailStatus)}</span>
                </div>
            </div>
        </div>
    );
};

const ImportHelpModal = ({ onClose }) => {
    const handleDownloadSample = () => {
        const sampleData = [
            {
                "Tên Khách Mời": "Nguyễn Văn A",
                "Email": "nguyenvana@example.com",
                "Số Điện Thoại": "0987654321",
                "Nhóm Khách Mời": "Bạn Chú Rể"
            },
            {
                "Tên Khách Mời": "Trần Thị B",
                "Email": "tranthib@example.com",
                "Số Điện Thoại": "0123456789",
                "Nhóm Khách Mời": "Đồng Nghiệp Cô Dâu"
            }
        ];
        const worksheet = XLSX.utils.json_to_sheet(sampleData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Danh Sách Mẫu");
        worksheet['!cols'] = [ { wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 25 }];
        XLSX.writeFile(workbook, "file-mau-nhap-khach-moi.xlsx");
    };

    return (
        <Modal onClose={onClose} size="normal">
             <div style={{ backgroundColor: "rgba(255,255,255,1)", display: "flex", flexDirection: "column", justifyContent: "start", alignItems: "center", gap: "20px" }}>
                <div style={{ backgroundColor: "rgba(39,84,138,1)", height: "53.4px", width: "100%", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", boxSizing: 'border-box' }}>
                    <div style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "20px", color: "rgba(255,255,255,1)", fontWeight: "700" }}>Hướng dẫn nhập khách từ Excel</div>
                    <div onClick={onClose} style={{ cursor: 'pointer', backgroundColor: "rgba(255,255,255,1)", borderRadius: "59px", width: "29.4px", height: "29.4px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <CloseIcon />
                    </div>
                </div>
                <div style={{ padding: "0 30px 20px", display: 'flex', flexDirection: 'column', gap: '15px', fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "16px", color: "#333", lineHeight: '1.6' }}>
                    <p>Để nhập danh sách khách mời từ file Excel, file của bạn cần tuân thủ đúng định dạng sau:</p>
                    <ul>
                        <li>File phải là định dạng <strong>.xlsx</strong> hoặc <strong>.xls</strong>.</li>
                        <li>Dòng đầu tiên của trang tính phải là <strong>dòng tiêu đề</strong>.</li>
                        <li>Cột <strong>"Tên Khách Mời"</strong> là bắt buộc. Các khách mời không có tên sẽ bị bỏ qua.</li>
                        <li>Các cột được hệ thống hỗ trợ bao gồm:
                            <ul style={{marginTop: '10px', listStyleType: 'disc', marginLeft: '20px'}}>
                                <li><code>Tên Khách Mời</code> (Bắt buộc)</li>
                                <li><code>Email</code> (Không bắt buộc)</li>
                                <li><code>Số Điện Thoại</code> (Không bắt buộc)</li>
                                <li><code>Nhóm Khách Mời</code> (Không bắt buộc, tên nhóm phải khớp với tên nhóm bạn đã tạo).</li>
                            </ul>
                        </li>
                    </ul>
                     <p>Các cột khác không có trong danh sách trên sẽ được bỏ qua khi nhập.</p>

                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                         <button onClick={handleDownloadSample} className="guest-action-btn" style={{width: 'auto', padding: '0 25px', backgroundColor: '#e8f0fe', borderColor: '#27548a'}}>
                            Tải file mẫu
                        </button>
                    </div>
                </div>
                <div style={{ display: "flex", width: '100%', borderTop: '1px solid #ccc' }}>
                    <button onClick={onClose} style={{ flex: 1, height: "50px", border: 'none', background: 'white', textTransform: "uppercase", fontWeight: "600", cursor: 'pointer', color: 'rgba(39,84,138,1)', fontSize: '16px' }}>
                        Đã hiểu
                    </button>
                </div>
            </div>
        </Modal>
    );
};

const GuestManagementPanel = ({ invitationId, guests = [], onDataChange, invitation, onTabChange }) => {
    const [editingGuest, setEditingGuest] = useState(null);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
    const [isManageGroupsModalOpen, setManageGroupsModalOpen] = useState(false);
    const [isImportHelpModalOpen, setImportHelpModalOpen] = useState(false);
    const [guestToDelete, setGuestToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGroup, setFilterGroup] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterEmailStatus, setFilterEmailStatus] = useState('all');
    const [openGuestMenu, setOpenGuestMenu] = useState(null);
    const isMobileOrTablet = useResponsive(768);
    const importFileInputRef = useRef(null);
    const [selectedGuestIds, setSelectedGuestIds] = useState(new Set());
    const [isBulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
    const [isAddToGroupModalOpen, setAddToGroupModalOpen] = useState(false);
    const [hasMasterGuests, setHasMasterGuests] = useState(false); // <-- THÊM STATE MỚI
    const [isMasterGuestModalOpen, setMasterGuestModalOpen] = useState(false);
    const selectAllCheckboxRef = useRef(null);

    useEffect(() => {
        const checkMasterGuests = async () => {
            try {
                // Chỉ cần lấy 1 khách để kiểm tra sự tồn tại, cho hiệu năng tốt hơn
                const response = await api.get('/master-guests?limit=1'); 
                if (response.data.data && response.data.data.length > 0) {
                    setHasMasterGuests(true);
                }
            } catch (error) {
                console.error("Không thể kiểm tra danh bạ khách mời.", error);
            }
        };

        checkMasterGuests();
    }, []);

    const filteredGuests = useMemo(() => {
        return guests.filter(guest => {
            const guestName = guest.name?.toLowerCase() || '';
            const guestEmail = guest.email?.toLowerCase() || '';
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            if (searchTerm && !guestName.includes(lowerCaseSearchTerm) && !guestEmail.includes(lowerCaseSearchTerm)) {
                return false;
            }
            if (filterGroup !== 'all' && guest.group !== filterGroup) {
                return false;
            }
            if (filterStatus !== 'all' && guest.status !== filterStatus) {
                return false;
            }
            if (filterEmailStatus !== 'all') {
                const currentStatus = guest.emailStatus || 'Chưa gửi';
                if (currentStatus !== filterEmailStatus) {
                    return false;
                }
            }
            return true;
        });
    }, [guests, searchTerm, filterGroup, filterStatus, filterEmailStatus]);
    
    useEffect(() => {
        if (selectAllCheckboxRef.current) {
            const numSelected = selectedGuestIds.size;
            const numVisible = filteredGuests.length;
            selectAllCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numVisible;
            selectAllCheckboxRef.current.checked = numVisible > 0 && numSelected === numVisible;
        }
    }, [selectedGuestIds, filteredGuests]);

    useEffect(() => {
        setSelectedGuestIds(new Set());
    }, [searchTerm, filterGroup, filterStatus, filterEmailStatus]);

    const handleToggleSelect = (guestId) => {
        setSelectedGuestIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(guestId)) newSet.delete(guestId);
            else newSet.add(guestId);
            return newSet;
        });
    };

    const handleToggleSelectAll = () => {
        if (selectedGuestIds.size === filteredGuests.length) {
            setSelectedGuestIds(new Set());
        } else {
            setSelectedGuestIds(new Set(filteredGuests.map(g => g._id)));
        }
    };
    
    const handleBulkDelete = () => {
        if (selectedGuestIds.size === 0) return;
        setBulkDeleteModalOpen(true);
    };

    const confirmBulkDelete = () => {
        const ids = Array.from(selectedGuestIds);
        const promise = api.post(`/invitations/${invitationId}/guests/bulk-delete`, { guestIds: ids });
        handlePromiseToast(promise, {
            pending: `Đang xóa ${ids.length} khách mời...`,
            success: 'Đã xóa các khách mời đã chọn!',
            error: 'Xóa hàng loạt thất bại!'
        }).then((response) => {
            onDataChange(response.data.data, 'update-settings'); 
            setSelectedGuestIds(new Set());
        }).finally(() => setBulkDeleteModalOpen(false));
    };

    const handleBulkSendEmail = () => {
        if (selectedGuestIds.size === 0) return;
        const ids = Array.from(selectedGuestIds);
        onDataChange(ids, 'bulk-email-sending');
        const promise = api.post(`/invitations/${invitationId}/guests/bulk-send-email`, { guestIds: ids });
        handlePromiseToast(promise, {
            pending: `Đang gửi email tới ${ids.length} khách mời...`,
            success: 'Đã gửi email hàng loạt thành công!',
            error: 'Gửi email hàng loạt thất bại!'
        }).then((response) => {
            onDataChange(response.data.data, 'update-settings');
            setSelectedGuestIds(new Set());
        }).catch(() => {
             onDataChange(invitation, 'update-settings');
        });
    };
    
    const handleBulkAddToGroup = () => {
        if (selectedGuestIds.size === 0) return;
        setAddToGroupModalOpen(true);
    };

    const confirmBulkUpdateGroup = (groupId) => {
        const ids = Array.from(selectedGuestIds);
        const promise = api.put(`/invitations/${invitationId}/guests/bulk-update`, {
            guestIds: ids,
            updateData: { group: groupId } 
        });
        const actionText = groupId ? 'thêm vào nhóm' : 'loại bỏ khỏi nhóm';
        
        handlePromiseToast(promise, {
            pending: `Đang ${actionText}...`,
            success: `Đã ${actionText} thành công!`,
            error: `Thao tác ${actionText} thất bại!`
        }).then((response) => {
            onDataChange(response.data.data, 'update-settings');
            setSelectedGuestIds(new Set());
        }).finally(() => setAddToGroupModalOpen(false));
    };

    const handleFileImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const bstr = event.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const jsonData = XLSX.utils.sheet_to_json(ws, { defval: "" });

                if (jsonData.length === 0) {
                    showErrorToast("File Excel trống hoặc không có dữ liệu.");
                    return;
                }
                
                const firstRow = jsonData[0];
                if (!('Tên Khách Mời' in firstRow)) {
                    showErrorToast('File Excel phải có cột "Tên Khách Mời". Vui lòng kiểm tra lại file mẫu.');
                    return;
                }

                const groupNameToIdMap = new Map();
                if (invitation?.guestGroups) {
                    invitation.guestGroups.forEach(group => {
                        groupNameToIdMap.set(group.name, group._id);
                    });
                }
                
                const processedGuests = jsonData.map(row => {
                    const groupName = row['Nhóm Khách Mời'] || "";
                    return {
                        name: row['Tên Khách Mời'],
                        email: row['Email'] || null,
                        phone: row['Số Điện Thoại'] || null,
                        group: groupNameToIdMap.get(groupName) || null
                    };
                }).filter(g => g.name && String(g.name).trim() !== "");

                if (processedGuests.length === 0) {
                    showErrorToast("Không tìm thấy khách mời hợp lệ trong file Excel.");
                    return;
                }

                const promise = api.post(`/invitations/${invitationId}/guests/bulk`, { guests: processedGuests });

                handlePromiseToast(promise, {
                    pending: `Đang nhập ${processedGuests.length} khách mời...`,
                    success: 'Nhập danh sách khách mời thành công!',
                    error: 'Nhập danh sách thất bại. Vui lòng kiểm tra lại file.'
                }).then((response) => {
                     onDataChange(response.data.data, 'update-settings');
                });

            } catch (error) {
                console.error("Lỗi khi đọc file Excel:", error);
                showErrorToast("Đã có lỗi xảy ra khi đọc file Excel. File có thể bị hỏng.");
            } finally {
                if(importFileInputRef.current) {
                    importFileInputRef.current.value = "";
                }
            }
        };
        reader.readAsBinaryString(file);
    };
    const handleExportExcel = () => {
        if (!filteredGuests || filteredGuests.length === 0) {
            showErrorToast("Không có dữ liệu khách mời để xuất.");
            return;
        }
        try {
            const dataForExport = filteredGuests.map((guest, index) => ({
                'STT': index + 1, 'Tên Khách Mời': guest.name, 'Số Điện Thoại': guest.phone || 'N/A',
                'Email': guest.email || 'N/A', 'Nhóm Khách Mời': groupMap.get(guest.group) || 'Chưa chọn nhóm khách mời',
                'Trạng Thái Tham Gia': guest.status === 'attending' ? 'Sẽ tham gia' : (guest.status === 'declined' ? 'Không tham gia' : 'Chưa xác nhận'),
                'Đi Cùng (người)': guest.attendingCount || 0, 'Tiền Mừng (VND)': guest.giftUnit === 'VND' ? (guest.giftAmount || 0) : 0,
                'Trạng Thái Email': guest.emailStatus || 'Chưa gửi'
            }));
            const worksheet = XLSX.utils.json_to_sheet(dataForExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Danh Sách Khách Mời");
            worksheet['!cols'] = [ { wch: 5 }, { wch: 25 }, { wch: 15 }, { wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 10 }, { wch: 15 }, { wch: 15 }];
            const fileName = `danh-sach-khach-moi-${invitation.slug || 'thiep-moi'}.xlsx`;
            XLSX.writeFile(workbook, fileName);
            showSuccessToast("Đã xuất file Excel thành công!");
        } catch (error) {
            showErrorToast("Có lỗi xảy ra khi tạo file Excel.");
        }
    };

    const handleDeleteRequest = (guestId) => setGuestToDelete(guestId);

    const confirmDeleteGuest = async () => {
        if (!guestToDelete || !invitationId) return;
        const promise = api.delete(`/invitations/${invitationId}/guests/${guestToDelete}`);
        handlePromiseToast(promise, {
            pending: 'Đang xóa khách mời...', success: 'Xóa khách mời thành công!', error: 'Xóa thất bại!'
        }).then(() => onDataChange(guestToDelete, 'delete-guest')).finally(() => setGuestToDelete(null));
    };

    const openEditModal = (guest) => {
        setEditingGuest(guest);
        setUpdateModalOpen(true);
    };

    const openAddModal = () => {
        setEditingGuest(null);
        setAddModalOpen(true);
    };

    const handleSendEmail = async (guest) => {
        if (!guest.email) {
            showErrorToast('Khách mời này không có địa chỉ email.');
            return;
        }
        const promise = api.put(`/invitations/${invitationId}/guests/${guest._id}/send-email`);
        handlePromiseToast(promise, {
            pending: `Đang gửi email tới ${guest.name}...`, success: `Đã gửi email thành công!`, error: `Gửi email thất bại!`
        }).then((response) => onDataChange(response.data.data, 'update-guest'));
    };

    const handleToggleGuestMenu = (guestId, e) => {
        e.stopPropagation();
        setOpenGuestMenu(prev => (prev === guestId ? null : guestId));
    };

    const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

    const stats = useMemo(() => ({
        total: filteredGuests.length,
        attending: filteredGuests.filter(g => g.status === 'attending').length,
        declined: filteredGuests.filter(g => g.status === 'declined').length,
        pending: filteredGuests.filter(g => g.status === 'pending' || !g.status).length,
        totalGiftAmount: filteredGuests.reduce((sum, g) => sum + (g.giftUnit === 'VND' ? (g.giftAmount || 0) : 0), 0),
    }), [filteredGuests]);

    const groupMap = useMemo(() => {
        if (!invitation?.guestGroups) return new Map();
        return new Map(invitation.guestGroups.map(group => [group._id, group.name]));
    }, [invitation?.guestGroups]);

    const getEmailStatusDisplayText = (status) => {
        switch (status) {
            case 'Đang gửi...': return 'Đang gửi...';
            case 'Đã gửi': return 'Đã gửi';
            case 'Thất bại': return 'Thất bại';
            default: return 'Chưa gửi';
        }
    };

    const handleUploadFile = () => {
        setImportHelpModalOpen(false);
        importFileInputRef.current.click();
    }
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "40px", paddingTop: '20px' }}>
            <div style={{ border: "0.5px solid rgb(128,128,128)", display: "flex", flexDirection: "column", alignItems: "end", gap: "12px", paddingBottom: "20px", width: '100%' }}>
                <div style={{ backgroundColor: "rgba(204,215,229,1)", width: '100%', display: "flex", alignItems: "center", padding: "20px", boxSizing: 'border-box' }}>
                    <div style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "20px", color: "rgba(39,84,138,1)", textTransform: "uppercase", fontWeight: "700" }}>Danh sách khách mời</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "0 20px", width: "100%", boxSizing: 'border-box' }}>
                    <div style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "16px", fontWeight: "500" }}>Gửi thiệp mời qua Email</div>
                    <div style={{ display: "flex", flexDirection: "row", gap: "20px", flexWrap: 'wrap' }}>
                        <button onClick={openAddModal} className="guest-action-btn"> <AddIcon /> <span>Thêm khách mời</span> </button>
                        {hasMasterGuests && (
                            <button onClick={() => setMasterGuestModalOpen(true)} className="guest-action-btn">
                                <GroupIcon />
                                <span>Thêm từ danh bạ</span>
                            </button>
                        )}
                        <button onClick={() => setManageGroupsModalOpen(true)} className="guest-action-btn"> <GroupIcon /> <span>Quản lý nhóm</span> </button>
                        
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <button onClick={() => setImportHelpModalOpen(true)} className="guest-action-btn">
                                <ImportIcon /> <span>Nhập từ Excel</span>
                            </button>
                            {/* <button onClick={() => setImportHelpModalOpen(true)} style={{background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#27548a', padding: 0, height: '40px'}}>
                                <InfoIcon />
                            </button> */}
                        </div>
                        <input
                            type="file"
                            ref={importFileInputRef}
                            style={{ display: 'none' }}
                            accept=".xlsx, .xls"
                            onChange={handleFileImport}
                        />

                        <button onClick={handleExportExcel} className="guest-action-btn"> <ExportIcon /> <span>Xuất danh sách</span> </button>
                    </div>
                </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: '100%' }}>
                <div style={{ display: "flex", flexDirection: "row", gap: "20px", width: "100%", flexWrap: 'wrap' }}>
                    <input className="filter-input" placeholder="Tìm kiếm theo tên hoặc email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    <select className="filter-select" value={filterGroup} onChange={e => setFilterGroup(e.target.value)}>
                        <option value="all">Tất cả nhóm</option>
                        {invitation?.guestGroups?.map(group => ( <option key={group._id} value={group._id}>{group.name}</option> ))}
                    </select>
                    <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="all">Tất cả trạng thái</option>
                        <option value="pending">Chưa xác nhận</option>
                        <option value="attending">Sẽ tham gia</option>
                        <option value="declined">Không tham gia</option>
                    </select>
                    <select className="filter-select" value={filterEmailStatus} onChange={e => setFilterEmailStatus(e.target.value)}>
                        <option value="all">Trạng thái Email</option>
                        <option value="Chưa gửi">Chưa gửi</option>
                        <option value="Đã gửi">Đã gửi</option>
                        <option value="Thất bại">Thất bại</option>
                    </select>
                </div>

                <div style={{ boxShadow: "0px 0px 8px 0px rgba(0,0,0,0.3)", width: '100%', display: isMobileOrTablet ? 'grid' : 'flex', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px', backgroundColor: '#E0E0E0', flexDirection: 'row', justifyContent: "center", alignItems: "center", overflow: 'hidden' }}>
                    <StatItem label="Tổng số khách mời" value={stats.total} /> { !isMobileOrTablet && <VerticalSeparator /> }
                    <StatItem label="Tham gia" value={stats.attending} /> { !isMobileOrTablet && <VerticalSeparator /> }
                    <StatItem label="Không tham gia" value={stats.declined} /> { !isMobileOrTablet && <VerticalSeparator /> }
                    <StatItem label="Không xác nhận" value={stats.pending} /> { !isMobileOrTablet && <VerticalSeparator /> }
                    <StatItem label="Tiền mừng" value={formatCurrency(stats.totalGiftAmount)} />
                </div>

                {isMobileOrTablet ? (
                <div className="guest-cards-container">
                    {filteredGuests.map((guest, index) => (
                        <GuestCard 
                            key={guest._id} 
                            guest={guest} 
                            onEdit={openEditModal}
                            onDelete={handleDeleteRequest}
                            onSendEmail={handleSendEmail}
                            isSelected={selectedGuestIds.has(guest._id)}
                            onSelect={() => handleToggleSelect(guest._id)}
                            index={index} 
                            groupName={groupMap.get(guest.group) || 'Chưa chọn nhóm'} 
                        />
                    ))}
                </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                        <div style={{ display: "flex", width: '100%' }}>
                            <div className="table-header-cell" style={{width: "60px", overflow: "hidden" }}>#</div>
                            <div className="table-header-cell" style={{width: "83px", overflow: "hidden"}}>Gửi thiệp</div>
                            <div className="table-header-cell" style={{flex: 2, justifyContent: 'start', paddingLeft: '20px'}}>Tên khách mời</div>
                            <div className="table-header-cell" style={{flex: 2.5, justifyContent: 'start', paddingLeft: '20px'}}>Email</div>
                            <div className="table-header-cell" style={{flex: 1.5, overflow: "hidden", justifyContent: 'start', paddingLeft: '20px'}}>Điện thoại</div>
                            <div className="table-header-cell" style={{flex: 2, overflow: "hidden"}}>Nhóm khách mời</div>
                            <div className="table-header-cell" style={{flex: 1, overflow: "hidden", justifyContent: 'start', paddingLeft: '20px'}}>Tham gia</div>
                            <div className="table-header-cell" style={{flex: 1, overflow: "hidden", justifyContent: 'start', paddingLeft: '20px'}}>Đi cùng</div>
                            <div className="table-header-cell" style={{flex: 1.5, overflow: "hidden", justifyContent: 'start', paddingLeft: '20px'}}>Mừng cưới</div>
                            <div className="table-header-cell" style={{flex: 2, overflow: "hidden"}}>Tác vụ</div>
                            <div className="table-header-cell" style={{flex: '0 0 40px'}}>
                                <input 
                                    ref={selectAllCheckboxRef}
                                    type="checkbox"
                                    onChange={handleToggleSelectAll}
                                    style={{width: '16px', height: '16px', cursor: 'pointer'}}
                                />
                            </div>
                        </div>
                        {filteredGuests.map((guest, index) => {
                            const isMenuOpen = openGuestMenu === guest._id;
                            const rowStyle = {
                                display: "flex",
                                width: '100%',
                                backgroundColor: index % 2 === 0 ? 'rgba(239,239,239,1)' : 'white',
                                position: 'relative', 
                                zIndex: isMenuOpen ? 20 : 'auto' 
                            };

                            return (
                            <div key={guest._id} style={rowStyle}>
                                <div className="table-body-cell" style={{width: "60px"}}>{index + 1}</div>
                                <div className="table-body-cell action-cell" style={{width: "83px", cursor: "pointer"}}>
                                    <div onClick={(e) => handleToggleGuestMenu(guest._id, e)}>
                                        <FiMail className="send-icon-glow" />
                                    </div>
                                    {openGuestMenu === guest._id && (
                                        <GuestActionDropdown
                                            guest={guest}
                                            invitationId={invitationId}
                                            onSendEmail={handleSendEmail}
                                            onClose={() => setOpenGuestMenu(null)}
                                        />
                                    )}
                                </div>                             
                                <div className="table-body-cell" style={{flex: 2, alignItems: 'flex-start', paddingLeft: '20px'}}>
                                    <div title={guest.name} style={{fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "20px", color: "rgba(39,84,138,1)", fontWeight: "700" }}>
                                        {guest.name}
                                    </div>
                                </div>
                                <div className="table-body-cell" style={{flex: 2.5, alignItems: 'flex-start', paddingLeft: '20px', overflow: 'hidden'}}>
                                    <div title={guest.email || 'Chưa có email'} style={{fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "16px"}}>
                                        {guest.email || 'N/A'}
                                    </div>
                                    <div style={{fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "14px", color: "rgba(102,102,102,1)"}}>
                                        {guest.email ? getEmailStatusDisplayText(guest.emailStatus) : 'Không có Email'}
                                    </div>
                                </div>
                                <div className="table-body-cell" style={{flex: 1.5, overflow: "hidden", alignItems: 'flex-start', paddingLeft: '20px'}}>{guest.phone || 'N/A'}</div>
                                <div className="table-body-cell" style={{flex: 2, overflow: "hidden"}}> <div className="group-tag">{groupMap.get(guest.group) || 'Chưa chọn nhóm'}</div> </div>
                                <div className="table-body-cell" style={{flex: 1, overflow: "hidden", alignItems: 'flex-start', paddingLeft: '20px'}}>{guest.status === 'attending' ? 'Có' : (guest.status === 'declined' ? 'Không' : 'Chờ')}</div>
                                <div className="table-body-cell" style={{flex: 1, overflow: "hidden", alignItems: 'flex-start', paddingLeft: '20px'}}>{guest.attendingCount || 0}</div>
                                <div className="table-body-cell" style={{flex: 1.5, overflow: "hidden", alignItems: 'flex-start', paddingLeft: '20px'}}>{formatCurrency(guest.giftAmount)}</div>
                                <div className="table-body-cell" style={{flex: 2, overflow: "hidden", flexDirection: 'row', gap: '16px'}}>
                                    <button className="table-action-btn" onClick={() => openEditModal(guest)}> <EditIcon /> </button>
                                    <button className="table-action-btn" onClick={() => handleDeleteRequest(guest._id)}> <DeleteIcon /> </button>
                                </div>
                                <div className="table-body-cell" style={{flex: '0 0 40px'}}>
                                    <input 
                                        type="checkbox"
                                        checked={selectedGuestIds.has(guest._id)}
                                        onChange={() => handleToggleSelect(guest._id)}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{width: '16px', height: '16px', cursor: 'pointer'}}
                                    />
                                </div>
                            </div>
                        );
                        })}
                    </div>
                )}

                {selectedGuestIds.size > 0 && (
                    <BulkActionsBar
                        count={selectedGuestIds.size}
                        onDelete={handleBulkDelete}
                        onSendEmail={handleBulkSendEmail}
                        onAddToGroup={handleBulkAddToGroup}
                        onRemoveFromGroup={() => confirmBulkUpdateGroup(null)} 
                        onDeselectAll={() => setSelectedGuestIds(new Set())}
                    />
                )}

                {isBulkDeleteModalOpen && (
                    <DeleteConfirmationModal
                        onClose={() => setBulkDeleteModalOpen(false)}
                        onConfirm={confirmBulkDelete}
                        message={`Xóa ${selectedGuestIds.size} khách mời đã chọn?`}
                        description="Hành động này không thể hoàn tác."
                    />
                )}
                {isAddToGroupModalOpen && (
                    <SelectGroupModal
                        count={selectedGuestIds.size}
                        groups={invitation?.guestGroups || []}
                        onClose={() => setAddToGroupModalOpen(false)}
                        onConfirm={confirmBulkUpdateGroup}
                    />
                )}
            </div>

            {isAddModalOpen && (
                <Modal onClose={() => setAddModalOpen(false)} size="normal">
                    <AddGuestForm
                        invitationId={invitationId}
                        onSave={onDataChange}
                        onClose={() => setAddModalOpen(false)}
                        onManageGroups={() => setManageGroupsModalOpen(true)}
                    />
                </Modal>
            )}
            {isUpdateModalOpen && editingGuest && (
                <Modal onClose={() => setUpdateModalOpen(false)} size="large">
                    <UpdateGuestForm
                        invitationId={invitationId}
                        guestToEdit={editingGuest}
                        onSave={onDataChange}
                        onClose={() => setUpdateModalOpen(false)}
                        onManageGroups={() => setManageGroupsModalOpen(true)}
                    />
                </Modal>
            )}
            {isManageGroupsModalOpen && (
                <Modal onClose={() => setManageGroupsModalOpen(false)} size="large">
                    <ManageGroupsModalContent
                        invitationId={invitationId}
                        onDataChange={onDataChange} 
                        onClose={() => setManageGroupsModalOpen(false)}
                    />
                </Modal>
            )}
            {guestToDelete && (
                <DeleteConfirmationModal onClose={() => setGuestToDelete(null)} onConfirm={confirmDeleteGuest} message="Bạn có chắc muốn xóa khách mời này?"/>
            )}
            {isImportHelpModalOpen && (
                 <ImportHelpModal onClose={() => handleUploadFile()} />
            )}

            {/* 3. THÊM MODAL RENDER MASTER GUEST VÀO ĐÂY */}
            {isMasterGuestModalOpen && (
                <Modal onClose={() => setMasterGuestModalOpen(false)} size="large">
                    <MasterGuestPanel
                        user={invitation?.user}
                        onAddGuestsToInvitation={(guests) => {
                            onDataChange(guests, 'add-guests-bulk'); // Gọi API thêm khách
                            setMasterGuestModalOpen(false); // Đóng popup sau khi thêm
                        }}
                        onClose={() => setMasterGuestModalOpen(false)} // Truyền hàm đóng cho nút X
                    />
                </Modal>
            )}
        </div>
    );
};


const WishManagementPanel = ({ invitationId }) => {
    const [wishes, setWishes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchWishes = useCallback(async () => {
        if (!invitationId) return;
        try {
            const response = await api.get(`/${invitationId}/wishes`);
            setWishes(response.data.data || []);
        } catch (error) {
            showErrorToast("Không thể tải danh sách lời chúc.");
        } finally {
            setLoading(false);
        }
    }, [invitationId]);

    useEffect(() => { fetchWishes(); }, [fetchWishes]);

    const handleToggleStatus = (wish) => {
        const newStatus = wish.status === 'approved' ? 'hidden' : 'approved';
        const promise = api.put(`/invitations/${invitationId}/wishes/${wish._id}`, { status: newStatus });
        
        handlePromiseToast(promise, {
            pending: 'Đang cập nhật trạng thái...',
            success: 'Cập nhật thành công!',
            error: 'Cập nhật thất bại!'
        }).then(() => {
            setWishes(prev => prev.map(w => w._id === wish._id ? { ...w, status: newStatus } : w));
        });
    };

    const handleDeleteWish = (wishId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa lời chúc này?")) return;
        const promise = api.delete(`/invitations/${invitationId}/wishes/${wishId}`);
        
        handlePromiseToast(promise, {
            pending: 'Đang xóa lời chúc...',
            success: 'Đã xóa thành công!',
            error: 'Xóa thất bại!'
        }).then(() => {
            setWishes(prev => prev.filter(w => w._id !== wishId));
        });
    };

    if (loading) return <p>Đang tải dữ liệu lời chúc...</p>;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", paddingTop: '20px', width: '100%' }}>
            <div style={{ backgroundColor: "rgba(204,215,229,1)", width: '100%', display: "flex", alignItems: "center", padding: "20px", boxSizing: 'border-box' }}>
                <div style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "20px", color: "rgba(39,84,138,1)", textTransform: "uppercase", fontWeight: "700" }}>Quản lý lời chúc ({wishes.length})</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", width: "100%", boxShadow: "0px 0px 8px 0px rgba(0,0,0,0.1)" }}>
                <div style={{ display: "flex", width: '100%', backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                    <div className="table-header-cell" style={{width: "60px"}}>#</div>
                    <div className="table-header-cell" style={{flex: 1.5, paddingLeft: '20px', justifyContent: 'flex-start'}}>Người gửi</div>
                    <div className="table-header-cell" style={{flex: 3, paddingLeft: '20px', justifyContent: 'flex-start'}}>Nội dung lời chúc</div>
                    <div className="table-header-cell" style={{flex: 1, justifyContent: 'center'}}>Trạng thái</div>
                    <div className="table-header-cell" style={{flex: 1, justifyContent: 'center'}}>Hành động</div>
                </div>
                
                {wishes.length === 0 ? (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#666' }}>Chưa có lời chúc nào.</div>
                ) : (
                    wishes.map((wish, index) => (
                        <div key={wish._id} style={{ display: "flex", width: '100%', backgroundColor: index % 2 === 0 ? 'white' : 'rgba(239,239,239,1)', borderBottom: '1px solid #eee', alignItems: 'center' }}>
                            <div className="table-body-cell" style={{width: "60px"}}>{index + 1}</div>
                            <div className="table-body-cell" style={{flex: 1.5, alignItems: 'flex-start', paddingLeft: '20px', flexDirection: 'column'}}>
                                <div style={{ fontWeight: 'bold', color: 'rgba(39,84,138,1)' }}>{wish.senderName}</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>{new Date(wish.createdAt).toLocaleDateString('vi-VN')}</div>
                            </div>
                            <div className="table-body-cell" style={{flex: 3, alignItems: 'flex-start', paddingLeft: '20px', paddingRight: '20px', whiteSpace: 'normal', lineHeight: '1.5'}}>
                                "{wish.content}"
                            </div>
                            <div className="table-body-cell" style={{flex: 1, justifyContent: 'center'}}>
                                <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', backgroundColor: wish.status === 'approved' ? '#d1fae5' : '#fee2e2', color: wish.status === 'approved' ? '#065f46' : '#991b1b' }}>
                                    {wish.status === 'approved' ? 'Đang hiển thị' : 'Đang ẩn'}
                                </span>
                            </div>
                            <div className="table-body-cell" style={{flex: 1, justifyContent: 'center', gap: '10px', flexDirection: 'row'}}>
                                <button className="table-action-btn" onClick={() => handleToggleStatus(wish)} title="Ẩn/Hiện">
                                    {wish.status === 'approved' ? <CancelIcon /> : <CheckIcon />}
                                </button>
                                <button className="table-action-btn" onClick={() => handleDeleteWish(wish._id)} title="Xóa">
                                    <DeleteIcon />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const EventManagementPanel = ({ invitation, onDataChange }) => {
    const [reminders, setReminders] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (invitation && invitation.settings) {
            setReminders(invitation.settings.emailReminders || []);
        }
    }, [invitation]);

    const handleReminderUpdate = (newReminders) => {
         setReminders(newReminders);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        
        if (!invitation?._id) {
            showErrorToast("Không tìm thấy ID của thiệp mời để lưu cài đặt.");
            setIsSaving(false);
            return;
        }
        
        // Cập nhật chỉ phần reminders, giữ nguyên các settings khác
        const payload = {
            settingsData: {
                ...invitation.settings,
                emailReminders: reminders
            } 
        };

        const promise = api.put(`/invitations/${invitation._id}/settings`, payload);

        handlePromiseToast(promise, {
            pending: 'Đang lưu cài đặt sự kiện...',
            success: 'Đã lưu thiết lập email nhắc nhở thành công!',
            error: 'Lưu cài đặt thất bại!'
        }).then((response) => onDataChange(response.data.data, 'update-settings'))
          .catch(err => {
              console.error("Lỗi khi lưu cài đặt:", err.response?.data || err.message);
          })
          .finally(() => setIsSaving(false));
    };

    return (
        <form onSubmit={handleSubmit} className="settings-panel-wrapper">
            <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
                <div>
                    <h3 className="settings-section-title">Thiết lập Email Nhắc nhở sự kiện</h3>
                    <ReminderSettings 
                        reminders={reminders} 
                        onUpdate={handleReminderUpdate} 
                    />
                </div>
            </div>

            <button type="submit" disabled={isSaving} className="settings-save-btn">
                {isSaving ? 'Đang lưu...' : 'Lưu thông tin'}
            </button>
        </form>
    );
};

const InvitationSettingsPanel = ({ invitation, onDataChange }) => {
    const [settings, setSettings] = useState({
        title: '',
        description: '',
        salutationStyle: 'Thân gửi',
        useGlobalSalutation: false,
        displayStyle: 'Kiểu 1',
        qrCodeImageUrls: [],
        videoUrl: '',
        wishesTitle: '',
        wishesSubtitle: '',
        // Xóa emailReminders ở state cục bộ này đi vì đã chuyển sang tab khác
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (invitation && invitation.settings) {
            setSettings({
                title: invitation.settings.title || '',
                description: invitation.settings.description || '',
                salutationStyle: invitation.settings.salutationStyle || 'Thân gửi',
                useGlobalSalutation: invitation.settings.useGlobalSalutation || false,
                displayStyle: invitation.settings.displayStyle || 'Kiểu 1',
                wishesTitle: invitation.settings.wishesTitle || 'Sổ Lưu Bút',
                wishesSubtitle: invitation.settings.wishesSubtitle || 'Hãy để lại những lời chúc tốt đẹp nhất dành cho chúng tôi nhé!',
            });
        }
    }, [invitation]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        
        if (!invitation?._id) return;
        
        // Merge lại với emailReminders cũ để không bị ghi đè mất khi lưu ở tab này
        const payload = {
            settingsData: {
                ...settings,
                emailReminders: invitation?.settings?.emailReminders || []
            } 
        };

        const promise = api.put(`/invitations/${invitation._id}/settings`, payload);

        handlePromiseToast(promise, {
            pending: 'Đang lưu cài đặt...',
            success: 'Đã lưu tất cả thay đổi thành công!',
            error: 'Lưu cài đặt thất bại!'
        }).then((response) => onDataChange(response.data.data, 'update-settings'))
          .finally(() => setIsSaving(false));
    };

    const emailDescription = useMemo(() => {
        if (settings.useGlobalSalutation) {
            return `Nội dung này sử dụng như một lời mời khi bạn gửi thiệp mời qua email.<br/>Lời chào chung cho <b>tất cả khách mời</b> sẽ là: "<b>${settings.salutationStyle}</b> {TênKháchMời}"`;
        } else {
            return `Nội dung này sử dụng như một lời mời khi bạn gửi thiệp mời qua email.<br/>Lời chào sẽ ưu tiên theo <b>nhóm khách mời</b>, nếu không có nhóm, lời chào mặc định sẽ là: "<b>${settings.salutationStyle}</b> {TênKháchMời}"`;
        }
    }, [settings.useGlobalSalutation, settings.salutationStyle]);

    return (
        <form onSubmit={handleSubmit} className="settings-panel-wrapper">
            <div className="settings-notice-box">
                <span style={{ fontWeight: "700" }}>Lưu ý:</span> Hệ thống sẽ tự động thay đổi cụm từ <code style={{fontWeight: 700}}>&#123;TênKháchMời&#125;</code> và <code style={{fontWeight: 700}}>&#123;LờiXưngHô&#125;</code>.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
                <div>
                    <h3 className="settings-section-title">Cài đặt Email & Lời chào</h3>
                    {/* Đã xóa <ReminderSettings /> ở đây */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                        <SettingsField 
                            label="Tiêu đề & Nội dung thiệp (Dùng cho Email)" 
                            required 
                            description={emailDescription} 
                        >
                            <div className="email-compose-container">
                                <div className="email-compose-header">
                                    <div className="email-compose-field">
                                        <span>Đến:</span>
                                        <div className="email-compose-recipient">
                                            &#123;TênKháchMời&#125; &lt;&#123;EmailKháchMời&#125;&gt;
                                        </div>
                                    </div>
                                    <div className="email-compose-field">
                                        <span>Chủ đề:</span>
                                        <input 
                                            name="title" 
                                            value={settings.title} 
                                            onChange={handleChange} 
                                            className="email-compose-subject"
                                            placeholder="Tiêu đề thiệp của bạn (cũng là chủ đề email)"
                                        />
                                    </div>
                                </div>
                                <div className="email-compose-body">
                                    <textarea 
                                        name="description" 
                                        value={settings.description} 
                                        onChange={handleChange} 
                                        className="email-compose-textarea"
                                        placeholder="Mô tả thiệp của bạn (cũng là nội dung email)..."
                                    />
                                </div>
                            </div>
                        </SettingsField>
                        <SettingsField
                            label="Kiểu hiển thị Lời Xưng Hô" 
                            required 
                            description="Kiểu hiển thị bạn chọn ở đây sẽ sử dụng cho biến: <code>&#123;LờiXưngHô&#125;</code>"
                        >
                            <select name="salutationStyle" value={settings.salutationStyle} onChange={handleChange} className="settings-select">
                                <option>Thân gửi</option> 
                                <option>Kính mời</option> 
                                <option>Trân trọng kính mời</option>
                            </select>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                                <input 
                                    type="checkbox" 
                                    id="useGlobalSalutation"
                                    name="useGlobalSalutation"
                                    checked={settings.useGlobalSalutation}
                                    onChange={handleChange}
                                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                />
                                <label htmlFor="useGlobalSalutation" style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "15px", color: "#333", fontWeight: 500, cursor: 'pointer' }}>
                                    Sử dụng cài đặt này cho tất cả khách mời (ghi đè cài đặt của nhóm)
                                </label>
                            </div>
                        </SettingsField>
                    </div>
                </div>
                <div style={{ marginTop: '40px' }}>
                    <h3 className="settings-section-title">Cài đặt Khu vực Lời chúc</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <SettingsField label="Tiêu đề khu vực lời chúc" required>
                            <input 
                                name="wishesTitle" 
                                value={settings.wishesTitle} 
                                onChange={handleChange} 
                                className="settings-input"
                                style={{ borderColor: "rgb(128,128,128)", borderWidth: "0.5px", borderStyle: "solid", width: "100%", height: "40px", padding: "0 20px" }}
                            />
                        </SettingsField>
                        <SettingsField label="Mô tả phụ (Subtitle)">
                            <textarea 
                                name="wishesSubtitle" 
                                value={settings.wishesSubtitle} 
                                onChange={handleChange} 
                                className="settings-input"
                                style={{ borderColor: "rgb(128,128,128)", borderWidth: "0.5px", borderStyle: "solid", width: "100%", height: "80px", padding: "10px 20px", fontFamily: "inherit" }}
                            />
                        </SettingsField>
                    </div>
                </div>
            </div>

            <button type="submit" disabled={isSaving} className="settings-save-btn">
                {isSaving ? 'Đang lưu...' : 'Lưu thông tin'}
            </button>
        </form>
    );
};

const ReminderSettings = ({ reminders, onUpdate }) => {
    const [newDays, setNewDays] = useState('');

    const handleAddReminder = () => {
        const days = parseInt(newDays);
        if (isNaN(days) || days <= 0) {
            showErrorToast("Số ngày phải là một số nguyên dương.");
            return;
        }

        const newReminder = {
            id: new Date().getTime().toString(), 
            daysBefore: days,
            template: 'default',
            isEnabled: true
        };

        onUpdate([...reminders, newReminder]);
        setNewDays('');
    };

    const handleRemoveReminder = (id) => {
        onUpdate(reminders.filter(r => r.id !== id));
    };

    const handleToggleEnable = (id) => {
        onUpdate(reminders.map(r => r.id === id ? { ...r, isEnabled: !r.isEnabled } : r));
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: '#f9f9f9' }}>
            <h4 style={{ margin: 0, color: '#27548a' }}>Thiết lập Email Nhắc nhở</h4>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input 
                    type="number" 
                    value={newDays}
                    onChange={(e) => setNewDays(e.target.value)}
                    placeholder="Số ngày trước sự kiện"
                    min="1"
                    className="settings-input"
                    style={{ flex: 1, height: '40px' }}
                />
                <button 
                    onClick={handleAddReminder} 
                    className="guest-action-btn"
                    style={{ flex: '0 0 120px', backgroundColor: '#27548a', color: 'white', borderColor: '#27548a', height: '40px' }}
                >
                    <AddIcon /> Thêm
                </button>
            </div>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {reminders.map(reminder => (
                    <li key={reminder.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #eee' }}>
                        <div style={{ flex: 1 }}>
                            <strong style={{ color: reminder.isEnabled ? '#10B981' : '#EF4444' }}>
                                {reminder.daysBefore} ngày trước
                            </strong>
                            <span style={{ marginLeft: '10px', fontSize: '14px', color: '#6B7280' }}>
                                ({reminder.isEnabled ? 'Đã bật' : 'Đã tắt'})
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <button 
                                type="button" 
                                onClick={() => handleToggleEnable(reminder.id)}
                                className="table-action-btn"
                                style={{ color: reminder.isEnabled ? '#10B981' : '#F59E0B' }}
                            >
                                {reminder.isEnabled ? 'Tắt' : 'Bật'}
                            </button>
                            <button 
                                type="button" 
                                onClick={() => handleRemoveReminder(reminder.id)}
                                className="table-action-btn"
                            >
                                <DeleteIcon width="16" height="16" />
                            </button>
                        </div>
                    </li>
                ))}
                {reminders.length === 0 && <p style={{textAlign: 'center', color: '#6B7280', fontSize: '14px'}}>Chưa có lịch nhắc nhở nào.</p>}
            </ul>
        </div>
    );
};
const InvitationPreviewCanvas = ({ page, baseWidth, baseHeight }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !page || !container) return;

        canvas.width = baseWidth;
        canvas.height = baseHeight;

        const handleResize = () => {
            const { width: containerWidth } = container.getBoundingClientRect();
            if (containerWidth > 0) {
                const scale = containerWidth / baseWidth;
                canvas.style.width = `${containerWidth}px`;
                canvas.style.height = `${baseHeight * scale}px`;
            }
        };

        const renderAll = async () => {
            const { backgroundImage, backgroundColor, items } = page; 
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = backgroundColor || '#FFFFFF'; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            if (backgroundImage) {
                const bgImg = new Image();
                bgImg.crossOrigin = "anonymous";
                try {
                    await new Promise((resolve, reject) => {
                        bgImg.onload = resolve;
                        bgImg.onerror = reject;
                        bgImg.src = backgroundImage;
                    });
                    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
                } catch (e) {
                    console.error("Lỗi tải ảnh nền preview:", e);
                    ctx.fillStyle = '#f0f0f0';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
            }
            const sortedItems = [...(items || [])].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
            for (const item of sortedItems) {
                if (item.visible === false) continue;
                ctx.save();
                ctx.globalAlpha = item.opacity ?? 1;
                ctx.translate(item.x + item.width / 2, item.y + item.height / 2);
                ctx.rotate((item.rotation || 0) * Math.PI / 180);

                if (item.type === 'text' && item.content) {
                    ctx.font = `${item.fontSize}px "${item.fontFamily}"`;
                    ctx.fillStyle = item.color;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    const lines = wrapText(ctx, item.content, item.width);
                    const lineHeight = item.fontSize * 1.3;
                    const totalHeight = lines.length * lineHeight;
                    lines.forEach((line, index) => {
                        ctx.fillText(line, 0, (index * lineHeight) - (totalHeight / 2) + (lineHeight / 2));
                    });
                } else if (item.type === 'image' && item.url) {
                    const itemImg = new Image();
                    itemImg.crossOrigin = "anonymous";
                    try {
                        await new Promise((resolve, reject) => {
                            itemImg.onload = resolve;
                            itemImg.onerror = reject;
                            itemImg.src = item.url;
                        });

                        // --- BẮT ĐẦU SỬA LỖI ---

                        // 1. Set clipping path (khung) dựa trên item.shape
                        ctx.beginPath();
                        if (item.shape === 'circle') {
                            // SỬA LỖI: Sử dụng ctx.ellipse để hỗ trợ hình oval khi scale non-uniform
                            const radiusX = item.width / 2;
                            const radiusY = item.height / 2;

                            if (ctx.ellipse) {
                                 ctx.ellipse(
                                    0, // x center (đã translate)
                                    0, // y center (đã translate)
                                    radiusX, // radiusX
                                    radiusY, // radiusY
                                    0, // rotation
                                    0,
                                    Math.PI * 2
                                );
                            } else {
                                // Fallback cho browser không hỗ trợ ellipse (sử dụng hình tròn nhỏ hơn)
                                 ctx.arc(
                                    0, // x center (đã translate)
                                    0, // y center (đã translate)
                                    Math.min(radiusX, radiusY), // bán kính
                                    0,
                                    Math.PI * 2
                                );
                            }

                        } else {
                            // Mặc định là hình chữ nhật
                            ctx.rect(-item.width / 2, -item.height / 2, item.width, item.height);
                        }
                        ctx.closePath();
                        ctx.clip(); // Áp dụng clipping

                        // 2. Áp dụng filter (nếu có)
                        const filterString = `brightness(${item.brightness ?? 1}) contrast(${item.contrast ?? 1}) grayscale(${item.grayscale ?? 0})`;
                        ctx.filter = filterString;

                        // 3. Tính toán kích thước "object-fit: cover"
                        const frameRatio = item.width / item.height;
                        const imgRatio = itemImg.naturalWidth / itemImg.naturalHeight;
                        
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

                        // 4. Lấy vị trí pan/scan (không cần nhân scale)
                        const posX = (item.imagePosition?.x || 0);
                        const posY = (item.imagePosition?.y || 0);
                        
                        // 5. Tính toán vị trí vẽ (drawX, drawY)
                        // Căn giữa ảnh (đã "cover") sau đó áp dụng vị trí pan/scan
                        const drawX = (-item.width / 2) - (drawWidth - item.width) / 2 + posX;
                        const drawY = (-item.height / 2) - (drawHeight - item.height) / 2 + posY;

                        // 6. Vẽ ảnh đã được tính toán
                        ctx.drawImage(
                            itemImg,
                            drawX, 
                            drawY,
                            drawWidth,
                            drawHeight
                        );
                        
                        // --- KẾT THÚC SỬA LỖI ---

                    } catch (e) {
                        console.error("Lỗi tải ảnh item preview:", e);
                    }
                }
                ctx.restore();
            }
        };
        handleResize(); 
        renderAll();    
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [page, baseWidth, baseHeight]);

    return (
        <div ref={containerRef} style={{ width: '100%', height: 'auto', lineHeight: 0 }}>
            <canvas ref={canvasRef} style={{ border: '1px solid #ddd', borderRadius: '4px', display: 'block' }}/>
        </div>
    );
};

const InvitationDashboard = ({ invitation, onTabClick }) => {
    const pages = invitation?.content || [];
    const firstPage = pages[0];
    const templateWidth = firstPage?.canvasWidth || invitation?.template?.templateData?.width || 460;
    const templateHeight = firstPage?.canvasHeight || invitation?.template?.templateData?.height || 460;
    const previewPages = pages.slice(0, 3);

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "120px", width: '100%', padding: '40px 0' }}>
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "start", gap: "20px", width: "100%", maxWidth: "1520px", flexWrap: 'wrap' }}>
                <div style={{ backgroundColor: "rgba(255,255,255,1)", border: "0.5px solid rgb(128,128,128)", width: "493px", minWidth: '320px', flex: '1 1 30%', height: "284px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "20px", height: "100%", padding: '20px' }}>
                        <div style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "20px", textAlign: "center", color: "rgba(0,0,0,1)", fontWeight: "700" }}>Tổng số Khách mời</div>
                        <div style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "48px", textAlign: "center", color: "rgba(39,84,138,1)", fontWeight: "700" }}>{invitation?.guests?.length || 0}</div>
                        <div style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "16px", textAlign: "center", color: "rgba(0,0,0,1)", lineHeight: "21px", fontWeight: "500", flexGrow: 1 }}>Tổng số khách mời bạn đang có</div>
                        <button onClick={() => onTabClick('guests')} style={{ backgroundColor: "rgba(39,84,138,1)", width: "100%", maxWidth: "413px", height: "52px", display: "flex", justifyContent: "center", alignItems: "center", border: 'none', cursor: 'pointer', color: 'white', textTransform: 'uppercase', fontWeight: 600, fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "16px" }}>
                            Quản lý khách mời
                        </button>
                    </div>
                </div>
                <div style={{ backgroundColor: "rgba(255,255,255,1)", border: "0.5px solid rgb(128,128,128)", width: "493px", minWidth: '320px', flex: '1 1 30%', height: "284px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "20px", height: "100%", padding: '20px' }}>
                        <div style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "20px", textAlign: "center", color: "rgba(0,0,0,1)", fontWeight: "700" }}>Tổng số lời chúc</div>
                        <div style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "48px", textAlign: "center", color: "rgba(39,84,138,1)", fontWeight: "700" }}>0</div>
                        <div style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "16px", textAlign: "center", color: "rgba(0,0,0,1)", lineHeight: "21px", fontWeight: "500", flexGrow: 1 }}>Tổng số lời chúc khách mời đã gửi</div>
                        <button onClick={() => onTabClick('wishes')} style={{ backgroundColor: "rgba(39,84,138,1)", width: "100%", maxWidth: "413px", height: "52px", display: "flex", justifyContent: "center", alignItems: "center", border: 'none', cursor: 'pointer', color: 'white', textTransform: 'uppercase', fontWeight: 600, fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "16px" }}>
                            Quản lý lời chúc
                        </button>
                    </div>
                </div>
                <div style={{ backgroundColor: "rgba(255,255,255,1)", border: "0.5px solid rgb(128,128,128)", width: "493px", minWidth: '320px', flex: '1 1 30%', height: "284px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "20px", height: "100%", padding: '20px' }}>
                        <div style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "20px", textAlign: "center", color: "rgba(0,0,0,1)", fontWeight: "700" }}>Số lượt gửi Email</div>
                        <div style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "48px", textAlign: "center", color: "rgba(39,84,138,1)", fontWeight: "700" }}>...</div>
                        <div style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "16px", textAlign: "center", color: "rgba(0,0,0,1)", lineHeight: "21px", fontWeight: "500", flexGrow: 1 }}>Số lượt gửi thiệp mời qua Email còn lại</div>
                        <button onClick={() => onTabClick('guests')} style={{ backgroundColor: "rgba(39,84,138,1)", width: "100%", maxWidth: "413px", height: "52px", display: "flex", justifyContent: "center", alignItems: "center", border: 'none', cursor: 'pointer', color: 'white', textTransform: 'uppercase', fontWeight: 600, fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "16px" }}>
                            Quản lý khách mời
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ backgroundColor: "rgba(255,255,255,1)", width: '100%', maxWidth: '1520px', boxShadow: "0px 0px 8px 0px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", justifyContent: "start", alignItems: "center", gap: "40px", padding: "40px", boxSizing: 'border-box' }}>
                <div style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "20px", textAlign: "center", color: "rgba(39,84,138,1)", textTransform: "uppercase", fontWeight: "700" }}>Thiết kế thiệp mời</div>
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", gap: "20px", flexWrap: "wrap", width: "100%" }}>
                    {previewPages.length > 0 ? (
                        previewPages.map((page, index) => (
                            <div key={index} style={{ flex: '1 1 30%', maxWidth: '460px', minWidth: '280px' }}>
                                <InvitationPreviewCanvas
                                    page={page}
                                    baseWidth={templateWidth}
                                    baseHeight={templateHeight}
                                />
                            </div>
                        ))
                    ) : (
                        <div style={{ width: '100%', height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
                            <p>Không có dữ liệu xem trước cho thiệp này.</p>
                        </div>
                    )}
                </div>
                <button onClick={() => onTabClick('edit')} style={{ backgroundColor: "rgba(39,84,138,1)", width: "389px", height: "60px", display: "flex", justifyContent: "center", alignItems: "center", border: 'none', cursor: 'pointer' }}>
                    <div style={{ fontFamily: "'SVN-Gilroy', sans-serif", fontSize: "16px", color: "rgba(255,255,255,1)", textTransform: "uppercase", fontWeight: "600" }}>Chỉnh sửa thiết kế</div>
                </button>
            </div>
        </div>
    );
};

const TaskManagementPanel = ({ invitationId, initialTasks = [], onDataChange }) => {
    // Tự động Migration: Nếu dữ liệu cũ là mảng phẳng, bọc nó vào 1 category mặc định
    const [tasks, setTasks] = useState(() => {
        if (initialTasks.length > 0 && !initialTasks[0].subTasks) {
            return [{
                id: 'legacy-category',
                title: 'Công việc chung (Dữ liệu cũ)',
                isExpanded: true,
                subTasks: initialTasks
            }];
        }
        return initialTasks;
    });

    const [newCategoryTitle, setNewCategoryTitle] = useState('');
    const [newSubTaskTitles, setNewSubTaskTitles] = useState({});
    
    // Trạng thái edit
    const [editingItem, setEditingItem] = useState(null); // { catId, taskId, title }

    useEffect(() => {
        if (initialTasks.length > 0 && initialTasks[0].subTasks) {
            setTasks(initialTasks);
        }
    }, [initialTasks]);

    const saveTasksToDB = async (updatedTasks) => {
        try {
            const response = await api.put(`/invitations/${invitationId}/tasks`, { tasks: updatedTasks });
            onDataChange(response.data.data, 'update-tasks');
        } catch (error) {
            showErrorToast('Không thể lưu kế hoạch cưới.');
        }
    };

    const onDragEnd = (result) => {
        const { source, destination, type } = result;

        if (!destination) return;

        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            return;
        }

        let updatedTasks = Array.from(tasks);

        // 1. Kéo thả Category (Loại lớn)
        if (type === 'CATEGORY') {
            const [reorderedCategory] = updatedTasks.splice(source.index, 1);
            updatedTasks.splice(destination.index, 0, reorderedCategory);
        }

        // 2. Kéo thả Sub-task (Tác con)
        if (type === 'SUBTASK') {
            const sourceParentId = source.droppableId;
            const destParentId = destination.droppableId;

            const sourceCategoryIndex = updatedTasks.findIndex(c => c.id === sourceParentId);
            const destCategoryIndex = updatedTasks.findIndex(c => c.id === destParentId);

            const sourceCategory = updatedTasks[sourceCategoryIndex];
            const destCategory = updatedTasks[destCategoryIndex];

            const newSourceSubTasks = Array.from(sourceCategory.subTasks || []);
            const [movedSubTask] = newSourceSubTasks.splice(source.index, 1);

            // Nếu kéo thả trong cùng một Category
            if (sourceParentId === destParentId) {
                newSourceSubTasks.splice(destination.index, 0, movedSubTask);
                
                updatedTasks[sourceCategoryIndex] = {
                    ...sourceCategory,
                    subTasks: newSourceSubTasks
                };
            } else {
                // Nếu kéo từ Category này sang Category khác
                const newDestSubTasks = Array.from(destCategory.subTasks || []);
                newDestSubTasks.splice(destination.index, 0, movedSubTask);

                updatedTasks[sourceCategoryIndex] = {
                    ...sourceCategory,
                    subTasks: newSourceSubTasks
                };

                updatedTasks[destCategoryIndex] = {
                    ...destCategory,
                    subTasks: newDestSubTasks
                };
            }
        }

        setTasks(updatedTasks);
        saveTasksToDB(updatedTasks);
    };

    // --- QUẢN LÝ CATEGORY (TÁC LỚN) ---
    const handleAddCategory = (e) => {
        e.preventDefault();
        if (!newCategoryTitle.trim()) return;
        const newCat = { id: Date.now().toString(), title: newCategoryTitle, isExpanded: true, subTasks: [] };
        const updatedTasks = [...tasks, newCat];
        
        setTasks(updatedTasks);
        saveTasksToDB(updatedTasks);
        setNewCategoryTitle('');
    };

    const handleDeleteCategory = (catId) => {
        const updatedTasks = tasks.filter(c => c.id !== catId);
        setTasks(updatedTasks);
        saveTasksToDB(updatedTasks);
    };

    const handleToggleExpand = (catId) => {
        const updatedTasks = tasks.map(c => c.id === catId ? { ...c, isExpanded: !c.isExpanded } : c);
        setTasks(updatedTasks);
        saveTasksToDB(updatedTasks);
    };

    // --- QUẢN LÝ SUB-TASK (TÁC CON) ---
    const handleAddSubTask = (e, catId) => {
        e.preventDefault();
        const title = newSubTaskTitles[catId];
        if (!title?.trim()) return;

        const updatedTasks = tasks.map(cat => {
            if (cat.id === catId) {
                return {
                    ...cat,
                    subTasks: [...(cat.subTasks || []), { id: Date.now().toString(), title, completed: false }]
                };
            }
            return cat;
        });

        setTasks(updatedTasks);
        saveTasksToDB(updatedTasks);
        setNewSubTaskTitles(prev => ({ ...prev, [catId]: '' }));
    };

    const handleToggleComplete = (catId, taskId) => {
        const updatedTasks = tasks.map(cat => {
            if (cat.id === catId) {
                return {
                    ...cat,
                    subTasks: (cat.subTasks || []).map(st => st.id === taskId ? { ...st, completed: !st.completed } : st)
                };
            }
            return cat;
        });
        setTasks(updatedTasks);
        saveTasksToDB(updatedTasks);
    };

    const handleDeleteSubTask = (catId, taskId) => {
        const updatedTasks = tasks.map(cat => {
            if (cat.id === catId) {
                return { ...cat, subTasks: (cat.subTasks || []).filter(st => st.id !== taskId) };
            }
            return cat;
        });
        setTasks(updatedTasks);
        saveTasksToDB(updatedTasks);
    };

    // --- EDITING ---
    const startEditing = (catId, taskId, currentTitle) => {
        setEditingItem({ catId, taskId, title: currentTitle });
    };

    const handleSaveEdit = () => {
        if (!editingItem || !editingItem.title.trim()) {
            setEditingItem(null);
            return;
        }

        const updatedTasks = tasks.map(cat => {
            if (cat.id === editingItem.catId) {
                if (!editingItem.taskId) { // Edit Category
                    return { ...cat, title: editingItem.title };
                } else { // Edit SubTask
                    return {
                        ...cat,
                        subTasks: (cat.subTasks || []).map(st => st.id === editingItem.taskId ? { ...st, title: editingItem.title } : st)
                    };
                }
            }
            return cat;
        });

        setTasks(updatedTasks);
        saveTasksToDB(updatedTasks);
        setEditingItem(null);
    };

    // --- TÍNH TOÁN PROGRESS ---
    const totalTasks = tasks.reduce((sum, cat) => sum + (cat.subTasks?.length || 0), 0);
    const completedTasks = tasks.reduce((sum, cat) => sum + (cat.subTasks?.filter(st => st.completed)?.length || 0), 0);
    const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    return (
        <div className="task-management-wrapper">
            {/* 1. Header & Progress */}
            <div className="task-progress-card-creative">
                <div className="task-progress-header-creative">
                    <h3 className="task-progress-title-creative">
                        Hành trình chuẩn bị cưới
                    </h3>
                    <div className="task-progress-badge-creative">
                        <span>{completedTasks}</span> / {totalTasks} công việc
                    </div>
                </div>

                <div className="creative-timeline-wrapper">
                    {/* Con số % bay lơ lửng trên cùng */}
                    <div className="creative-timeline-percentage" style={{ left: `calc(${progress}% - 20px)` }}>
                        {progress}%
                    </div>

                    <div className="creative-timeline-track">
                        {/* Các mốc Milestone cố định */}
                        {[25, 50, 75, 100].map(m => (
                            <div key={m} className={`timeline-milestone ${progress >= m ? 'achieved' : ''}`} style={{ left: `${m}%` }}>
                                <div className="milestone-dot"></div>
                            </div>
                        ))}
                        
                        {/* Thanh chạy tiến độ */}
                        <div className="creative-timeline-fill" style={{ width: `${progress}%` }}>
                            {/* Tia sáng lướt qua */}
                            <div className="timeline-light-sweep"></div>
                            
                            {/* Icon Trái tim nhịp đập ở đầu thanh */}
                            {progress > 0 && (
                                <div className="timeline-thumb-icon">
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Thêm nhóm công việc mới (Category) */}
            <form onSubmit={handleAddCategory} className="task-add-form">
                <div className="task-input-wrapper">
                    <input 
                        type="text" 
                        value={newCategoryTitle} 
                        onChange={(e) => setNewCategoryTitle(e.target.value)} 
                        placeholder="Thêm Nhóm công việc lớn (VD: Đặt tiệc, Chụp ảnh cưới...)" 
                        className="task-add-input"
                    />
                    <button type="submit" className="task-add-submit-btn" disabled={!newCategoryTitle.trim()}>
                        <AddIcon /> <span style={{marginLeft: '6px'}}>Thêm Nhóm</span>
                    </button>
                </div>
            </form>

            {/* 3. Danh sách công việc phân cấp có kéo thả */}
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="all-categories" type="CATEGORY">
                    {(provided) => (
                        <div 
                            className="task-categories-container"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            {tasks.length === 0 ? (
                                <div className="timeline-empty-state">
                                    <p>Chưa có kế hoạch nào. Hãy thêm nhóm công việc để bắt đầu!</p>
                                </div>
                            ) : (
                                tasks.map((category, index) => {
                                    const isCatEditing = editingItem?.catId === category.id && !editingItem?.taskId;
                                    
                                    return (
                                        <Draggable key={category.id} draggableId={category.id} index={index}>
                                            {(providedCat, snapshotCat) => (
                                                <div 
                                                    className={`task-category-card ${snapshotCat.isDragging ? 'is-dragging' : ''}`}
                                                    ref={providedCat.innerRef}
                                                    {...providedCat.draggableProps}
                                                >
                                                    {/* CATEGORY HEADER */}
                                                    <div className="task-category-header">
                                                        <div className="task-category-header-left">
                                                            <div className="category-drag-handle" {...providedCat.dragHandleProps}>
                                                                <DragHandleIcon />
                                                            </div>
                                                            <div className={`dropdown-icon ${category.isExpanded ? 'expanded' : ''}`} onClick={() => handleToggleExpand(category.id)}>
                                                                <BackArrowIcon /> 
                                                            </div>
                                                            {isCatEditing ? (
                                                                <input 
                                                                    autoFocus
                                                                    value={editingItem.title}
                                                                    onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                                                                    onBlur={handleSaveEdit}
                                                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                                                                    onClick={e => e.stopPropagation()}
                                                                    className="timeline-edit-input"
                                                                />
                                                            ) : (
                                                                <h4 className="task-category-title" onClick={() => handleToggleExpand(category.id)}>{category.title}</h4>
                                                            )}
                                                            <span className="task-category-counter">({category.subTasks?.length || 0})</span>
                                                        </div>
                                                        
                                                        <div className="task-category-actions">
                                                            <button onClick={() => startEditing(category.id, null, category.title)} className="table-action-btn">
                                                                <EditIcon width="16" height="16" />
                                                            </button>
                                                            <button onClick={() => handleDeleteCategory(category.id)} className="table-action-btn timeline-delete-btn">
                                                                <DeleteIcon width="16" height="16" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* CATEGORY BODY (SUB-TASKS Droppable) */}
                                                    {category.isExpanded && (
                                                        <Droppable droppableId={category.id} type="SUBTASK">
                                                            {(providedSub, snapshotSub) => (
                                                                <div 
                                                                    className={`task-category-body ${snapshotSub.isDraggingOver ? 'is-dragging-over' : ''}`}
                                                                    ref={providedSub.innerRef}
                                                                    {...providedSub.droppableProps}
                                                                >
                                                                    <div className="subtasks-list">
                                                                        {category.subTasks?.map((task, subIndex) => {
                                                                            const isTaskEditing = editingItem?.catId === category.id && editingItem?.taskId === task.id;
                                                                            return (
                                                                                <Draggable key={task.id} draggableId={task.id} index={subIndex}>
                                                                                    {(providedTask, snapshotTask) => (
                                                                                        <div 
                                                                                            className={`subtask-item ${task.completed ? 'completed' : ''} ${snapshotTask.isDragging ? 'is-dragging' : ''}`}
                                                                                            ref={providedTask.innerRef}
                                                                                            {...providedTask.draggableProps}
                                                                                        >
                                                                                            <div className="subtask-drag-handle" {...providedTask.dragHandleProps}>
                                                                                                <DragHandleIcon />
                                                                                            </div>
                                                                                            <div className="subtask-checkbox" onClick={() => handleToggleComplete(category.id, task.id)}>
                                                                                                {task.completed && <CheckIcon />}
                                                                                            </div>
                                                                                            
                                                                                            <div className="subtask-content">
                                                                                                {isTaskEditing ? (
                                                                                                    <input 
                                                                                                        autoFocus
                                                                                                        value={editingItem.title}
                                                                                                        onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                                                                                                        onBlur={handleSaveEdit}
                                                                                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                                                                                                        className="timeline-edit-input"
                                                                                                    />
                                                                                                ) : (
                                                                                                    <span className="subtask-title" onClick={() => startEditing(category.id, task.id, task.title)}>
                                                                                                        {task.title}
                                                                                                    </span>
                                                                                                )}
                                                                                            </div>

                                                                                            <button onClick={() => handleDeleteSubTask(category.id, task.id)} className="table-action-btn subtask-delete-btn">
                                                                                                <CancelIcon />
                                                                                            </button>
                                                                                        </div>
                                                                                    )}
                                                                                </Draggable>
                                                                            )
                                                                        })}
                                                                        {providedSub.placeholder}
                                                                    </div>
                                                                    
                                                                    {/* Thêm Sub-task Form */}
                                                                    <form onSubmit={(e) => handleAddSubTask(e, category.id)} className="subtask-add-form">
                                                                        <input 
                                                                            type="text"
                                                                            value={newSubTaskTitles[category.id] || ''}
                                                                            onChange={e => setNewSubTaskTitles(prev => ({...prev, [category.id]: e.target.value}))}
                                                                            placeholder="Thêm công việc chi tiết..."
                                                                            className="subtask-add-input"
                                                                        />
                                                                        <button type="submit" disabled={!newSubTaskTitles[category.id]?.trim()} className="subtask-add-btn">
                                                                            Lưu
                                                                        </button>
                                                                    </form>
                                                                </div>
                                                            )}
                                                        </Droppable>
                                                    )}
                                                </div>
                                            )}
                                        </Draggable>
                                    )
                                })
                            )}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};

const InvitationDetailView = ({ invitation, onGoBack, onDelete, onDataChange, activeTab, onTabChange }) => {
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const navigate = useNavigate();

    const tabs = [
        { id: 'dashboard', title: 'Tổng quan' },
        { id: 'guests', title: 'Quản lý khách mời' },
        { id: 'wishes', title: 'Quản lý lời chúc' },
        // { id: 'master-guests', title: 'Danh bạ khách mời' },
        { id: 'event-management', title: 'Quản lí sự kiện' },
        { id: 'tasks', title: 'Kế hoạch cưới' },
        { id: 'invitation-settings', title: 'Cài đặt thiệp mời' },
        { id: 'delete', title: 'Xóa thiệp mời' },
    ];
    
    // const handleAddGuestsFromMaster = (guests) => {
    //     onDataChange(guests, 'add-guests-bulk');
    // };

    const handleTabClick = (tabId) => {
        if (tabId === 'edit') {
            navigate(`/canvas/edit/${invitation._id}`);
        } else if (tabId === 'delete') {
            setDeleteModalOpen(true);
        } else {
            onTabChange(tabId);
        }
    };

    const handleDeleteConfirm = () => {
        onDelete(invitation._id);
        setDeleteModalOpen(false);
    };

    const Tab = ({ id, title, isActive, onClick }) => (
        <button onClick={() => onClick(id)} className={`tab-button ${isActive ? 'active' : ''}`}>
            {title}
        </button>
    );

    const PageHeader = () => (
        <div className="page-header-container">
            <button onClick={onGoBack} className="back-button">
                <div className="back-button-icon-wrapper"> <BackArrowIcon /> </div>
                <span>Trở về</span>
            </button>
            <div className="page-header-title">
                <span>{invitation.slug || 'Thiết kế thiệp mời không tên'}</span>
            </div>
        </div>
    );

    const renderActivePanel = () => {
        switch (activeTab) {
            case 'dashboard':
                return <InvitationDashboard invitation={invitation} onTabClick={handleTabClick} />;
            case 'guests':
                return <GuestManagementPanel invitationId={invitation._id} guests={invitation.guests || []} onDataChange={onDataChange} invitation={invitation} onTabChange={onTabChange} />;
            case 'wishes':
                return <WishManagementPanel invitationId={invitation._id} />;
            // case 'master-guests': // <-- RENDER PANEL MỚI
            //     return <MasterGuestPanel user={invitation.user} onAddGuestsToInvitation={handleAddGuestsFromMaster} />;
            case 'tasks':
                return <TaskManagementPanel invitationId={invitation._id} initialTasks={invitation.tasks || []} onDataChange={onDataChange} />;
            case 'event-management': // <- BỔ SUNG SWITCH CASE
                return <EventManagementPanel invitation={invitation} onDataChange={onDataChange} />;
            case 'invitation-settings':
                return <InvitationSettingsPanel invitation={invitation} onDataChange={onDataChange} />;
            default:
                 return <InvitationDashboard invitation={invitation} onTabClick={handleTabClick} />;
        }
    }

    const GridContainer = ({ children }) => (
        <div style={{ width: '100%', maxWidth: '1520px', margin: '0 auto', boxSizing: 'border-box', padding: '0 20px' }}>
            {children}
        </div>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: '100%', overflowX: 'hidden' }}>
            
            {/* 1. Header thẳng lề */}
            <GridContainer>
                <PageHeader />
            </GridContainer>
            
            {/* 2. Thanh Tabs vươn viền full màn hình nhưng nội dung lõi thẳng lề */}
            <div className="tabs-container-wrapper">
                <GridContainer>
                    <div className="tabs-container" style={{ margin: 0, maxWidth: '100%' }}>
                        {tabs.map(tab => (
                            <Tab key={tab.id} id={tab.id} title={tab.title} isActive={activeTab === tab.id} onClick={handleTabClick} />
                        ))}
                    </div>
                </GridContainer>
            </div>

            {/* 3. Panel nội dung (Thẻ thống kê, Form,...) thẳng lề */}
            <GridContainer>
                {renderActivePanel()}
            </GridContainer>
            
            {isDeleteModalOpen && (
                <DeleteConfirmationModal onClose={() => setDeleteModalOpen(false)} onConfirm={handleDeleteConfirm} message="Bạn có chắc chắn muốn xóa thiệp mời này?"/>
            )}
        </div>
    );
};

const InvitationListView = ({ invitations, onManageClick }) => {
    const safeInvitations = Array.isArray(invitations) ? invitations : [];
    return (
        <div className="container">
            <header className="page-header">
                <h2>Thiệp mời của bạn</h2>
                <p>({safeInvitations.length} tấm thiệp bạn đã tạo)</p>
            </header>
            <div className="invitation-grid-wrapper">
                {safeInvitations.map(invitation => (
                     <div key={invitation._id} className="invitation-card" onClick={() => onManageClick(invitation)}>
                         <img 
                             className="invitation-card-image"
                             src={invitation.template?.imgSrc || 'https://placehold.co/300x300/EEE/31343C?text=No+Image'} 
                             alt={invitation.slug || 'Thiết kế không tên'}
                         />
                         <div className="invitation-card-title">{invitation.slug || 'Thiết kế thiệp mời không tên'}</div>
                         <div className="invitation-card-button">
                             <div className="invitation-card-button-text"><span>Quản lý thiệp</span></div>
                         </div>
                      </div>
                ))}
            </div>
        </div>
    );
}

const InvitationManagement = () => {
    const { invitationId } = useParams();
    const navigate = useNavigate();
    const location = useLocation(); 
    const [myInvitations, setMyInvitations] = useState([]);
    const [selectedInvitation, setSelectedInvitation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tabFromUrl = params.get('tab');
        if (invitationId && tabFromUrl === 'guests') {
            setActiveTab('guests');
        } else {
            setActiveTab('dashboard');
        }
    }, [invitationId, location.search]); 

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (invitationId) {
                const response = await api.get(`/invitations/${invitationId}`);
                setSelectedInvitation(response.data.data || null);
            } else {
                const response = await api.get('/invitations');
                setMyInvitations(response.data.data || []);
                setSelectedInvitation(null);
            }
        } catch (error) {
            showErrorToast("Tải dữ liệu thất bại. Vui lòng thử lại.");
            if (error.response?.status === 401) navigate('/sign-in');
        } finally {
            setLoading(false);
        }
    }, [invitationId, navigate]);
    
    useEffect(() => { fetchData(); }, [fetchData]);

    const handleDelete = async (idToDelete) => {
        if (!idToDelete) return;
        const promise = api.delete(`/invitations/${idToDelete}`);
        handlePromiseToast(promise, {
            pending: "Đang xóa thiệp mời...", success: "Xóa thiệp mời thành công!", error: "Xóa thất bại!"
        }).then(() => navigate('/invitation-management'));
    };

    const handleManageClick = (invitation) => {
        if (invitation?._id) navigate(`/invitation-management/${invitation._id}`);
    };
    
    const handleDataChange = useCallback((data, type) => {
        setSelectedInvitation(currentInvitation => {
            if (!currentInvitation) return null;
            const newInvitation = _.cloneDeep(currentInvitation);
            switch(type) {
                case 'update-settings':
                    return _.cloneDeep(data);

                case 'update-tasks': // <--- THÊM CASE NÀY ĐỂ XỬ LÝ UPDATE LOCAL STATE CHO TASK
                    newInvitation.tasks = data;
                    return newInvitation;

                case 'add-guest':
                    newInvitation.guests = [...(newInvitation.guests || []), data];
                    return newInvitation;

                case 'update-guest':
                    newInvitation.guests = (newInvitation.guests || []).map(g =>
                        g._id === data._id ? data : g
                    );
                    return newInvitation;
                case 'delete-guest':
                    newInvitation.guests = (newInvitation.guests || []).filter(g => g._id !== data);
                    return newInvitation;
                case 'bulk-email-sending':
                    const guestIdsSending = new Set(data);
                    newInvitation.guests = (newInvitation.guests || []).map(g => {
                        if (guestIdsSending.has(g._id)) {
                            return { ...g, emailStatus: 'Đang gửi...' };
                        }
                        return g;
                    });
                    return newInvitation;
                case 'add-group':
                    newInvitation.guestGroups = [...(newInvitation.guestGroups || []), data];
                    return newInvitation;
                case 'update-group':
                     newInvitation.guestGroups = (newInvitation.guestGroups || []).map(g =>
                        g._id === data._id ? data : g
                    );
                    return newInvitation;
                case 'delete-group':
                    newInvitation.guestGroups = (newInvitation.guestGroups || []).filter(g => g._id !== data);
                    newInvitation.guests = (newInvitation.guests || []).map(guest => {
                        if (guest.group === data) {
                            return { ...guest, group: null };
                        }
                        return guest;
                    });
                    return newInvitation;
                case 'add-guests-bulk': {
                    const newGuests = _.cloneDeep(data);
                    const promise = api.post(`/invitations/${currentInvitation._id}/guests/bulk`, { guests: newGuests });
                    handlePromiseToast(promise, {
                        pending: 'Đang thêm khách mời từ danh bạ...',
                        success: 'Thêm khách mời thành công!',
                        error: 'Thêm khách mời thất bại!'
                    }).then(response => {
                        fetchData();
                    });
                    return currentInvitation;
                }
                default:
                    if (process.env.NODE_ENV === 'development') {
                        console.error(`Lỗi: Kiểu cập nhật dữ liệu chưa được xử lý: ${type}`);
                    }
                    return currentInvitation;
            }
        });
    }, [fetchData]);


    if (loading) return <div className="container"><p>Đang tải dữ liệu...</p></div>;

    return (
        <main className="management-page-wrapper">
            {selectedInvitation ? (
                <InvitationDetailView
                    invitation={selectedInvitation}
                    onGoBack={() => navigate('/invitation-management')}
                    onDelete={handleDelete}
                    onDataChange={handleDataChange} 
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
            ) : (
                <InvitationListView
                    invitations={myInvitations}
                    onManageClick={handleManageClick}
                />
            )}
        </main>
    );
};

export default InvitationManagement;