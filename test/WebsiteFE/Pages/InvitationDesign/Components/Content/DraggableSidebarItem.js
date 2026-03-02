// src/Pages/InvitationDesign/Components/Content/DraggableSidebarItem.js

import { useDraggable } from '@dnd-kit/core';

function DraggableSidebarItem({ data, children }) {
    // Chính xác: Không lấy `transform` từ hook này nữa
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `draggable-${data.id}`,
        data: data,
    });

    // Chính xác: Style object không còn thuộc tính `transform`
    const style = {
        opacity: isDragging ? 0.5 : 1,
        transition: 'opacity 0.2s ease',
        cursor: 'grab',
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
            {children}
        </div>
    );
}

export default DraggableSidebarItem;