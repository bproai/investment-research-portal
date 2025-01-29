import React from 'react';

const StickyNote = ({ note, onDelete }) => {
  return (
    <div
      className="group relative p-4 rounded-lg shadow-md transform hover:scale-105 transition-transform"
      style={{ backgroundColor: note.color }}
    >
      <button
        onClick={() => onDelete(note.id)}
        className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center 
                 bg-red-500 text-white rounded-full 
                 opacity-0 group-hover:opacity-100 transition-opacity
                 hover:bg-red-600 transform hover:scale-110"
        aria-label="Delete note"
      >
        ×
      </button>
      <p className="text-gray-800 whitespace-pre-wrap">{note.content}</p>
      <div className="mt-2 text-xs text-gray-600">
        {new Date(note.created_at).toLocaleDateString()}
      </div>
    </div>
  );
};

export default StickyNote;