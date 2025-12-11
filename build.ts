#!/usr/bin/env bun

import { mkdir, rm, rename } from "fs/promises";
import { chmod } from "fs/promises";
import { existsSync } from "fs";

// Colors for output
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";

const BINARY_NAME = "nag";
const BUILD_DIR = "dist";
const VERSION = process.argv[2] || "dev";

// Platform configurations
const PLATFORMS = [
  { os: "linux", arch: "amd64", target: "bun-linux-x64" },
  { os: "linux", arch: "arm64", target: "bun-linux-arm64" },
  { os: "darwin", arch: "amd64", target: "bun-darwin-x64" },
  { os: "darwin", arch: "arm64", target: "bun-darwin-arm64" },
] as const;

async function build() {
  console.log(`${GREEN}Building ${BINARY_NAME} v${VERSION}...${RESET}`);

  // Clean previous builds
  if (existsSync(BUILD_DIR)) {
    await rm(BUILD_DIR, { recursive: true, force: true });
  }
  await mkdir(BUILD_DIR, { recursive: true });

  // Build for each platform
  for (const platform of PLATFORMS) {
    const { os, arch, target } = platform;
    console.log(`${YELLOW}Building for ${os}/${arch}...${RESET}`);

    const output = `${BUILD_DIR}/${BINARY_NAME}-${os}-${arch}`;

    try {
      // Use Bun's build API with compile option
      // Note: outfile is specified but compile may output to a different location
      const result = await Bun.build({
        entrypoints: ["index.ts"],
        outfile: output,
        target,
        minify: true,
        compile: {
          autoloadTsconfig: true,
          autoloadPackageJson: true,
          autoloadDotenv: false,
          autoloadBunfig: false,
        },
      });

      if (!result.success) {
        console.error(`Failed to build for ${os}/${arch}:`);
        result.logs.forEach((log) => console.error(log));
        process.exit(1);
      }

      if (result.outputs.length === 0) {
        console.error(`No output files generated for ${os}/${arch}`);
        process.exit(1);
      }

      // Get the actual compiled file and move it to the desired location
      const compiledFile = result.outputs[0].path;
      if (compiledFile !== output) {
        await rename(compiledFile, output);
      }

      // Make executable (chmod +x)
      await chmod(output, 0o755);

      console.log(`${GREEN}✓ Built ${output}${RESET}`);
    } catch (error) {
      console.error(`Error building for ${os}/${arch}:`, error);
      process.exit(1);
    }
  }

  console.log(`${GREEN}All builds complete!${RESET}`);
  console.log(`Binaries are in ${BUILD_DIR}/`);
}

build().catch((error) => {
  console.error("Build failed:", error);
  process.exit(1);
});
