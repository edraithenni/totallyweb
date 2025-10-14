import { useEffect, useState, useRef } from "react";

export default function NotificationBell({ userId, maxNotifications = 10 }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);
  const NOTIF_KEY = "notifications_recent";

  useEffect(() => {
    if (!userId) return;

    const saved = localStorage.getItem(NOTIF_KEY);
    if (saved) setNotifications(JSON.parse(saved));

    const connect = () => {
      if (wsRef.current) return;

      const ws = new WebSocket(`ws://localhost:8080/ws?user_id=${userId}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WS connected:", userId);
      };

      ws.onclose = (e) => {
        console.warn("WS closed:", e.code, e.reason);
        wsRef.current = null;
        reconnectTimer.current = setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.error("WS error:", err);
        ws.close();
      };

      ws.onmessage = (event) => {
        let data;
        try {
          data = JSON.parse(event.data);
        } catch {
          data = { text: event.data };
        }

        setNotifications((prev) => {
          const updated = [...prev, data].slice(-maxNotifications);
          localStorage.setItem(NOTIF_KEY, JSON.stringify(updated));
          return updated;
        });

        setUnreadCount((prev) => prev + 1);
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [userId]);

  const toggleDropdown = () => {
    setOpen((o) => !o);
    if (!open) setUnreadCount(0);
  };

  return (
    <div className="notif-container">
      <button className="notif-btn" onClick={toggleDropdown}>
        <img src="/src/mail-pink.png" alt="notifications" />
        {unreadCount > 0 && <span className="notif-count">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-dropdown">
          {notifications.length === 0 ? (
            <div className="notif-empty">No new notifications</div>
          ) : (
            notifications
              .slice()
              .reverse()
              .map((n, i) => (
                <div key={i} className="notif-item">
                  {n.text}
                </div>
              ))
          )}
        </div>
      )}

      <style jsx>{`
        .notif-container {
          position: absolute;
          top: 15px;
          right: 15px;
          z-index: 10;
        }
        .notif-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          position: relative;
          padding: 0;
        }
        .notif-btn img {
          width: 36px;
          height: 36px;
          object-fit: contain;
        }
        .notif-count {
          position: absolute;
          top: -5px;
          right: -6px;
          background: #ff4d8b;
          color: #fff;
          border-radius: 50%;
          font-size: 0.7rem;
          padding: 2px 6px;
          font-weight: bold;
        }
        .notif-dropdown {
          position: absolute;
          right: 0;
          background: #0a1b31;
          border: 1px solid #3a3a90;
          width: 260px;
          max-height: 300px;
          overflow-y: auto;
          margin-top: 6px;
          z-index: 100;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        }
        .notif-item {
          padding: 8px 10px;
          border-bottom: 1px solid #3a3a90;
          color: #fff;
        }
        .notif-item:last-child {
          border-bottom: none;
        }
        .notif-empty {
          padding: 8px 10px;
          color: #aaa;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
