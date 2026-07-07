import React, { useState, useRef, useEffect } from "react";
import { FiEdit, FiEye, FiToggleLeft, FiToggleRight, FiTrash2 } from "react-icons/fi";

export default function ActionMenu({
    onView = () => { },
    onEdit = () => { },
    onDelete = () => { },
    onToggleStatus = () => { },
    ariaLabel = "Actions",
    statusLabel = "Activate",
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef();

    useEffect(() => {
        const onDoc = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", onDoc);
        return () => document.removeEventListener("mousedown", onDoc);
    }, []);

    return (
        <div className="action-menu" ref={ref}>
            <button
                aria-label={ariaLabel}
                className="action-menu-button"
                onClick={() => setOpen((s) => !s)}
                type="button"
            >
                <FiEdit />
            </button>

            {open && (
                <div className="action-menu-dropdown">
                    <button type="button" className="action-menu-item" onClick={() => { setOpen(false); onView(); }}>
                        <FiEye /> View
                    </button>
                    <button type="button" className="action-menu-item" onClick={() => { setOpen(false); onEdit(); }}>
                        <FiEdit /> Edit
                    </button>
                    <button type="button" className="action-menu-item" onClick={() => { setOpen(false); onToggleStatus(); }}>
                        <FiToggleLeft /> {statusLabel}
                    </button>
                    <button type="button" className="action-menu-item delete" onClick={() => { setOpen(false); onDelete(); }}>
                        <FiTrash2 /> Delete
                    </button>
                </div>
            )}
        </div>
    );
}
