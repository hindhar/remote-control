#!/usr/bin/env python3
"""
Samsung TV Remote with persistent authentication
Saves token after first auth so you never need to approve again
"""

import asyncio
import json
import base64
import ssl
import os
import sys

TV_IP = "192.168.0.135"
TV_PORT = 8002
APP_NAME = "PythonRemote"
TOKEN_FILE = os.path.join(os.path.dirname(__file__), ".samsung_token")

# App IDs (for direct launch - may not work for all apps)
APPS = {
    "iplayer": "3201602007865",
    "netflix": "3201907018807",
    "youtube": "111299001912",
    "prime": "3201910019365",
    "disney": "3201901017640",
}

# App positions on HOME screen main row (0-indexed, from left)
# After pressing HOME, go DOWN to main row, then RIGHT this many times
APP_POSITIONS = {
    "smartthings": 0,
    "samsung_tv_plus": 1,
    "netflix": 2,
    "prime": 3,
    "iplayer": 4,
    "itvx": 5,
    "disney": 6,
    "now": 7,
    "rakuten": 8,
    "youtube": 9,
    "alexa": 10,
    "channel4": 11,
}


def load_token():
    """Load saved token from file"""
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, "r") as f:
            return f.read().strip()
    return None


def save_token(token):
    """Save token to file for future use"""
    with open(TOKEN_FILE, "w") as f:
        f.write(token)
    print(f"✅ Token saved - no more permission prompts needed!")


class SamsungTV:
    def __init__(self):
        self.ws = None
        self.token = load_token()
        self._connected = False

    async def connect(self):
        if self._connected:
            return True

        try:
            import websockets
        except ImportError:
            print("pip install websockets")
            return False

        name_b64 = base64.b64encode(APP_NAME.encode()).decode()
        url = f"wss://{TV_IP}:{TV_PORT}/api/v2/channels/samsung.remote.control?name={name_b64}"

        if self.token:
            url += f"&token={self.token}"
            print("🔑 Using saved token...")
        else:
            print("⚠️  No saved token - check TV for permission prompt!")

        ssl_ctx = ssl.create_default_context()
        ssl_ctx.check_hostname = False
        ssl_ctx.verify_mode = ssl.CERT_NONE

        try:
            self.ws = await websockets.connect(url, ssl=ssl_ctx, open_timeout=10)
            response = await asyncio.wait_for(self.ws.recv(), timeout=15)
            data = json.loads(response)

            if data.get("event") == "ms.channel.connect":
                new_token = data.get("data", {}).get("token")
                if new_token and new_token != self.token:
                    self.token = new_token
                    save_token(new_token)
                self._connected = True
                print("✅ Connected to TV")
                return True
        except Exception as e:
            print(f"❌ Connection failed: {e}")
            return False

    async def key(self, key_name: str, delay: float = 0.3):
        """Send a key press"""
        if not self._connected:
            await self.connect()

        if not key_name.startswith("KEY_"):
            key_name = f"KEY_{key_name.upper()}"

        payload = {
            "method": "ms.remote.control",
            "params": {
                "Cmd": "Click",
                "DataOfCmd": key_name,
                "Option": "false",
                "TypeOfRemote": "SendRemoteKey",
            },
        }
        await self.ws.send(json.dumps(payload))
        await asyncio.sleep(delay)

    async def text(self, text: str):
        """Send text input"""
        if not self._connected:
            await self.connect()

        text_b64 = base64.b64encode(text.encode()).decode()
        payload = {
            "method": "ms.remote.control",
            "params": {
                "Cmd": text_b64,
                "DataOfCmd": "base64",
                "TypeOfRemote": "SendInputString",
            },
        }
        await self.ws.send(json.dumps(payload))
        await asyncio.sleep(0.5)

    async def app(self, app_id: str):
        """Launch an app"""
        if not self._connected:
            await self.connect()

        # Resolve app name to ID
        app_id = APPS.get(app_id.lower(), app_id)

        payload = {
            "method": "ms.channel.emit",
            "params": {
                "event": "ed.apps.launch",
                "to": "host",
                "data": {"appId": app_id, "action_type": "DEEP_LINK"},
            },
        }
        await self.ws.send(json.dumps(payload))
        await asyncio.sleep(1)

    async def close(self):
        if self.ws:
            await self.ws.close()


async def navigate_to_app(tv, app_name: str):
    """Navigate to an app on the home screen using saved positions"""
    app_key = app_name.lower().replace(" ", "_").replace("+", "")
    position = APP_POSITIONS.get(app_key)

    if position is None:
        print(f"❌ Unknown app: {app_name}")
        return False

    print(f"  → Going to Home")
    await tv.key("HOME", 2)

    print(f"  → Moving DOWN to main app row")
    await tv.key("DOWN", 0.5)

    print(f"  → Moving RIGHT {position} times to {app_name}")
    for i in range(position):
        await tv.key("RIGHT", 0.3)

    print(f"  → Launching {app_name}")
    await tv.key("ENTER", 3)

    return True


async def play_match_of_the_day():
    """Automate playing Match of the Day on BBC iPlayer"""
    tv = SamsungTV()

    if not await tv.connect():
        return

    print("\n📺 Playing Match of the Day...")

    # Navigate to iPlayer using home screen position
    if not await navigate_to_app(tv, "iplayer"):
        await tv.close()
        return

    # Wait for iPlayer to load
    print("  → Waiting for iPlayer to load...")
    await asyncio.sleep(5)

    # Navigate to search in iPlayer
    # iPlayer layout: search is typically accessible from top menu
    print("  → Opening search")
    await tv.key("UP", 0.5)
    await tv.key("UP", 0.5)
    # Search icon should be on the right
    for _ in range(5):
        await tv.key("RIGHT", 0.3)
    await tv.key("ENTER", 2)

    # Type search
    print("  → Searching for 'Match of the Day'")
    await tv.text("Match of the Day")
    await asyncio.sleep(3)

    # Navigate to results
    print("  → Selecting result")
    await tv.key("DOWN", 0.5)
    await tv.key("DOWN", 0.5)
    await tv.key("ENTER", 3)

    # Play the episode
    print("  → Playing")
    await tv.key("ENTER", 1)

    print("\n✅ Done!")
    await tv.close()


async def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python samsung_remote.py auth        - Authorize (do this first!)")
        print("  python samsung_remote.py motd        - Play Match of the Day")
        print("  python samsung_remote.py key <KEY>   - Send key (e.g., HOME, ENTER)")
        print("  python samsung_remote.py app <APP>   - Launch app (iplayer, netflix, youtube)")
        return

    cmd = sys.argv[1].lower()
    tv = SamsungTV()

    if cmd == "auth":
        print("Authorizing... Accept on TV remote when prompted!")
        if await tv.connect():
            print("✅ Authorization complete! Token saved.")
        await tv.close()

    elif cmd == "motd":
        await play_match_of_the_day()

    elif cmd == "key" and len(sys.argv) > 2:
        await tv.connect()
        await tv.key(sys.argv[2])
        await tv.close()

    elif cmd == "app" and len(sys.argv) > 2:
        await tv.connect()
        await tv.app(sys.argv[2])
        await tv.close()

    else:
        print(f"Unknown command: {cmd}")


if __name__ == "__main__":
    asyncio.run(main())
