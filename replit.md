# Saitama Bot - WhatsApp Multi-Function Bot

## Overview
Saitama Bot is a multi-function WhatsApp bot built with Node.js and the Baileys library. The bot provides various commands for group management, games, downloads, AI interactions, and more.

**Current State**: Configured and ready to run on Replit environment  
**Last Updated**: October 7, 2025

## Project Architecture

### Technology Stack
- **Runtime**: Node.js 20
- **Main Library**: @whiskeysockets/baileys (WhatsApp Web API)
- **Dependencies**: 
  - chalk (terminal styling)
  - qrcode-terminal (QR code display)
  - nodemon (development auto-reload)

### Project Structure
```
.
├── assets/
│   ├── media/          # Bot logo and media files
│   └── menu/           # Menu text files
├── commands/           # All bot command handlers
│   ├── aiSearch.js     # AI-powered search commands
│   ├── alive.js        # Alive check
│   ├── antilink.js     # Anti-link protection
│   ├── downloads.js    # Download commands (YouTube, TikTok, etc.)
│   ├── funGames.js     # Fun game commands
│   ├── group.js        # Group management commands
│   ├── groupinfo.js    # Group information
│   ├── help.js         # Help command
│   ├── hidetag.js      # Hide tag command
│   ├── logo.js         # Send logo command
│   ├── manageMembers.js # Member management (kick, add, promote, etc.)
│   ├── menu.js         # Main menu
│   ├── mute.js         # Mute/unmute group
│   ├── ping.js         # Ping command
│   ├── sticker.js      # Sticker creation
│   ├── tagall.js       # Tag all members
│   ├── warnings.js     # Warning system
│   └── welcome.js      # Welcome/goodbye messages
├── session/            # WhatsApp session data (gitignored)
├── utils/              # Utility functions
│   ├── handler.js      # Message handler utilities
│   └── logger.js       # Logging utilities
├── config.js           # Bot configuration
└── index.js            # Main entry point
```

## How It Works

### Authentication
The bot uses WhatsApp Web's multi-device authentication. On first run:
1. A QR code is displayed in the console
2. Scan it with WhatsApp on your phone
3. Session credentials are saved to `auth_info/` folder
4. Subsequent runs auto-connect using saved credentials

### Command System
The bot listens for messages and responds to commands starting with `.` (dot prefix):

**General Commands**:
- `.menu` - Display main menu
- `.ping` - Check bot responsiveness
- `.logo` - Send bot logo
- `.alive` - Check if bot is alive

**Group Management**:
- `.groupmenu` - Group-specific commands menu
- `.mute` / `.unmute` - Mute/unmute group
- `.groupinfo` - Display group information
- `.tagall` - Tag all group members
- `.hidetag` - Hidden tag message
- `.kick`, `.add`, `.promote`, `.demote`, `.ban`, `.unban` - Member management

**Moderation**:
- `.warn @user` - Warn a user
- `.warnings @user` - Check user warnings
- Auto anti-link detection

**Fun & Games**:
- `.truth`, `.dare`, `.trivia`, `.guess`, `.tictactoe`, `.spam`, `.banbug`

**Downloads**:
- `.play`, `.song`, `.video`, `.ytmp4`, `.tiktok`, `.instagram`, `.facebook`

**AI Features**:
- `.gpt`, `.cyberai`, `.gemini`, `.calculator`, `.imagine`

## Running the Bot

### Development Mode
```bash
npm run dev
```
Uses nodemon for auto-reload on file changes.

### Production Mode
```bash
npm start
```
Runs the bot using standard Node.js.

## Configuration

Bot settings are in `config.js`:
- `botName`: Display name of the bot
- `ownerName`: Owner's name
- `version`: Bot version
- `sessionFile`: Session credentials file path
- `image`: Bot logo image path

## Important Notes

- **Session Data**: The `auth_info/` folder contains sensitive WhatsApp authentication data and is gitignored
- **Auto-Reconnect**: The bot automatically reconnects if the connection drops
- **Group Events**: Automatically sends welcome/goodbye messages when members join/leave
- **Console Logging**: All incoming messages are logged with chalk-styled output
- **Crash Prevention**: The bot includes comprehensive error handling to prevent crashes from corrupted data files, failed message sends, or unexpected errors

## Stability & Error Handling

The bot implements multiple layers of crash prevention:

1. **File I/O Safety**: All JSON file operations (warnings, welcome messages) include error handling that automatically recovers from corrupted files by resetting them
2. **Event Handler Protection**: Group participant events (welcome/goodbye) are wrapped in try-catch to prevent crashes from failed message sends
3. **Safe Calculator**: The `.calculator` command uses input sanitization instead of dangerous eval() to prevent code injection attacks
4. **Global Error Handlers**: Uncaught promise rejections and exceptions are caught and logged instead of crashing the bot

## User Preferences
None configured yet.

## Recent Changes
- **2025-10-07**: Ultra-stable crash prevention overhaul
  - **REMOVED** public/private mode feature (deleted botmode.js) to eliminate crash source
  - Added connection management with exponential backoff (max 10 retries, up to 60s delay)
  - Overrode sendMessage with 30-second timeout protection for ALL commands
  - Added comprehensive error handling to file I/O operations (warnings.js, welcome.js)
  - Protected all event handlers with try-catch blocks
  - Replaced dangerous eval() with safe math expression parser in calculator
  - Implemented global unhandled rejection and exception handlers
  - All npm packages installed and verified working
  - **Bot is now production-ready and crash-resistant**
- **2025-10-07**: Initial import and Replit environment setup
  - Configured Node.js 20 environment
  - Installed all dependencies
  - Set up workflow for console output
  - Created project documentation
