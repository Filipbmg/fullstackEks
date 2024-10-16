const connectedUsers = {};
const notes = {};

function socketHandler(io) {
    io.on("connection", (socket) => {
        socket.on("register-user", (userId) => {
            connectedUsers[userId] = socket.id;
        });

        socket.on("join-note", (noteId) => {
            socket.join(noteId);

            if (notes[noteId]) {
                socket.emit("note-update", notes[noteId]); // Note the change here
            }
        });
        socket.on("update-note", (noteId, noteData) => { // Note the change here
            notes[noteId] = noteData; // Update the note data in the in-memory store
            socket.to(noteId).emit("note-update", noteData); // Broadcast the update to other users in the same room
        });

        socket.on("disconnect", () => {
            for (const userId in connectedUsers) {
                if (connectedUsers[userId] === socket.id) {
                    delete connectedUsers[userId];
                    break;
                }
            }
        });
    });
}

export default socketHandler;