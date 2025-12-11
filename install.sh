#!/usr/bin/env sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REPO="BlakeASmith/nag"
INSTALL_DIR="${HOME}/.local/bin"
BINARY_NAME="nag"

# Error handling
error() {
    echo "${RED}Error: $1${NC}" >&2
    exit 1
}

info() {
    echo "${GREEN}$1${NC}"
}

warn() {
    echo "${YELLOW}Warning: $1${NC}"
}

# Check for curl
if ! command -v curl >/dev/null 2>&1; then
    error "curl is required but not installed. Please install curl first."
fi

# Create install directory if it doesn't exist
mkdir -p "${INSTALL_DIR}" || error "Failed to create install directory: ${INSTALL_DIR}"

# Detect OS and architecture
OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"

case "${ARCH}" in
    x86_64) ARCH="amd64" ;;
    arm64|aarch64) ARCH="arm64" ;;
    *) error "Unsupported architecture: ${ARCH}" ;;
esac

# Download URL (adjust based on your release structure)
# This assumes GitHub releases with format: nag-{OS}-{ARCH}
VERSION="${VERSION:-latest}"
if [ "${VERSION}" = "latest" ]; then
    DOWNLOAD_URL="https://github.com/${REPO}/releases/latest/download/${BINARY_NAME}-${OS}-${ARCH}"
else
    DOWNLOAD_URL="https://github.com/${REPO}/releases/download/${VERSION}/${BINARY_NAME}-${OS}-${ARCH}"
fi

BINARY_PATH="${INSTALL_DIR}/${BINARY_NAME}"
TEMP_FILE="$(mktemp)"

info "Downloading ${BINARY_NAME}..."
if ! curl -fsSL "${DOWNLOAD_URL}" -o "${TEMP_FILE}"; then
    rm -f "${TEMP_FILE}"
    error "Failed to download ${BINARY_NAME} from ${DOWNLOAD_URL}"
fi

# Make binary executable
chmod +x "${TEMP_FILE}" || error "Failed to make binary executable"

# Move to final location
mv "${TEMP_FILE}" "${BINARY_PATH}" || error "Failed to install ${BINARY_NAME} to ${BINARY_PATH}"

info "Successfully installed ${BINARY_NAME} to ${BINARY_PATH}"

# Check if install directory is in PATH
if ! echo "${PATH}" | grep -q "${INSTALL_DIR}"; then
    warn "${INSTALL_DIR} is not in your PATH"
    echo "Add the following to your shell configuration file (~/.bashrc, ~/.zshrc, etc.):"
    echo "  export PATH=\"\${HOME}/.local/bin:\${PATH}\""
fi

# Verify installation
if command -v "${BINARY_NAME}" >/dev/null 2>&1; then
    info "${BINARY_NAME} is ready to use!"
else
    warn "Please restart your shell or run: export PATH=\"\${HOME}/.local/bin:\${PATH}\""
fi
