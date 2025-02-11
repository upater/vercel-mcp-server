import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const execAsync = promisify(exec);

// Create an MCP server instance
const server = new McpServer({
  name: "github-tools",
  version: "1.0.0",
});

// Register the "create-issue" tool
server.tool(
  "create-issue",
  "Create a new GitHub issue using gh cli",
  {
    cwd: z
      .string()
      .min(1)
      .describe(
        "The root directory of the GitHub project where the issue should be created"
      ),
    title: z.string().min(1).describe("The title of the issue"),
    body: z
      .string()
      .optional()
      .describe("The body content of the issue in markdown format"),
  },
  async ({ cwd, title, body }) => {
    let tempFilePath: string | undefined;
    const originalCwd = process.cwd();

    try {
      // Change to the target directory
      process.chdir(cwd);

      // You'll need to install the gh cli through homebrew for this to work on your machine
      // When building for others, you may need to expose the path to executables through args
      const command = [
        "/opt/homebrew/bin/gh",
        "issue",
        "create",
        "--title",
        `"${title}"`,
      ];

      if (body) {
        // Create temp file with .md extension for proper handling
        tempFilePath = join(tmpdir(), `issue-body-${Date.now()}.md`);
        await writeFile(tempFilePath, body, "utf8");
        command.push("--body-file", tempFilePath);
      }

      const { stdout } = await execAsync(command.join(" "));
      // gh outputs the issue URL as the last line
      const url = stdout.trim().split("\n").pop() || "";

      return {
        content: [
          {
            type: "text",
            text: `Successfully created issue: ${url}`,
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create issue: ${errorMessage}`);
    } finally {
      // Clean up temp file if it was created
      if (tempFilePath) {
        await unlink(tempFilePath).catch(() => {
          // Ignore cleanup errors
        });
      }
      // Always restore the original working directory
      process.chdir(originalCwd);
    }
  }
);

// Start the server using stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("GitHub MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
