#!/usr/bin/env python3
"""
Automated BBC iPlayer playback for Samsung TV
Launches iPlayer, searches for content, and plays it
"""

import asyncio
import json
import base64
import ssl
import sys

TV_IP = "192.168.0.135"
TV_PORT = 8002
APP_NAME = "PythonRemote"

# BBC iPlayer app ID for Samsung
IPLAYER_APP_ID = "3201602007865"


class SamsungTVAutomation:
    def __init__(self):
        self.ws = None
        self.token = None

    async def connect(self):
        try:
            import websockets
        except ImportError:
            print("Install: pip install websockets")
            return False

        name_b64 = base64.b64encode(APP_NAME.encode()).decode()
        url = f"wss://{TV_IP}:{TV_PORT}/api/v2/channels/samsung.remote.control?name={name_b64}"
        if self.token:
            url += f"&token={self.token}"

        ssl_ctx = ssl.create_default_context()
        ssl_ctx.check_hostname = False
        ssl_ctx.verify_mode = ssl.CERT_NONE

        print(f"Connecting to TV...")
        self.ws = await websockets.connect(url, ssl=ssl_ctx)

        response = await asyncio.wait_for(self.ws.recv(), timeout=10)
        data = json.loads(response)

        if data.get("event") == "ms.channel.connect":
            self.token = data.get("data", {}).get("token")
            print("Connected!")
            return True
        return False

    async def send_key(self, key: str, delay: float = 0.3):
        """Send a key press"""
        if not key.startswith("KEY_"):
            key = f"KEY_{key.upper()}"

        payload = {
            "method": "ms.remote.control",
            "params": {
                "Cmd": "Click",
                "DataOfCmd": key,
                "Option": "false",
                "TypeOfRemote": "SendRemoteKey",
            },
        }
        await self.ws.send(json.dumps(payload))
        print(f"  Key: {key}")
        await asyncio.sleep(delay)

    async def send_text(self, text: str):
        """Send text input to the TV"""
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
        print(f"  Text: {text}")
        await asyncio.sleep(0.5)

    async def launch_app(self, app_id: str):
        """Launch an app by ID"""
        payload = {
            "method": "ms.channel.emit",
            "params": {
                "event": "ed.apps.launch",
                "to": "host",
                "data": {
                    "appId": app_id,
                    "action_type": "DEEP_LINK",
                },
            },
        }
        await self.ws.send(json.dumps(payload))
        print(f"  Launched app: {app_id}")

    async def play_iplayer_content(self, search_term: str):
        """
        Automate BBC iPlayer to search and play content
        """
        print(f"\n{'='*50}")
        print(f"Playing: {search_term}")
        print(f"{'='*50}\n")

        # Step 1: Launch BBC iPlayer
        print("1. Launching BBC iPlayer...")
        await self.launch_app(IPLAYER_APP_ID)
        await asyncio.sleep(5)  # Wait for app to load

        # Step 2: Navigate to search
        # iPlayer typically has search in top nav
        print("2. Opening search...")

        # Press up to get to top menu, then navigate to search
        await self.send_key("UP", 0.5)
        await self.send_key("UP", 0.5)
        await self.send_key("UP", 0.5)

        # Look for search - usually on the right side of top nav
        for _ in range(5):
            await self.send_key("RIGHT", 0.3)

        # Enter search
        await self.send_key("ENTER", 1.0)
        await asyncio.sleep(1)

        # Step 3: Type search term
        print(f"3. Searching for '{search_term}'...")
        await self.send_text(search_term)
        await asyncio.sleep(2)

        # Step 4: Navigate to first result and play
        print("4. Selecting first result...")
        await self.send_key("DOWN", 0.5)
        await self.send_key("DOWN", 0.5)
        await self.send_key("ENTER", 2.0)

        # Step 5: Play the content
        print("5. Playing...")
        await asyncio.sleep(2)
        await self.send_key("ENTER", 1.0)

        print("\n Done! Content should be playing.")

    async def close(self):
        if self.ws:
            await self.ws.close()


async def main():
    search_term = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "Match of the Day"

    tv = SamsungTVAutomation()

    try:
        if await tv.connect():
            await tv.play_iplayer_content(search_term)
        else:
            print("Failed to connect to TV")
    finally:
        await tv.close()


if __name__ == "__main__":
    asyncio.run(main())
