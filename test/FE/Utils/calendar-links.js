// src/Utils/calendar-links.js

/**
 * Chuyển đổi ngày và giờ địa phương thành chuỗi UTC theo định dạng YYYYMMDDTHHMMSSZ.
 * @param {string} dateStr - Chuỗi ngày (ví dụ: '2025-08-18')
 * @param {string} timeStr - Chuỗi giờ (ví dụ: '17:30')
 * @returns {string} - Chuỗi ngày giờ UTC đã định dạng.
 */
const formatUtcDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return '';
    const date = new Date(`${dateStr}T${timeStr}`);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

/**
 * Tạo liên kết để thêm sự kiện vào Google Calendar.
 */
export const generateGoogleCalendarLink = (event) => {
    if (!event) return '#';
    const startTime = formatUtcDateTime(event.date, event.time);
    // Giả sử sự kiện kéo dài 2 tiếng
    const endTime = formatUtcDateTime(event.date, `${parseInt(event.time.split(':')[0]) + 2}:${event.time.split(':')[1]}`);

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: event.title,
        dates: `${startTime}/${endTime}`,
        details: `Thông tin chi tiết sự kiện: ${event.address}.`,
        location: event.address,
        ctz: 'Asia/Ho_Chi_Minh'
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Tạo liên kết để thêm sự kiện vào Outlook Calendar (Web).
 */
export const generateOutlookCalendarLink = (event) => {
    if (!event) return '#';
    const startTime = new Date(`${event.date}T${event.time}`).toISOString();
     const endTime = new Date(new Date(`${event.date}T${event.time}`).getTime() + 2 * 60 * 60 * 1000).toISOString();

    const params = new URLSearchParams({
        path: '/calendar/action/compose',
        rru: 'addevent',
        startdt: startTime,
        enddt: endTime,
        subject: event.title,
        location: event.address,
        body: `Thông tin chi tiết sự kiện: ${event.address}.`
    });
    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
};

/**
 * Tạo và kích hoạt tải xuống file .ics cho Apple Calendar, Outlook Desktop, v.v.
 */
export const downloadIcsFile = (event) => {
    if (!event) return;
    const startTime = formatUtcDateTime(event.date, event.time).replace('Z', '');
    const endTime = formatUtcDateTime(event.date, `${parseInt(event.time.split(':')[0]) + 2}:${event.time.split(':')[1]}`).replace('Z', '');

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//iCards//Online Invitation//EN',
        'BEGIN:VEVENT',
        `UID:${new Date().getTime()}@icards.com.vn`,
        `DTSTAMP:${formatUtcDateTime(new Date().toISOString().split('T')[0], new Date().toTimeString().split(' ')[0]).replace('Z', '')}`,
        `DTSTART;TZID=Asia/Ho_Chi_Minh:${startTime}`,
        `DTEND;TZID=Asia/Ho_Chi_Minh:${endTime}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:Thông tin chi tiết sự kiện: ${event.address}.`,
        `LOCATION:${event.address}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${event.title.replace(/ /g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};