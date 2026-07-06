"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const supabase_1 = require("./lib/supabase");
async function inspect() {
    const { data, error } = await supabase_1.supabase
        .from('organizations')
        .select('*')
        .limit(1);
    if (error) {
        console.error('Error fetching organization:', error);
        return;
    }
    if (data && data.length > 0) {
        console.log('Columns in organizations table:', Object.keys(data[0]));
    }
    else {
        console.log('No organizations found to inspect.');
    }
}
inspect();
