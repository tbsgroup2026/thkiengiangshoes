#!/bin/bash
# ============================================================
# INSTALL PRIVATE ADMIN APP TO CONNECTED PHYSICAL IPHONE 13
# ============================================================

echo "🚀 Starting installation of TBS Group Admin App to connected iPhone 13..."

# 1. Detect connected iOS Device ID via idevice_id or xcrun devicectl
DEVICE_ID=$(xcrun xctrace list devices 2>&1 | grep -i "iPhone" | head -n 1 | awk '{print $NF}' | tr -d '()')

if [ -z "$DEVICE_ID" ]; then
    echo "⚠️ Warning: No iPhone device detected via USB. Please connect your iPhone 13 via USB and tap 'Trust This Computer'."
    echo "Current connected devices list:"
    xcrun xctrace list devices
    exit 1
fi

echo "✅ Detected connected iPhone 13 (Device ID: $DEVICE_ID)"

# 2. Build and install using xcodebuild
echo "🔨 Compiling & Installing TBSGroupAdmin.app..."
xcodebuild -project ios-admin/TBSGroupAdmin.xcodeproj \
           -scheme TBSGroupAdmin \
           -destination "id=$DEVICE_ID" \
           -configuration Debug \
           DEVELOPMENT_TEAM="" \
           CODE_SIGN_IDENTITY="Apple Development" \
           CODE_SIGNING_REQUIRED=YES \
           CODE_SIGNING_ALLOWED=YES \
           build-for-testing install

echo "🎉 Installed TBS Group Admin App onto iPhone 13 successfully!"
