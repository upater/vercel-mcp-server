# MCP Cursor Tool Starter

This is a starter project for creating a Cursor tool using the MCP framework.

https://github.com/modelcontextprotocol/typescript-sdk

## Prerequisites

- Node.js 23+ (or Bun/Deno/Anything that supports running .ts files)

## Installation

```bash
npm install
```

## Usage

```bash
node src/index.ts
```

## Cursor Notes

Always use the full path to commands when running in other tools, i.e. Cursor.

For Cursor, you can use the following command to get the full path to the node executable:

```bash
which node | pbcopy 
```

Since I installed node using npm, my full command in Cursor looks like this:

```
/Users/johnlindquist/Library/pnpm/nodejs/22.13.1/bin/node ~/dev/mcp-cursor-tool-starter/src/index.ts
```

