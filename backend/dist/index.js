"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const invoice_routes_1 = __importDefault(require("./routes/invoice.routes"));
const client_routes_1 = __importDefault(require("./routes/client.routes"));
const business_routes_1 = __importDefault(require("./routes/business.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const errorHandler_1 = require("./middlewares/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: '*', // In production, replace with your frontend URL
    },
});
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/invoices', invoice_routes_1.default);
app.use('/api/clients', client_routes_1.default);
app.use('/api/business', business_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
app.use('/api/ai', ai_routes_1.default);
// Socket.io Connection
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('join-business', (businessId) => {
        socket.join(businessId);
        console.log(`Socket ${socket.id} joined business ${businessId}`);
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});
// Attach IO to request for use in controllers
app.set('io', io);
// Error Handling
app.use(errorHandler_1.errorHandler);
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
    console.log(`🚀 InvoiceOS Backend running on http://localhost:${PORT}`);
});
